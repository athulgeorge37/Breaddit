import "./UserOverview.scss";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useLazyQuery, useMutation } from "@apollo/client";

import { GET_USER_DATA, UPDATE_BAN_STATUS } from "../../graphql/UserQueries";

import ProfilePicture from "../../features/profile/profile_picture/ProfilePicture";
import { get_current_date } from "../../helper/time";

import FollowerData from "./FollowerData";
import FollowingData from "./FollowingData";
import PostData from "./PostData";
import ProfileVisitsData from "./ProfileVisitsData";

function UserOverview() {
    const { user_id } = useParams();

    const [tabs, set_tabs] = useState({
        current_tab: "followers",
        available_tabs: ["followers", "following", "posts", "profile_vistors"],
    });

    // for followers

    const [get_user_data] = useLazyQuery(GET_USER_DATA);

    const [user_details, set_user_details] = useState({
        username: "",
        email: "",
        profile_pic: null,
        bio: null,
        createdAt: null,
        is_banned: false,
    });

    const [user_data, set_user_data] = useState({
        followers: 0,
        following: 0,
        no_of_posts: 0,
        profile_visitors: 0,
        is_online: false,
    });

    useEffect(() => {
        initialise_user_data();
    }, [user_id]);

    const initialise_user_data = async () => {
        const response = await get_user_data({
            variables: {
                user_id: user_id,
            },
        });

        if (response.error) {
            console.log(response);
            return;
        }

        // console.log(response.data)
        const user_info = response.data.get_user_info;
        set_user_details(user_info);

        set_user_data({
            followers: response.data.get_follower_count,
            following: response.data.get_following_count,
            no_of_posts: response.data.get_number_of_user_posts,
            profile_visitors: response.data.get_profile_visitors_count,
            is_online: response.data.check_is_online,
        });
    };

    const [update_ban_status, other_values] = useMutation(UPDATE_BAN_STATUS);

    const handle_ban_user = () => {
        // sending graphQL mutation to update ban status of this user
        update_ban_status({
            variables: {
                user_id: user_id,
                new_ban_status: !user_details.is_banned,
            },
        });

        // updating ban status in the UI
        set_user_details({
            ...user_details,
            is_banned: !user_details.is_banned,
        });
    };

    return (
        <div className="UserOverview">
            <div className="user_details">
                <ProfilePicture
                    profile_picture_url={user_details.profile_pic}
                    img_path="../.."
                />

                <div
                    className={`is_online ${
                        user_data.is_online ? "online" : ""
                    }`}
                >
                    {user_data.is_online ? "online" : "offline"}
                </div>

                <label htmlFor="username">Username:</label>
                <div id="username" className="username">
                    {user_details.username}
                </div>

                <label htmlFor="date_joined">Date Joined:</label>
                <div id="date_joined" className="date_joined">
                    {get_current_date(user_details.createdAt)}
                </div>

                <label htmlFor="email">Email:</label>
                <div id="email" className="email">
                    {user_details.email}
                </div>

                <label htmlFor="">Bio:</label>
                <div className="bio" id="bio">
                    {user_details.bio === null ? "(not set)" : user_details.bio}
                </div>

                <button
                    className={user_details.is_banned ? "banned" : ""}
                    onClick={handle_ban_user}
                >
                    {user_details.is_banned ? "Banned" : "Permitted"}
                </button>
            </div>

            <div className="selection_cards_and_content">
                <div className="selection_cards">
                    <div
                        className={`follower_card selection_card ${
                            tabs.current_tab === "followers" ? "active" : ""
                        }`}
                        onClick={() =>
                            set_tabs({
                                ...tabs,
                                current_tab: "followers",
                            })
                        }
                    >
                        {user_data.followers} Followers
                    </div>

                    <div
                        className={`following_card selection_card ${
                            tabs.current_tab === "following" ? "active" : ""
                        }`}
                        onClick={() =>
                            set_tabs({
                                ...tabs,
                                current_tab: "following",
                            })
                        }
                    >
                        {user_data.following} Following
                    </div>

                    <div
                        className={`following_card selection_card ${
                            tabs.current_tab === "posts" ? "active" : ""
                        }`}
                        onClick={() =>
                            set_tabs({
                                ...tabs,
                                current_tab: "posts",
                            })
                        }
                    >
                        {user_data.no_of_posts} Posts
                    </div>

                    <div
                        className={`following_card selection_card ${
                            tabs.current_tab === "profile_vistors"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            set_tabs({
                                ...tabs,
                                current_tab: "profile_vistors",
                            })
                        }
                    >
                        {user_data.profile_visitors} Profile Visitors
                    </div>
                </div>

                <div className="content">
                    {tabs.current_tab === "followers" ? (
                        <FollowerData
                            user_id={user_id}
                            username={user_details.username}
                        />
                    ) : tabs.current_tab === "following" ? (
                        <FollowingData
                            user_id={user_id}
                            username={user_details.username}
                        />
                    ) : tabs.current_tab === "posts" ? (
                        <PostData
                            user_id={user_id}
                            username={user_details.username}
                            profile_pic={user_details.profile_pic}
                        />
                    ) : tabs.current_tab === "profile_vistors" ? (
                        <ProfileVisitsData
                            user_id={user_id}
                            username={user_details.username}
                        />
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserOverview;
