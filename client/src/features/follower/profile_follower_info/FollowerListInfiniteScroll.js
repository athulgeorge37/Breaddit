// styles
import "./FollowerListInfiniteScroll.scss";

// hooks
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useCallback } from "react";

// components
import FollowerCard from "./FollowerCard";

// ui
import Loading from "../../../components/ui/Loading";
import ToolTip from "../../../components/ui/ToolTip";

// api
import { get_all_profiles_who_follow } from "../../../api/FollowerRequests";

// constants
const FOLLOWERS_PER_PAGE = 10;

function FollowerListInfiniteScroll({
    follower_type,
    user_id,
    close_modal,
    set_follower_type,
}) {
    const {
        fetchNextPage, //function
        hasNextPage, // boolean
        isFetchingNextPage, // boolean
        data,
        error,
    } = useInfiniteQuery(
        ["follower_infinite_list", { follower_type, user_id }],
        ({ pageParam = 0 }) =>
            get_all_profiles_who_follow(
                follower_type,
                user_id,
                FOLLOWERS_PER_PAGE,
                pageParam
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

                return lastPage.all_followers.length
                    ? allPages.length
                    : undefined;
            },
            onError: (data) => {
                console.log({ infinite_followers: data });
            },
        }
    );

    const intObserver = useRef();
    const lastFollowerRef = useCallback(
        (follower) => {
            // not requesting next page if current page is loading
            if (isFetchingNextPage) {
                return;
            }

            // disconnecting previous intersection observers
            if (intObserver.current) {
                intObserver.current.disconnect();
            }

            // fetching next intersection observer
            intObserver.current = new IntersectionObserver((followers) => {
                // console.log({
                //     isIntersecting: posts[0].isIntersecting,
                //     hasNextPage,
                // });
                if (followers[0].isIntersecting && hasNextPage) {
                    console.log("Fetching more folllowers");
                    fetchNextPage();
                }
            });

            if (follower) {
                intObserver.current.observe(follower);
            }
        },
        [isFetchingNextPage, fetchNextPage, hasNextPage]
    );

    const list_of_followers = data?.pages.map((pg) => {
        const length_of_followers = pg.all_followers.length;

        return pg.all_followers.map((follower_data, i) => {
            if (i + 1 === length_of_followers) {
                return (
                    <div ref={lastFollowerRef} key={follower_data.id}>
                        <FollowerCard
                            follower_data={follower_data}
                            close_modal={close_modal}
                            user_id={user_id}
                        />
                    </div>
                );
            }
            return (
                <div key={follower_data.id}>
                    <FollowerCard
                        follower_data={follower_data}
                        close_modal={close_modal}
                        user_id={user_id}
                    />
                </div>
            );
        });
    });

    return (
        <div className="FollowerListInfiniteScroll">
            <div className="header">
                <div className="tabs">
                    <h2>
                        <button
                            className={`${
                                follower_type === "Followers" ? "active" : ""
                            }`}
                            onClick={() => set_follower_type("Followers")}
                        >
                            Followers
                        </button>
                    </h2>
                    <h2>
                        <button
                            className={`${
                                follower_type === "Following" ? "active" : ""
                            }`}
                            onClick={() => set_follower_type("Following")}
                        >
                            Following
                        </button>
                    </h2>
                </div>
                <ToolTip text="Close Modal">
                    <button
                        className="close_modal_btn"
                        onClick={() => close_modal()}
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
            </div>
            {error && <span>Error: {JSON.stringify(error)}</span>}

            <div className="follower_content">
                <div className="list_of_followers">
                    {list_of_followers}
                    <div className="end_of_followers_lists">
                        {isFetchingNextPage && <Loading />}

                        {hasNextPage === false && (
                            <p>No More {follower_type}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FollowerListInfiniteScroll;
