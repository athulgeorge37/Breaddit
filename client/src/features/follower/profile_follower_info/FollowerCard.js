// styles
import "./FollowerCard.scss";

// hooks
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../context/CurrentUser/CurrentUserProvider";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";

// componets
import ProfilePicture from "../../profile/profile_picture/ProfilePicture";

// api
import { follow_or_unfollow_account_request } from "../../../api/FollowerRequests";

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
                    onClick={close_modal}
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

export default FollowerCard;
