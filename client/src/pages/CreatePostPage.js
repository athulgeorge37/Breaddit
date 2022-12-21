// styles
import "./CreatePostPage.scss";

// hooks
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

// components
import EditPost from "../features/post/EditPost";

function CreatePostPage() {
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();

    return (
        <div className="CreatePostPage">
            {current_user.authenticated === false ? (
                <div className="sign_in_div">
                    Please to
                    <button onClick={() => navigate("/signin")}>Sign In</button>
                    create a post
                </div>
            ) : (
                <>
                    {current_user.role === "admin" ? (
                        <span>Admins cannot create a post</span>
                    ) : (
                        <EditPost mode="create" />
                    )}
                </>
            )}
        </div>
    );
}

export default CreatePostPage;
