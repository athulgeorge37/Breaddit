// styles
import "./VoterFollowerCard.scss";

// hooks
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../context/CurrentUser/CurrentUserProvider";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";

// api
import { follow_or_unfollow_account_request } from "../../../api/FollowerRequests";

// componets
import ProfilePicture from "../../profile/profile_picture/ProfilePicture";

function VoterFollowerCard({ voter_data, close_modal, voter_info_query }) {
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();
    const queryClient = useQueryClient();
    const [is_following, set_is_following] = useState(
        voter_data?.is_following ?? null
    );

    // console.log({ voter_data });

    const { mutate: follow_or_unfollow_account } = useMutation(
        (account_id) => {
            return follow_or_unfollow_account_request(account_id);
        },
        {
            onSuccess: (data) => {
                // console.log({ data });
                queryClient.invalidateQueries(["voter_info", voter_info_query]);
                set_is_following(data.is_following);
            },
        }
    );

    const voter_details = voter_data.voter_details;

    // if (voter_details === undefined) {
    //     return null;
    // }

    return (
        <div className="VoterFollowerCard">
            <div className="left_side">
                <ProfilePicture
                    username={voter_details.username}
                    profile_picture_url={voter_details.profile_pic}
                />
                <button
                    className="username"
                    onClick={() => {
                        close_modal();
                        setTimeout(() => {
                            navigate(`/user/${voter_details.username}/profile`);
                        }, 500);
                    }}
                >
                    {voter_details.username}
                </button>
            </div>
            {current_user.username === voter_details.username ? null : (
                <>
                    {is_following === null ? null : (
                        <button
                            className={`follower_following_btn ${
                                is_following ? "following_btn" : "follower_btn"
                            }`}
                            onClick={() => {
                                follow_or_unfollow_account(voter_details.id);
                            }}
                        >
                            {is_following ? "Following" : "Follow"}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export default VoterFollowerCard;
