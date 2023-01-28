// styles
import "./PostsByUser.scss";

// hooks
import {
    useRef,
    useCallback,
    useState,
    createContext,
    useContext,
    useEffect,
} from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";

// components
import StaticPostCard from "./StaticPostCard";

// form
import Input from "../../components/form/Input";

// api
import { get_all_posts_by_username } from "../../api/PostRequests";

// ui
import Loading from "../../components/ui/Loading";
import ToolTip from "../../components/ui/ToolTip";

const POSTS_PER_PAGE = 2;
const SORT_BY_OPTIONS = ["New", "Old", "Top", "Bottom"];

function PostsByUser() {
    const { pathname } = useLocation();

    const username = pathname.split("/")[2];

    const [sort_by, set_sort_by] = useState(SORT_BY_OPTIONS[0]);
    const [search_input, set_search_input] = useState(null);
    const [search_within_posts, set_search_within_posts] = useState("");

    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        error,
    } = useInfiniteQuery(
        [
            "posts_by_user",
            {
                sort_by,
                username,
                search_input,
            },
        ],
        ({ pageParam = 0 }) =>
            get_all_posts_by_username({
                username: username,
                search_input: search_input,
                filter_by: sort_by,
                limit: POSTS_PER_PAGE,
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

    useEffect(() => {
        if (search_within_posts === "") {
            set_search_input(null);
        }
    }, [search_within_posts]);

    return (
        <div className="PostsByUser">
            <div className="header">
                <h2>Posts</h2>
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

            <div className="sort_by_options_and_search_input">
                <div className="search_within_posts">
                    <Input
                        onChange={(e) =>
                            set_search_within_posts(e.target.value)
                        }
                        value={search_within_posts}
                        placeholder={`Search within ${username}'s posts`}
                        icon={
                            <ToolTip text={"Remove Search"}>
                                <button
                                    className="remove_search_btn"
                                    onClick={() => {
                                        set_search_input(null);
                                        set_search_within_posts("");
                                    }}
                                    disabled={search_within_posts === ""}
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
                                </button>
                            </ToolTip>
                        }
                    />
                    <button
                        className="search_btn"
                        onClick={() => set_search_input(search_within_posts)}
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="list_of_posts">{list_of_posts}</div>

            <div className="end_of_post_lists">
                {isFetchingNextPage && <Loading />}

                {hasNextPage === false && <p>No more posts left</p>}
            </div>
        </div>
    );
}

export default PostsByUser;
