import "./CreatePostPage.scss";
import EditPost from "../features/post/EditPost";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";
import { useNavigate } from "react-router-dom";

function CreatePostPage() {
    const { current_user } = useCurrentUser();
    const navigate = useNavigate();

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
