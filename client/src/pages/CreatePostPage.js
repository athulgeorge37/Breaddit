import "./CreatePostPage.scss";
import EditPost from "../features/post/EditPost";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

function CreatePostPage() {
    const { current_user } = useCurrentUser();
    return (
        <div className="CreatePostPage">
            {current_user.role === "admin" ? (
                <span>Admins cannot create a post</span>
            ) : (
                <EditPost mode="create" />
            )}
        </div>
    );
}

export default CreatePostPage;
