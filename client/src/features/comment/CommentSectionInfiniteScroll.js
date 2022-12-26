import React, { useState } from "react";
import Comment from "./Comment";
import "./CommentSectionInfiniteScroll.scss";

import { useRef, useCallback } from "react";

import Loading from "../../components/ui/Loading";

import { useInfiniteQuery } from "@tanstack/react-query";
import { get_all_comments } from "../../api/CommentRequests";

const COMMENTS_PER_PAGE = 2;
const SORT_BY_OPTIONS = ["TOP", "BOTTOM", "NEW", "OLD"];

function CommentSectionInfiniteScroll({ post_id }) {
    const [sort_by, set_sort_by] = useState(SORT_BY_OPTIONS[0]);

    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        status,
        error,
    } = useInfiniteQuery(
        // whenever sort_by changes, react query will refetch the comments
        // with the new sort_by, because we have put sort_by in the queryName array
        ["comments_section", { post_id, sort_by }],
        ({ pageParam = 0 }) =>
            get_all_comments(post_id, COMMENTS_PER_PAGE, pageParam, sort_by),
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

    const list_of_comments = data?.pages.map((pg) => {
        const length_of_comments = pg.all_comments.length;

        return pg.all_comments.map((comment_details, i) => {
            if (i + 1 === length_of_comments) {
                return (
                    <div ref={lastCommentRef} key={comment_details.id}>
                        <Comment
                            comment={comment_details}
                            post_id={post_id}
                            sort_by={sort_by}
                        />
                    </div>
                );
            }
            return (
                <div key={comment_details.id}>
                    <Comment
                        comment={comment_details}
                        post_id={post_id}
                        sort_by={sort_by}
                    />
                </div>
            );
        });
    });

    return (
        <div className="CommentSectionInfiniteScroll">
            <div className="header">
                <h2>Comments</h2>

                <div className="sort_by_options">
                    <span>Sort By:</span>
                    {SORT_BY_OPTIONS.map((option) => {
                        return (
                            <button
                                key={option}
                                onClick={() => set_sort_by(option)}
                                className={sort_by === option ? "active" : ""}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            {list_of_comments}

            <div className="end_of_comment_section">
                {isFetchingNextPage && <Loading />}

                {hasNextPage === false && <p>No more comments left</p>}
            </div>
        </div>
    );
}

export default CommentSectionInfiniteScroll;
