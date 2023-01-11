import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

import ReadProfile from "./ReadProfile";
import EditProfile from "./EditProfileV2";
import Loading from "../../components/ui/Loading";

import { useQuery } from "@tanstack/react-query";
import { get_user_details } from "../../api/UserRequests";

function ProfileDetails() {
    const { current_user } = useCurrentUser();
    const { username_route } = useParams();

    // const [is_editing_profile, set_is_editing_profile] = useState(false);
    const [user_id, set_user_id] = useState(null);

    const { data, isLoading, isError } = useQuery(
        ["user_details", { username: username_route }],
        () => {
            return get_user_details(username_route);
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    console.log("user_details error", data.error);
                    return;
                }
                set_user_id(data.user_details.id);
            },
        }
    );

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        console.log(data);
        return <p>An Error has occured, check console</p>;
    }

    const user_details = data.user_details;

    return (
        <div className="ProfileDetails">
            {/* <>
                {username_route === current_user.username &&
                is_editing_profile ? (
                    <EditProfile
                        set_is_editing_profile={set_is_editing_profile}
                        user_details={user_details}
                        user_id={user_id}
                    />
                ) : (
                    <ReadProfile
                        set_is_editing_profile={set_is_editing_profile}
                        user_details={user_details}
                        user_id={user_id}
                    />
                )}
            </> */}
            <ReadProfile user_details={user_details} user_id={user_id} />
        </div>
    );
}

export default ProfileDetails;
