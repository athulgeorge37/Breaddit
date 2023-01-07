// styles
import "./EditProfileV2.scss";

// components
import EditProfilePic from "./profile_picture/EditProfilePic";
import EditBio from "./EditBio";

function EditProfileV2({ user_details, set_is_editing_profile }) {
    return (
        <div className="EditProfile">
            <div className="header">
                <h2>Edit Profile</h2>
                <button
                    className="cancel_edit_profile_btn"
                    onClick={() => set_is_editing_profile(false)}
                >
                    Back To Profile
                </button>
            </div>

            <EditProfilePic user_details={user_details} />

            <EditBio user_details={user_details} />
        </div>
    );
}

export default EditProfileV2;
