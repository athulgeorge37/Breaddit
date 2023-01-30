// style import
import "./ProfileDetails.scss";

// hooks
import { useState } from "react";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useParams, useNavigate } from "react-router-dom";
import { useModal } from "../../components/ui/Modal";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNotification } from "../../context/Notifications/NotificationProvider";

// api
import { sign_out } from "../../api/UserRequests";
import {
    follow_or_unfollow_account_request,
    check_is_following_username,
    get_follower_following_counts_request,
} from "../../api/FollowerRequests";

// ui
import Modal from "../../components/ui/Modal";
import Loading from "../../components/ui/Loading";

// components
import ProfilePicture from "./profile_picture/ProfilePicture";
import FollowerListInfiniteScroll from "../follower/profile_follower_info/FollowerListInfiniteScroll";

// helper
// import DOMPurify from "dompurify";
import { human_readable_date } from "../../helper/time";

function ProfileDetails() {
    const add_notification = useNotification();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { username_route } = useParams();
    const { current_user, remove_current_user } = useCurrentUser();
    const { show_modal, open_modal, close_modal } = useModal();

    const data = queryClient.getQueryData([
        "user_details",
        { username: username_route },
    ]);

    const user_id = data?.user_details.id;

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
                add_notification("Succesfully Signed Out");
                // removing web token from localstorage and
                // updating current_user in App.js,
                // to remove users access to authenticated pages
                remove_current_user();
            }, 1000);
        },
    });

    if (data.isLoading) {
        return <Loading />;
    }

    if (data.isError) {
        console.log(data);
        return <p>An Error has occured, check console</p>;
    }

    const user_details = data.user_details;

    return (
        <div className="ProfileDetails">
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
                                    onClick={() => {
                                        navigate(`/edit_profile`);
                                    }}
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

export default ProfileDetails;
