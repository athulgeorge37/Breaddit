import "./ReplySectionInfiniteScroll.scss";

import { useInfiniteQuery } from "@tanstack/react-query";
import { get_all_replies } from "../../api/CommentRequests";
import Loading from "../../components/ui/Loading";
import Comment from "./Comment";

const REPLIES_PER_PAGE = 2;

function ReplySectionInfiniteScroll({ comment_id, post_id, sort_by }) {
    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        status,
        error,
    } = useInfiniteQuery(
        ["replies_of_comment_id_and_post_id", comment_id, post_id, sort_by],
        ({ pageParam = 0 }) =>
            get_all_replies(comment_id, REPLIES_PER_PAGE, pageParam, sort_by),
        {
            getNextPageParam: (lastPage, allPages) => {
                // when the last page retrieved has no posts in it
                // we return undefined so hasNextPage becomes false

                // when the last page's posts does have posts in it, it indicates
                // there are more posts, so we set the page number to
                // all_pages.length

                // we do not add 1 since, page numbers in the server start from
                // 0 and go up

                return lastPage.all_replies.length
                    ? allPages.length
                    : undefined;
            },
        }
    );

    if (status === "error") {
        return <p>Error: {error}</p>;
    }

    const list_of_replies = data?.pages.map((pg) => {
        return pg.all_replies.map((reply_details, i) => {
            return (
                <Comment
                    key={reply_details.id}
                    parent_comment_id={comment_id}
                    comment={reply_details}
                    post_id={post_id}
                />
            );
        });
    });

    return (
        <div className="ReplySectionInfiniteScroll">
            {list_of_replies}

            <div className="end_of_replies_section">
                {isFetchingNextPage && <Loading />}

                {hasNextPage ? (
                    <button onClick={fetchNextPage}>Get more replies</button>
                ) : (
                    <p>No more replies left</p>
                )}
            </div>
        </div>
    );
}

export default ReplySectionInfiniteScroll;
