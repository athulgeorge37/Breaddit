// styles
import "./VotedPostsInfiniteScroll.scss";

// hooks
import { useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

// components
import StaticPostCard from "../post/StaticPostCard";
import Comment from "../comment/Comment";

// ui
import Loading from "../../components/ui/Loading";

// api
import {
    get_post_votes_by_user,
    get_comment_votes_by_user,
    get_reply_votes_by_user,
} from "../../api/VoteRequests";

// constants
const ITEMS_PER_PAGE = 10;

function VotedPostsInfiniteScroll({
    username,
    up_voted,
    sort_by,
    parent_type,
}) {
    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
    } = useInfiniteQuery(
        [
            "all_items_user_voted",
            {
                username,
                up_voted,
                sort_by,
                parent_type,
            },
        ],
        ({ pageParam = 0 }) => {
            switch (parent_type.toLowerCase()) {
                case "posts":
                    return get_post_votes_by_user({
                        username: username,
                        up_voted: up_voted,
                        filter_by: sort_by,
                        limit: ITEMS_PER_PAGE,
                        page_num: pageParam,
                    });
                case "comments":
                    return get_comment_votes_by_user({
                        username: username,
                        up_voted: up_voted,
                        filter_by: sort_by,
                        limit: ITEMS_PER_PAGE,
                        page_num: pageParam,
                    });
                case "replies":
                    return get_reply_votes_by_user({
                        username: username,
                        up_voted: up_voted,
                        filter_by: sort_by,
                        limit: ITEMS_PER_PAGE,
                        page_num: pageParam,
                    });
                default:
                    return get_post_votes_by_user({
                        username: username,
                        up_voted: up_voted,
                        filter_by: sort_by,
                        limit: ITEMS_PER_PAGE,
                        page_num: pageParam,
                    });
                // return [];
            }
        },
        {
            getNextPageParam: (lastPage, allPages) => {
                // when the last page retrieved has no posts in it
                // we return undefined so hasNextPage becomes false

                // when the last page's posts does have posts in it, it indicates
                // there are more posts, so we set the page number to
                // all_pages.length

                // we do not add 1 since, page numbers in the server start from
                // 0 and go up

                return lastPage.all_items.length ? allPages.length : undefined;
            },
            onError: (data) => {
                //console.log({ infinite_items: data });
            },
        }
    );

    const intObserver = useRef();
    const lastItemRef = useCallback(
        (item) => {
            // not requesting next page if current page is loading
            if (isFetchingNextPage) {
                return;
            }

            // disconnecting previous intersection observers
            if (intObserver.current) {
                intObserver.current.disconnect();
            }

            // fetching next intersection observer
            intObserver.current = new IntersectionObserver((items) => {
                // console.log({
                //     isIntersecting: posts[0].isIntersecting,
                //     hasNextPage,
                // });
                if (items[0].isIntersecting && hasNextPage) {
                    //console.log("Fetching more items");
                    fetchNextPage();
                }
            });

            if (item) {
                intObserver.current.observe(item);
            }
        },
        [isFetchingNextPage, fetchNextPage, hasNextPage]
    );

    const list_of_items = data?.pages.map((pg) => {
        const length_of_items = pg.all_items.length;

        return pg.all_items.map((item, i) => {
            let key = null;
            let ItemToRender = null;
            switch (parent_type.toLowerCase()) {
                case "posts":
                    key = item.id;
                    ItemToRender = <StaticPostCard post_details={item} />;
                    break;
                case "comments":
                    key = item.id;
                    ItemToRender = (
                        <div className="comment_wrapper">
                            <Comment
                                comment={item}
                                post_id={item.post_id}
                                sort_by={sort_by}
                                link_to_post
                            />
                        </div>
                    );

                    break;
                case "replies":
                    key = item.reply_comment.id;
                    ItemToRender = (
                        <div className="comment_wrapper">
                            <Comment
                                comment={item.parent_comment}
                                post_id={item.parent_comment.post_id}
                                sort_by={sort_by}
                                allow_show_replies_section={false}
                                link_to_post
                            />
                            <div className="reply_comment">
                                <Comment
                                    comment={item.reply_comment}
                                    post_id={item.reply_comment.post_id}
                                    sort_by={sort_by}
                                />
                            </div>
                        </div>
                    );
                    break;
                default:
                    // ItemToRender = <StaticPostCard post_details={item} />;
                    break;
            }

            if (i + 1 === length_of_items) {
                return (
                    <div ref={lastItemRef} key={key}>
                        {ItemToRender}
                    </div>
                );
            } else {
                return <div key={key}>{ItemToRender}</div>;
            }
        });
    });

    return (
        <div className="VotedPostsInfiniteScroll">
            <div
                className={`list_of_${
                    parent_type.toLowerCase() === "posts" ? "posts" : "comments"
                }`}
            >
                {list_of_items}
            </div>

            <div className="end_of_items_lists">
                {isFetchingNextPage && <Loading />}

                {hasNextPage === false && <p>No more {parent_type} left</p>}
            </div>
        </div>
    );
}

export default VotedPostsInfiniteScroll;
