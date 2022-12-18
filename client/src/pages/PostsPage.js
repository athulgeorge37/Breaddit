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

import {
    get_thread_details,
    get_thread_names,
} from "../rest_api_requests/ThreadRequests";
import { useEffect } from "react";
import useDebounce from "../hooks/useDebounce";
import { useSearchParams } from "react-router-dom";

const PostsPageContext = createContext();

const POSTS_PER_PAGE = 2;
const SORT_BY_OPTIONS = ["TOP", "BOTTOM", "NEW", "OLD"];

const usePostsPage = () => {
    // this is a custom hook that provides
    // access to the below methods

    const {
        sort_by,
        set_sort_by,
        thread_id,
        set_thread_id,
        search_within_thread,
        set_search_within_thread,
        update_search_param,
        delete_search_param,
    } = useContext(PostsPageContext);

    return {
        sort_by,
        set_sort_by,
        thread_id,
        set_thread_id,
        search_within_thread,
        set_search_within_thread,
        update_search_param,
        delete_search_param,
    };
};

function PostsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    // const navigate = useNavigate();

    const [thread_id, set_thread_id] = useState(
        searchParams.get("thread") ?? null
    );
    const [sort_by, set_sort_by] = useState(
        searchParams.get("sortBy") ?? SORT_BY_OPTIONS[0]
    );
    const [search_within_thread, set_search_within_thread] = useState(
        searchParams.get("search") ?? null
    );

    const update_search_param = (param, value) => {
        searchParams.set(param, value);
        setSearchParams(searchParams);
    };

    const delete_search_param = (param) => {
        searchParams.delete(param);
        setSearchParams(searchParams);
    };

    // const [current_thread, set_current_thread] = useState(null);

    // useEffect(() => {
    //     if (current_thread === null) {
    //         document.getElementById("background_image").style.backgroundImage =
    //             "";
    //     } else {
    //         document.getElementById(
    //             "background_image"
    //         ).style.backgroundImage = `url(${current_thread.theme})`;
    //     }

    //     return () => {
    //         // changes background image back to default when page unmounts
    //         document.getElementById("background_image").style.backgroundImage =
    //             "";
    //     };
    // }, [current_thread]);

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
                thread_id,
            },
        ],
        ({ pageParam = 0 }) =>
            get_all_posts(
                POSTS_PER_PAGE,
                pageParam,
                sort_by,
                search_within_thread,
                thread_id
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
                    thread_id,
                    set_thread_id,
                    search_within_thread,
                    set_search_within_thread,
                    update_search_param,
                    delete_search_param,
                }}
            >
                <div className="search">
                    <FilterOptions />

                    {/* {current_thread !== null && (
                        <div className="thread_details">
                            <div className="title">{current_thread.title}</div>
                            <div className="description">
                                {current_thread.description}
                            </div>
                        </div>
                    )} */}
                </div>

                <div className="create_post_and_list_of_posts">
                    <SearchWithinThread />
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

function SearchWithinThread() {
    const {
        search_within_thread,
        set_search_within_thread,
        update_search_param,
        delete_search_param,
    } = usePostsPage();

    const [search_input, set_search_input] = useState(
        search_within_thread ?? ""
    );
    const input_ref = useRef();

    const handle_search_input = (new_value) => {
        if (new_value === "") {
            set_search_within_thread(null);
            delete_search_param("search");
        }
        set_search_input(new_value);
    };

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
                    onChange={(e) => handle_search_input(e.target.value)}
                />
                <button
                    className="clear_btn"
                    onClick={() => {
                        set_search_input("");
                        set_search_within_thread(null);
                        input_ref.current.focus();

                        delete_search_param("search");
                    }}
                >
                    Clear
                </button>
                <button
                    className="search_btn"
                    onClick={() => {
                        set_search_within_thread(search_input);
                        update_search_param("search", search_input);
                    }}
                >
                    Search
                </button>
            </div>
        </div>
    );
}

function FilterOptions() {
    const navigate = useNavigate();
    const { sort_by, set_sort_by, update_search_param } = usePostsPage();

    const handle_sort_by_change = (new_option) => {
        set_sort_by(new_option);
        update_search_param("sortBy", new_option);
    };

    return (
        <div className="FilterOptions">
            <div className="sort_by_options">
                {SORT_BY_OPTIONS.map((option) => {
                    return (
                        <button
                            key={option}
                            onClick={() => handle_sort_by_change(option)}
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
        </div>
    );
}

function SearchThreadNames() {
    const {
        thread_id,
        set_thread_id,
        update_search_param,
        delete_search_param,
    } = usePostsPage();

    const [search_term, set_search_term] = useState("");
    const [is_loading, set_is_loading] = useState(false);
    const [threads_list, set_threads_list] = useState([]);

    const debounced_search = useDebounce(search_term, 500);

    // useEffect(() => {
    //     if (search_term === "") {
    //         set_threads_list([]);
    //         // set_thread_id(null);
    //         // delete_search_param("thread");
    //     }
    // }, [search_term]);

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

    const thread_data = useQuery(
        ["thread_details", thread_id],
        () => {
            return get_thread_details(thread_id);
        },
        {
            onSuccess: (data) => {
                console.log({ thread_data: data });
                // set_current_thread(data.thread_details);
            },
            onError: (data) => {
                console.log({ thread_data_error: data });
            },
        }
    );

    const handle_search_term_change = (new_value) => {
        if (new_value === "") {
            set_threads_list([]);
            set_thread_id(null);
            delete_search_param("thread");
        }
        set_search_term(new_value);
    };

    return (
        <div className="SearchThreadNames">
            <input
                className="search_thread_names_input"
                type="search"
                placeholder="Find A Thread"
                value={search_term}
                onChange={(e) => handle_search_term_change(e.target.value)}
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
                                            set_thread_id(thread.id);
                                            update_search_param(
                                                "thread",
                                                thread.id
                                            );
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

            {thread_data.isLoading ? (
                <Loading />
            ) : (
                <>
                    {thread_data.data.thread_details === null ? (
                        <div>No thread selected</div>
                    ) : (
                        <div className="thread_details">
                            {thread_data.data.thread_details?.title}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default PostsPage;
