// styles
import "./CommentsByUser.scss";

// hooks
import { useLocation } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";

// components
import Comment from "./Comment";

//api
import { get_all_comments_by_user } from "../../api/CommentRequests";

// constants
const COMMENTS_PER_PAGE = 10;
const SORT_BY_OPTIONS = ["Top", "Bottom", "New", "Old"];

function CommentsByUser() {
    const { pathname } = useLocation();

    const username = pathname.split("/")[2];

    const [sort_by, set_sort_by] = useState(SORT_BY_OPTIONS[0]);

    const [is_reply, set_is_reply] = useState(false);

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
        ["comments_by_user", { username, sort_by, is_reply }],
        ({ pageParam = 0 }) =>
            get_all_comments_by_user({
                username: username,
                filter_by: sort_by,
                is_reply: is_reply,
                limit: COMMENTS_PER_PAGE,
                page_num: pageParam,
            }),
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
                if (is_reply) {
                    return (
                        <div
                            ref={lastCommentRef}
                            key={comment_details.reply_comment.id}
                            className="comment_wrapper"
                        >
                            <Comment
                                comment={comment_details.parent_comment}
                                post_id={comment_details.parent_comment.post_id}
                                sort_by={sort_by}
                                allow_show_replies_section={false}
                                link_to_post
                            />
                            <div className="reply_comment">
                                <Comment
                                    comment={comment_details.reply_comment}
                                    post_id={
                                        comment_details.reply_comment.post_id
                                    }
                                    sort_by={sort_by}
                                />
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div
                            ref={lastCommentRef}
                            key={comment_details.id}
                            className="comment_wrapper"
                        >
                            <Comment
                                comment={comment_details}
                                post_id={comment_details.post_id}
                                sort_by={sort_by}
                                link_to_post
                            />
                        </div>
                    );
                }
            } else {
                if (is_reply) {
                    return (
                        <div
                            key={comment_details.reply_comment.id}
                            className="comment_wrapper"
                        >
                            <Comment
                                comment={comment_details.parent_comment}
                                post_id={comment_details.parent_comment.post_id}
                                sort_by={sort_by}
                                allow_show_replies_section={false}
                                link_to_post
                            />
                            <div className="reply_comment">
                                <Comment
                                    comment={comment_details.reply_comment}
                                    post_id={
                                        comment_details.reply_comment.post_id
                                    }
                                    sort_by={sort_by}
                                />
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div
                            key={comment_details.id}
                            className="comment_wrapper"
                        >
                            <Comment
                                comment={comment_details}
                                post_id={comment_details.post_id}
                                sort_by={sort_by}
                                link_to_post
                            />
                        </div>
                    );
                }
            }
        });
    });

    return (
        <div className="CommentsByUser">
            <div className="header">
                <div className="toggle_comment_mode">
                    <button
                        className={`comments_btn ${is_reply ? "" : "active"}`}
                        onClick={() => set_is_reply(false)}
                    >
                        Comments
                    </button>
                    <button
                        className={`replies_btn ${is_reply ? "active" : ""}`}
                        onClick={() => set_is_reply(true)}
                    >
                        Replies
                    </button>
                </div>

                <div className="sort_by_options">
                    {SORT_BY_OPTIONS.map((option) => {
                        return (
                            <button
                                key={option}
                                className={`sort_by_option ${
                                    option === sort_by ? "active" : ""
                                }`}
                                onClick={() => set_sort_by(option)}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="list_of_comments">{list_of_comments}</div>
        </div>
    );
}

export default CommentsByUser;
