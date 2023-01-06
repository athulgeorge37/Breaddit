// style import
import "./ReadProfile.scss";

// hooks
import { useState, useRef, useCallback } from "react";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useParams, useNavigate } from "react-router-dom";
import { useModal } from "../../components/ui/Modal";
import {
    useQuery,
    useInfiniteQuery,
    useQueryClient,
    useMutation,
} from "@tanstack/react-query";

// api
import { get_user_details, sign_out } from "../../api/UserRequests";
import {
    get_all_profiles_who_follow,
    follow_or_unfollow_account_request,
    check_is_following_username,
    get_follower_following_counts_request,
} from "../../api/FollowerRequests";

// ui
import ToolTip from "../../components/ui/ToolTip";
import Modal from "../../components/ui/Modal";
import Loading from "../../components/ui/Loading";

// components
import ProfilePicture from "./profile_picture/ProfilePicture";

// helper
// import DOMPurify from "dompurify";
import { human_readable_date } from "../../helper/time";

const FOLLOWERS_PER_PAGE = 2;

function ReadProfile({ set_is_editing_profile, user_details, user_id }) {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { username_route } = useParams();
    const { current_user, remove_current_user } = useCurrentUser();
    const { show_modal, open_modal, close_modal } = useModal();

    const [follower_type, set_follower_type] = useState(null);

    const [is_signing_out, set_is_signing_out] = useState(false);

    const { mutate: follow_or_unfollow_account } = useMutation(
        (account_id) => {
            return follow_or_unfollow_account_request(account_id);
        },
        {
            onSuccess: () => {
                // console.log({ data });
                queryClient.invalidateQueries([
                    "is_following",
                    { username: username_route },
                ]);

                queryClient.invalidateQueries([
                    "follower_following_counts",
                    { user_id: user_id },
                ]);
            },
        }
    );

    const { data: is_following_data } = useQuery(
        ["is_following", { username: username_route }],
        () => {
            return check_is_following_username(username_route);
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    console.log("is_following username error", data.error);
                    return;
                }
            },
        }
    );

    const { data: follower_following_counts } = useQuery(
        ["follower_following_counts", { user_id }],
        () => {
            return get_follower_following_counts_request(user_id);
        },
        {
            // will only_execute after a user_id exists
            enabled: !!user_id,
        }
    );

    const { mutate: handle_sign_out } = useMutation(sign_out, {
        onSuccess: (data) => {
            console.log({ sign_out_time: data });
            set_is_signing_out(true);
            setTimeout(() => {
                navigate("/signin");

                // removing web token from localstorage and
                // updating current_user in App.js,
                // to remove users access to authenticated pages
                remove_current_user();
            }, 1000);
        },
    });

    return (
        <div className="ReadProfile">
            <Modal show_modal={show_modal} close_modal={close_modal}>
                <div className="follower_list_modal">
                    <FollowerListInfiniteScroll
                        set_follower_type={set_follower_type}
                        follower_type={follower_type}
                        user_id={user_id}
                        close_modal={close_modal}
                    />
                </div>
            </Modal>

            <div className="user_details_card">
                <div className="username_and_picture">
                    <ProfilePicture
                        username={user_details.username}
                        profile_picture_url={user_details.profile_pic}
                        img_size={100}
                        disable_tooltip
                        margin_right={0}
                    />
                    <p className="username">{user_details.username}</p>
                    <div className="join_data">
                        <label htmlFor="join_date">Joined On:</label>
                        <p id="join_date">
                            {human_readable_date(user_details.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="user_data_and_bio">
                    <div className="user_data">
                        <button
                            className="followers"
                            onClick={() => {
                                set_follower_type("Followers");
                                open_modal();
                            }}
                        >
                            <span id="follower_count">
                                {follower_following_counts == undefined
                                    ? 0
                                    : follower_following_counts.follower_count}
                            </span>
                            <label htmlFor="follower_count">Followers</label>
                        </button>
                        <button
                            className="following"
                            onClick={() => {
                                set_follower_type("Following");
                                open_modal();
                            }}
                        >
                            <span id="following_count">
                                {follower_following_counts == undefined
                                    ? 0
                                    : follower_following_counts.following_count}
                            </span>
                            <label htmlFor="following_count">Following</label>
                        </button>
                    </div>
                    <p className="bio">{user_details.bio ?? "No Bio"}</p>

                    <div className="btns">
                        {is_following_data !== undefined &&
                            username_route !== current_user.username && (
                                <>
                                    <button
                                        aria-label="follow user"
                                        className={
                                            is_following_data.is_following
                                                ? "following_btn"
                                                : "follow_btn"
                                        }
                                        type="button"
                                        onClick={() =>
                                            follow_or_unfollow_account(user_id)
                                        }
                                    >
                                        {is_following_data.is_following
                                            ? "Following"
                                            : "Follow"}
                                    </button>
                                </>
                            )}

                        {username_route === current_user.username && (
                            <>
                                <button
                                    className="edit_profile_btn"
                                    type="btn"
                                    onClick={() => set_is_editing_profile(true)}
                                >
                                    <svg
                                        className="edit_btn_icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    Edit Profile
                                </button>
                                <button
                                    className="logout_btn"
                                    type="buttton"
                                    onClick={handle_sign_out}
                                >
                                    {is_signing_out
                                        ? "Signing Out..."
                                        : "Sign Out"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

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

function FollowerCard({ follower_data, close_modal, user_id }) {
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();
    const queryClient = useQueryClient();
    const [is_following, set_is_following] = useState(
        follower_data.is_following
    );

    const { mutate: follow_or_unfollow_account } = useMutation(
        (account_id) => {
            return follow_or_unfollow_account_request(account_id);
        },
        {
            onSuccess: (data) => {
                // console.log({ data });
                queryClient.invalidateQueries([
                    "follower_following_counts",
                    { user_id: user_id },
                ]);
                set_is_following(data.is_following);
            },
        }
    );

    return (
        <div className="FollowerCard">
            <div className="left_side">
                <ProfilePicture
                    username={follower_data.dataValues.username}
                    profile_picture_url={follower_data.dataValues.profile_pic}
                />
                <button
                    className="username"
                    onClick={() => {
                        close_modal();
                        setTimeout(() => {
                            navigate(
                                `/user/${follower_data.dataValues.username}/profile`
                            );
                        }, 500);
                    }}
                >
                    {follower_data.dataValues.username}
                </button>
            </div>
            {current_user.username ===
            follower_data.dataValues.username ? null : (
                <button
                    className={`follower_following_btn ${
                        is_following ? "following_btn" : "follower_btn"
                    }`}
                    onClick={() => {
                        follow_or_unfollow_account(follower_data.dataValues.id);
                    }}
                >
                    {is_following ? "Following" : "Follow"}
                </button>
            )}
        </div>
    );
}

export default ReadProfile;
