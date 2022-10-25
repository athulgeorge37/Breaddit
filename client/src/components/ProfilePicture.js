import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../Contexts/CurrentUser/CurrentUserProvider";
import CloudinaryImage from "./CloudinaryImage";

import "./ProfilePicture.scss";

function ProfilePicture({ profile_picture_url, username, img_path = ".." }) {
    const { current_user } = useCurrentUser();
    // make profile_picture_div have an onclick property that redirects them to
    // profile/:their_username
    const navigate = useNavigate();

    const handle_profile_redirect = () => {
        if (current_user.role === "admin") {
            // navigate to the admin dashboard version of their profile
            // navigate(`/admin_dashboard/user_overview/2/${username}`)
        } else {
            navigate(`/profile/${username}`);
        }
    };

    return (
        <div className="profile_picture_div" onClick={handle_profile_redirect}>
            {profile_picture_url === null ? (
                <div className="default_profile_pic">
                    <img
                        src={`${img_path}/images/default_user.png`}
                        alt="profile_picture"
                        className="default_profile_pic_img"
                    />
                </div>
            ) : (
                <CloudinaryImage
                    image_url={profile_picture_url}
                    alt="profile_picture"
                />
            )}
        </div>
    );
}

export default ProfilePicture;
