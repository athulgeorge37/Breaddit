// styles
import "./ProfilePicture.scss";

// hooks
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../../context/CurrentUser/CurrentUserProvider";

// ui
import CloudinaryImage from "../../../components/CloudinaryImage";
import ToolTip from "../../../components/ui/ToolTip";

function ProfilePicture({
    profile_picture_url,
    username,
    large = false,
    disable_tooltip = false,
}) {
    const { current_user } = useCurrentUser();
    // make profile_picture_div have an onclick property that redirects them to
    // profile/:their_username
    const navigate = useNavigate();

    const handle_profile_redirect = () => {
        if (current_user.role === "admin") {
            // navigate to the admin dashboard version of their profile
            // navigate(`/admin_dashboard/user_overview/2/${username}`)
        } else {
            navigate(`/user/${username}/profile`);
        }
    };

    return (
        <ToolTip
            text={
                current_user.username === username
                    ? "Go To My Profile"
                    : "Visit Profile"
            }
            disabled={disable_tooltip}
        >
            <button
                className="profile_picture_div"
                onClick={() => {
                    if (disable_tooltip) {
                        return;
                    }
                    handle_profile_redirect();
                }}
            >
                {profile_picture_url === null ? (
                    <div className="default_profile_pic">
                        <svg
                            className="default_profile_pic_icon"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                height: `${large ? 50 : 30}px`,
                                width: `${large ? 50 : 30}px`,
                            }}
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                ) : (
                    <CloudinaryImage
                        image_url={profile_picture_url}
                        style={{
                            width: `calc(${large ? 50 : 30}px + 0.5em)`,
                            height: `calc(${large ? 50 : 30}px + 0.5em)`,
                        }}
                        alt="profile_picture"
                    />
                )}
            </button>
        </ToolTip>
    );
}

export default ProfilePicture;
