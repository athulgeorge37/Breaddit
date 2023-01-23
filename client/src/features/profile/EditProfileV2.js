// styles
import "./EditProfileV2.scss";

// components
import EditProfilePic from "./profile_picture/EditProfilePic";
import EditBio from "./EditBio";
import EditUsername from "./EditUsername";
import EditPassword from "./EditPassword";
import EditEmail from "./EditEmail";

// ui
import Loading from "../../components/ui/Loading";

// hooks
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useQuery } from "@tanstack/react-query";
import { get_editable_user_details } from "../../api/UserRequests";
import { useState } from "react";

function EditProfileV2() {
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

    const { username, profile_pic, bio, email } = user_details;

    return (
        <div className="EditProfile">
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

            <EditProfilePic
                original_profile_pic={profile_pic}
                original_username={username}
            />

            <EditBio user_details={user_details} />

            <EditUsername user_details={user_details} />

            <EditPassword />

            <EditEmail original_email={email} original_username={username} />
        </div>
    );
}

export default EditProfileV2;
