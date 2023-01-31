// styles
import "./ThreadLogo.scss";

// hooks
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useNavigate } from "react-router-dom";

// ui
import CloudinaryImage from "../../components/CloudinaryImage";

function ThreadLogo({ thread_title, img_url, img_path = "../" }) {
    const { current_user } = useCurrentUser();
    const navigate = useNavigate();

    const handle_redirect = () => {
        if (current_user.role === "admin") {
            return;
        } else {
            navigate(
                `/?${new URLSearchParams({
                    thread: thread_title,
                }).toString()}`
            );
        }
    };

    return (
        <div className="ThreadLogo" onClick={handle_redirect}>
            {img_url === null ? (
                <div className="default_profile_pic">
                    <img
                        src={`${img_path}/images/default_user.png`}
                        alt="profile_picture"
                        className="default_profile_pic_img"
                    />
                </div>
            ) : (
                <CloudinaryImage image_url={img_url} alt="thread logo" />
            )}
        </div>
    );
}

export default ThreadLogo;
