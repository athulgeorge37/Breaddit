import {
    useRef,
    useCallback,
    useState,
    createContext,
    useContext,
    useEffect,
} from "react";
import "./PostsPage.scss";

import StaticPostCard from "../features/post/StaticPostCard";
import Loading from "../components/ui/Loading";

import { get_all_posts } from "../rest_api_requests/PostRequests";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    get_thread_details,
    get_thread_names,
} from "../rest_api_requests/ThreadRequests";
import useDebounce from "../hooks/useDebounce";
import CloudinaryImage from "../components/CloudinaryImage";
import ThreadLogo from "../features/thread/ThreadLogo";
import { human_readable_date } from "../helper/time";
import ProfilePicture from "../features/profile/profile_picture/ProfilePicture";

const PostsPageContext = createContext();

const POSTS_PER_PAGE = 2;
const SORT_BY_OPTIONS = ["TOP", "BOTTOM", "NEW", "OLD"];

const usePostsPage = () => {
    // this is a custom hook that provides
    // access to the below methods

    const {
        sort_by,
        set_sort_by,
        thread_title,
        set_thread_title,
        search_within_thread,
        set_search_within_thread,
        update_search_param,
        delete_search_param,
    } = useContext(PostsPageContext);

    return {
        sort_by,
        set_sort_by,
        thread_title,
        set_thread_title,
        search_within_thread,
        set_search_within_thread,
        update_search_param,
        delete_search_param,
    };
};

function PostsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    // const navigate = useNavigate();

    const [thread_title, set_thread_title] = useState(
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
                thread_title,
            },
        ],
        ({ pageParam = 0 }) =>
            get_all_posts(
                POSTS_PER_PAGE,
                pageParam,
                sort_by,
                search_within_thread,
                thread_title
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
                console.log({ infinite_posts: data });
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
                    thread_title,
                    set_thread_title,
                    search_within_thread,
                    set_search_within_thread,

                    update_search_param,
                    delete_search_param,
                }}
            >
                <div className="search">
                    <FilterOptions />

                    <ThreadDetails />
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
        thread_title,
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
                        thread_title !== null
                            ? `Search within ${thread_title}`
                            : search_input === ""
                            ? "Search for a post"
                            : ""
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
        thread_title,
        set_thread_title,
        update_search_param,
        delete_search_param,
    } = usePostsPage();

    const [search_term, set_search_term] = useState("");
    const [is_loading, set_is_loading] = useState(false);
    const [threads_list, set_threads_list] = useState([]);

    const debounced_search = useDebounce(search_term, 500);

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

    const handle_search_term_change = (new_value) => {
        if (new_value === "") {
            set_threads_list([]);
            set_thread_title(null);
            delete_search_param("thread");
        }
        set_search_term(new_value);
    };

    return (
        <div className="SearchThreadNames">
            <div className="search_thread_names_input_div">
                <input
                    className="search_thread_names_input"
                    type="search"
                    placeholder="Find A Thread"
                    value={search_term}
                    onChange={(e) => handle_search_term_change(e.target.value)}
                />
                {thread_title !== null && (
                    <div
                        className="cancel_icon"
                        onClick={() => handle_search_term_change("")}
                    >
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {is_loading && thread_title === null ? (
                <div className="loader">
                    <Loading />
                </div>
            ) : (
                <>
                    {threads_list.length > 0 && thread_title === null ? (
                        <div className="thread_name_list">
                            {threads_list.map((thread) => {
                                return (
                                    <button
                                        key={thread.id}
                                        className="thread_name"
                                        onClick={() => {
                                            set_thread_title(thread.title);
                                            set_search_term(thread.title);
                                            set_threads_list([]);
                                            update_search_param(
                                                "thread",
                                                thread.title
                                            );
                                        }}
                                    >
                                        <img src={thread.logo} alt="" />
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

function ThreadDetails() {
    const { thread_title } = usePostsPage();

    const navigate = useNavigate();

    const thread_data = useQuery(
        ["thread_details", thread_title],
        () => {
            return get_thread_details(thread_title);
        },
        {
            onSuccess: (data) => {
                //console.log({ thread_data: data });
            },
            onError: (data) => {
                console.log({ thread_data_error: data });
            },
        }
    );

    const thread_details = thread_data.data?.thread_details;

    return (
        <div className="ThreadDetails">
            {thread_data.isLoading && <Loading />}

            {thread_data.error && (
                <div className="error">
                    Error: {JSON.stringify(thread_data.error)}
                </div>
            )}

            {thread_details !== null && (
                <>
                    <div className="thread_details">
                        <div
                            className="theme"
                            style={{
                                backgroundImage: `url(${thread_details?.theme})`,
                            }}
                        >
                            <div className="title_and_logo">
                                <ThreadLogo
                                    img_url={thread_details?.logo}
                                    thread_title={thread_details?.title}
                                />
                                <h2 className="title">
                                    {thread_details?.title}
                                </h2>
                            </div>
                        </div>
                        {/* <button
                        className="remove_thread"
                        onClick={() => {
                            set_thread_title(null);
                            delete_search_param("thread");
                        }}
                    >
                        X
                    </button> */}

                        <div className="content">
                            <div className="description">
                                <span>Description:</span>
                                <p>{thread_details?.description}</p>
                            </div>
                            <div className="createdAt">
                                <span>Created On:</span>
                                <p>
                                    {human_readable_date(
                                        thread_details?.createdAt
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="thread_rules">
                        <h3>Rules:</h3>
                        {thread_details?.thread_rules.map((rule) => {
                            return <Rule key={rule.id} rule={rule} />;
                        })}
                    </div>

                    <div className="creator_details">
                        <h3>Creator:</h3>

                        <div
                            className="profile_pic_and_username"
                            onClick={() =>
                                navigate(
                                    `/profile/${thread_details?.creator_details.username}`
                                )
                            }
                        >
                            <ProfilePicture
                                profile_picture_url={
                                    thread_details?.creator_details.profile_pic
                                }
                                username={
                                    thread_details?.creator_details.username
                                }
                            />

                            <b className="username">
                                {thread_details?.creator_details.username}
                            </b>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function Rule({ rule }) {
    const [is_open, set_is_open] = useState(false);

    return (
        <div className="Rule" onClick={() => set_is_open(!is_open)}>
            <div className="title_and_chevron">
                <div className="title">{rule.title}</div>

                <div className="chevron">
                    {is_open ? (
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    ) : (
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                            />
                        </svg>
                    )}
                </div>
            </div>

            {is_open && <div className="description">{rule.description}</div>}
        </div>
    );
}

export default PostsPage;
