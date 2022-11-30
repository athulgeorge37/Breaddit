import React from "react";
import Comment from "./Comment";
import "./CommentSectionInfiniteScroll.scss";

import { useRef, useCallback } from "react";

import Loading from "../../components/ui/Loading";

import { useInfiniteQuery } from "@tanstack/react-query";
import { get_all_comments_by_post_id } from "../../rest_api_requests/CommentRequests";

const COMMENTS_PER_PAGE = 2;

function CommentSectionInfiniteScroll({ post_id }) {
    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        status,
        error,
    } = useInfiniteQuery(
        ["comments_of_post_id", post_id],
        ({ pageParam = 0 }) =>
            get_all_comments_by_post_id(post_id, COMMENTS_PER_PAGE, pageParam),
        {
            getNextPageParam: (lastPage, allPages) => {
                // when the last page retrieved has no posts in it
                // we return undefined so hasNextPage becomes false

                // when the last page's posts does have posts in it, it indicates
                // there are more posts, so we set the page number to
                // all_pages.length

                // we do not add 1 since, page numbers in the server start from
                // 0 and go up

                return lastPage.all_comments.length
                    ? allPages.length
                    : undefined;
            },
        }
    );

    const intObserver = useRef();
    const lastCommentRef = useCallback(
        (comment) => {
            // not requesting next page if current page is loading
            if (isFetchingNextPage) {
                return;
            }

            // disconnecting previous intersection observers
            if (intObserver.current) {
                intObserver.current.disconnect();
            }

            // fetching next intersection observer
            intObserver.current = new IntersectionObserver((comments) => {
                if (comments[0].isIntersecting && hasNextPage) {
                    console.log("Fetching more comments");
                    fetchNextPage();
                }
            });

            if (comment) {
                intObserver.current.observe(comment);
            }
        },
        [isFetchingNextPage, fetchNextPage, hasNextPage]
    );

    if (status === "error") {
        return <p>Error: {error}</p>;
    }

    const add_comment_to_list = (new_post_details) => {
        // when adding new_post_details, ensure that
        // it has all the post details including updatedAt and
        // author_details = { username, profile_pic }
        return null;
        // set_all_posts([...all_posts, new_post_details]);
    };

    const content = data?.pages.map((pg) => {
        const length_of_commentss = pg.all_comments.length;

        return pg.all_comments.map((comment_details, i) => {
            if (i + 1 === length_of_commentss) {
                return (
                    <div ref={lastCommentRef} key={comment_details.id}>
                        <Comment
                            comment={comment_details}
                            post_id={post_id}
                            remove_comment_or_reply_from_list={
                                add_comment_to_list
                            }
                        />
                    </div>
                );
            }
            return (
                <div key={comment_details.id}>
                    <Comment
                        comment={comment_details}
                        post_id={post_id}
                        remove_comment_or_reply_from_list={add_comment_to_list}
                    />
                </div>
            );
        });
    });

    return (
        <div className="CommentSectionInfiniteScroll">
            {content}
            {isFetchingNextPage && <Loading />}

            {hasNextPage === false && <p>There are no more comments</p>}
        </div>
    );
}

export default CommentSectionInfiniteScroll;
