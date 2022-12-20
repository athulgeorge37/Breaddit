import "./PostsPage.scss";
import {
    useRef,
    useCallback,
    useState,
    createContext,
    useContext,
} from "react";

import StaticPostCard from "../features/post/StaticPostCard";
import Loading from "../components/ui/Loading";

import { get_all_posts } from "../rest_api_requests/PostRequests";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import SearchWithinThread from "../features/thread/SearchWithinThread";
import FilterOptions from "../features/thread/FilterOptions";
import ThreadDetails from "../features/thread/ThreadDetails";

const PostsPageContext = createContext();

const POSTS_PER_PAGE = 2;
const SORT_BY_OPTIONS = ["Top", "Bottom", "New", "Old"];

function PostsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [thread_title, set_thread_title] = useState(
        searchParams.get("thread") ?? null
    );
    const [sort_by, set_sort_by] = useState(
        searchParams.get("sort_by") ?? SORT_BY_OPTIONS[0]
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
                    <FilterOptions SORT_BY_OPTIONS={SORT_BY_OPTIONS} />

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

export const usePostsPage = () => {
    // this is a custom hook that provides
    // access to the below methods
    // that are defined in PostsPage

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

export default PostsPage;
