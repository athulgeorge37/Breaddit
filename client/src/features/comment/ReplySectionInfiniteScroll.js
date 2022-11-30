import "./ReplySectionInfiniteScroll.scss";

import { useInfiniteQuery } from "@tanstack/react-query";
import { get_all_replies_by_comment_id } from "../../rest_api_requests/CommentRequests";
import Loading from "../../components/ui/Loading";
import Comment from "./Comment";

const REPLIES_PER_PAGE = 2;

function ReplySectionInfiniteScroll({ comment_id, post_id }) {
    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        status,
        error,
    } = useInfiniteQuery(
        ["replies_of_comment_id_and_post_id", comment_id, post_id],
        ({ pageParam = 0 }) =>
            get_all_replies_by_comment_id(
                comment_id,
                REPLIES_PER_PAGE,
                pageParam
            ),
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

    const content = data?.pages.map((pg) => {
        // const length_of_replies = pg.all_replies.length;

        return pg.all_replies.map((reply_details, i) => {
            return (
                <Comment
                    key={reply_details.id}
                    comment={reply_details}
                    post_id={post_id}
                    remove_comment_or_reply_from_list={() => {
                        return null;
                    }}
                />
            );
        });
    });

    return (
        <div className="ReplySectionInfiniteScroll">
            {content}

            {isFetchingNextPage && <Loading />}

            <div className="end_of_replies_section">
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
