// styles
import "./EditProfilePage.scss";

// components
import EditUsername from "../features/profile/edit_profile_details/EditUsername";
import EditEmail from "../features/profile/edit_profile_details/EditEmail";
import EditPassword from "../features/profile/edit_profile_details/EditPassword";
import EditBio from "../features/profile/edit_profile_details/EditBio";
import EditProfilePic from "../features/profile/edit_profile_details/EditProfilePic";

// ui
import Loading from "../components/ui/Loading";

// hooks
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";
import { useQuery } from "@tanstack/react-query";
import { get_editable_user_details } from "../api/UserRequests";
import { useState } from "react";

function EditProfilePage() {
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();

    const [user_details, set_user_details] = useState(null);

    const { isLoading } = useQuery(
        ["editable_user_details", { username: current_user.username }],
        () => {
            return get_editable_user_details();
        },
        {
            onSuccess: (data) => {
                set_user_details(data.user_details);
            },
        }
    );

    if (isLoading || user_details === null) {
        return <Loading />;
    }

    const { username, email, bio, profile_pic } = user_details;

    return (
        <div className="EditProfilePage">
            <div className="header">
                <h2>Edit Profile</h2>
                <button
                    className="cancel_edit_profile_btn"
                    onClick={() =>
                        navigate(`/user/${current_user.username}/profile`)
                    }
                >
                    Back To Profile
                </button>
            </div>

            <EditUsername original_username={username} />

            <EditEmail original_email={email} original_username={username} />

            <EditPassword />

            <EditBio original_bio={bio} original_username={username} />

            <EditProfilePic
                original_profile_pic={profile_pic}
                original_username={username}
            />
        </div>
    );
}

export default EditProfilePage;
