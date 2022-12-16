import {
    useRef,
    useCallback,
    useState,
    createContext,
    useContext,
} from "react";
import "./PostsPage.scss";

import StaticPostCard from "../features/post/StaticPostCard";
import Loading from "../components/ui/Loading";

import { get_all_posts } from "../rest_api_requests/PostRequests";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { get_thread_names } from "../rest_api_requests/ThreadRequests";
import { useEffect } from "react";
import useDebounce from "../hooks/useDebounce";

const PostsPageContext = createContext();

const POSTS_PER_PAGE = 2;
const SORT_BY_OPTIONS = ["TOP", "BOTTOM", "NEW", "OLD"];

const usePostsPage = () => {
    // this is a custom hook that provides
    // access to the below methods

    const {
        sort_by,
        set_sort_by,
        current_thread,
        set_current_thread,
        set_search_within_thread,
    } = useContext(PostsPageContext);

    return {
        sort_by,
        set_sort_by,
        current_thread,
        set_current_thread,
        set_search_within_thread,
    };
};

function PostsPage() {
    const [sort_by, set_sort_by] = useState(SORT_BY_OPTIONS[0]);
    const [search_within_thread, set_search_within_thread] = useState(null);
    const [current_thread, set_current_thread] = useState(null);

    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        error,
    } = useInfiniteQuery(
        [
            "posts",
            {
                sort_by,
                search_within_thread,
                current_thread:
                    current_thread === null ? null : current_thread.title,
            },
        ],
        ({ pageParam = 0 }) =>
            get_all_posts(
                POSTS_PER_PAGE,
                pageParam,
                sort_by,
                search_within_thread,
                current_thread === null ? null : current_thread.id
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

                return lastPage.all_posts.length ? allPages.length : undefined;
            },
            onError: (data) => {
                console.log({ data });
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
            <PostsPageContext.Provider
                value={{
                    sort_by,
                    set_sort_by,
                    current_thread,
                    set_current_thread,
                    set_search_within_thread,
                }}
            >
                <div className="search">
                    <FilterOptions />
                </div>

                <div className="create_post_and_list_of_posts">
                    <SearchWithinCurrentThread />
                    {error && <span>Error: {JSON.stringify(error)}</span>}

                    <div className="list_of_posts">{list_of_posts}</div>

                    <div className="end_of_post_lists">
                        {isFetchingNextPage && <Loading />}

                        {hasNextPage === false && <p>No more posts left</p>}
                    </div>
                </div>
            </PostsPageContext.Provider>
        </div>
    );
}

function SearchWithinCurrentThread() {
    const [search_input, set_search_input] = useState("");
    const input_ref = useRef();

    const { set_search_within_thread } = usePostsPage();

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
                        set_search_within_thread(null);
                        input_ref.current.focus();
                    }}
                >
                    Clear
                </button>
                <button
                    className="search_btn"
                    onClick={() => set_search_within_thread(search_input)}
                >
                    Search
                </button>
            </div>
        </div>
    );
}

function FilterOptions() {
    const navigate = useNavigate();
    const { sort_by, set_sort_by, current_thread } = usePostsPage();

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

            <div className="search_thread_names">
                <SearchThreadNames />
            </div>

            {current_thread !== null && (
                <div className="thread_details">
                    <h2 className="thread_name">{current_thread.title}</h2>
                </div>
            )}
        </div>
    );
}

function SearchThreadNames() {
    const [threads_list, set_threads_list] = useState([]);
    const [search_term, set_search_term] = useState("");
    const [is_loading, set_is_loading] = useState(false);

    const { set_current_thread } = usePostsPage();
    const debounced_search = useDebounce(search_term, 500);

    useEffect(() => {
        if (search_term === "") {
            set_threads_list([]);
            set_current_thread(null);
        }
    }, [search_term]);

    useEffect(() => {
        // searching the api for thread names
        const search_api_for_thread_names = async () => {
            set_is_loading(true);

            const data = await get_thread_names(debounced_search);
            if (data.error) {
                console.log({ data });
                return;
            }
            set_threads_list(data.threads);
            set_is_loading(false);
        };

        if (debounced_search) {
            search_api_for_thread_names();
        }
    }, [debounced_search]);

    return (
        <div className="SearchThreadNames">
            <input
                className="search_thread_names_input"
                type="search"
                placeholder="Find A Thread"
                onChange={(e) => set_search_term(e.target.value)}
            />

            {is_loading ? (
                <div className="loader">
                    <Loading />
                </div>
            ) : (
                <>
                    {threads_list.length > 0 ? (
                        <div className="thread_name_list">
                            {threads_list.map((thread) => {
                                return (
                                    <button
                                        key={thread.id}
                                        className="thread"
                                        onClick={() => {
                                            set_current_thread(thread);
                                        }}
                                    >
                                        {thread.title}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}

export default PostsPage;
