import { useRef, useCallback } from "react";
import "./PostsPage.scss";

import CreatePost from "../features/post/CreatePost";
import StaticPostCard from "../features/post/StaticPostCard";
import Loading from "../components/ui/Loading";

import { get_all_posts } from "../rest_api_requests/PostRequests";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

import { useInfiniteQuery } from "@tanstack/react-query";
const POSTS_PER_PAGE = 2;

function PostsPage() {
    const { current_user } = useCurrentUser();

    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        status,
        error,
    } = useInfiniteQuery(
        ["posts"],
        ({ pageParam = 0 }) => get_all_posts(POSTS_PER_PAGE, pageParam),
        {
            getNextPageParam: (lastPage, allPages) => {
                // when the last page retrieved has no posts in it
                // we return undefined so hasNextPage becomes false

                // when the last page's posts does have posts in it, it indicates
                // there are more posts, so we set the page number to
                // all_pages.length

                // we do not add 1 since, page numbers in the server start from
                // 0 and go up

                return lastPage.all_posts.length ? allPages.length : undefined;
            },
        }
    );

    const intObserver = useRef();
    const lastPostRef = useCallback(
        (post) => {
            // not requesting next page if current page is loading
            if (isFetchingNextPage) {
                return;
            }

            // disconnecting previous intersection observers
            if (intObserver.current) {
                intObserver.current.disconnect();
            }

            // fetching next intersection observer
            intObserver.current = new IntersectionObserver((posts) => {
                // console.log({
                //     isIntersecting: posts[0].isIntersecting,
                //     hasNextPage,
                // });
                if (posts[0].isIntersecting && hasNextPage) {
                    console.log("Fetching more posts");
                    fetchNextPage();
                }
            });

            if (post) {
                intObserver.current.observe(post);
            }
        },
        [isFetchingNextPage, fetchNextPage, hasNextPage]
    );

    if (status === "error") {
        return <p className="center">Error: {error}</p>;
    }

    const list_of_posts = data?.pages.map((pg) => {
        const length_of_posts = pg.all_posts.length;

        return pg.all_posts.map((post_details, i) => {
            if (i + 1 === length_of_posts) {
                return (
                    <div ref={lastPostRef} key={post_details.id}>
                        <StaticPostCard post_details={post_details} />
                    </div>
                );
            }
            return (
                <div key={post_details.id}>
                    <StaticPostCard post_details={post_details} />
                </div>
            );
        });
    });

    return (
        <div className="Posts_Page">
            {current_user.role !== "admin" && <CreatePost />}

            <div className="All_Posts">
                {list_of_posts}

                {isFetchingNextPage && <Loading />}

                {hasNextPage === false && <p>There are no more posts</p>}
            </div>
        </div>
    );
}

export default PostsPage;
