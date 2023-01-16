// styles
import "./EditProfileV2.scss";

// components
import EditProfilePic from "./profile_picture/EditProfilePic";
import EditBio from "./EditBio";
import EditUsername from "./EditUsername";
import EditPassword from "./EditPassword";

// hooks
import { useLocation, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

function EditProfileV2() {
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();
    const {
        state: { user_details },
    } = useLocation();

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

            <EditProfilePic user_details={user_details} />

            <EditBio user_details={user_details} />

            <EditUsername user_details={user_details} />

            <EditPassword />
        </div>
    );
}

export default EditProfileV2;
