import { useState } from "react";
import "./EditProfileV2.scss";
import EditProfilePic from "./profile_picture/EditProfilePic";

function EditProfileV2({ user_details }) {
    return (
        <div className="EditProfileV2">
            <h2>Edit Profile</h2>

            <EditProfilePic user_details={user_details} />
        </div>
    );
}

export default EditProfileV2;
