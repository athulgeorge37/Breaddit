import { useRef, useCallback, useState } from "react";
import "./PostsPage.scss";

import StaticPostCard from "../features/post/StaticPostCard";
import Loading from "../components/ui/Loading";

import { get_all_posts } from "../rest_api_requests/PostRequests";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const POSTS_PER_PAGE = 2;
const SORT_BY_OPTIONS = ["TOP", "BOTTOM", "NEW", "OLD"];

function PostsPage() {
    const [sort_by, set_sort_by] = useState(SORT_BY_OPTIONS[0]);
    const [search_thread, set_search_thread] = useState("");

    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        error,
    } = useInfiniteQuery(
        ["posts", sort_by, search_thread],
        ({ pageParam = 0 }) =>
            get_all_posts(POSTS_PER_PAGE, pageParam, sort_by, search_thread),
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
            <div className="search">
                <FilterOptions sort_by={sort_by} set_sort_by={set_sort_by} />
            </div>

            <div className="create_post_and_list_of_posts">
                <SearchWithinCurrentThread
                    set_search_thread={set_search_thread}
                />
                {error && <span>Error: {JSON.stringify(error)}</span>}

                <div className="list_of_posts">{list_of_posts}</div>

                <div className="end_of_post_lists">
                    {isFetchingNextPage && <Loading />}

                    {hasNextPage === false && <p>No more posts left</p>}
                </div>
            </div>
        </div>
    );
}

function SearchWithinCurrentThread({ set_search_thread }) {
    const [search_input, set_search_input] = useState("");
    const input_ref = useRef();

    return (
        <div className="SearchWithinCurrentThread">
            <div className="search_thread_input">
                <input
                    ref={input_ref}
                    type="text"
                    placeholder={
                        search_input === "" ? "Search within this thread" : ""
                    }
                    value={search_input}
                    onChange={(e) => set_search_input(e.target.value)}
                />
                <button
                    className="clear_btn"
                    onClick={() => {
                        set_search_input("");
                        set_search_thread("");
                        input_ref.current.focus();
                    }}
                >
                    Clear
                </button>
                <button
                    className="search_btn"
                    onClick={() => set_search_thread(search_input)}
                >
                    Search
                </button>
            </div>
        </div>
    );
}

function FilterOptions({ sort_by, set_sort_by }) {
    const navigate = useNavigate();
    return (
        <div className="FilterOptions">
            <div className="sort_by_options">
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
            <div className="create_btns">
                <button
                    className="create_thread"
                    onClick={() => navigate("/create_thread")}
                >
                    Create Thread
                </button>

                <button
                    className="create_post"
                    onClick={() => navigate("/create_post")}
                >
                    Create Post
                </button>
            </div>
        </div>
    );
}

export default PostsPage;
