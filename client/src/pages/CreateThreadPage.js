// styles
import "./CreateThreadPage.scss";

// hooks
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

// components
import CreateThread from "../features/thread/CreateThread";

function CreateThreadPage() {
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();

    return (
        <div className="CreateThreadPage">
            {current_user.authenticated === false ? (
                <div className="sign_in_div">
                    Please to
                    <button onClick={() => navigate("/signin")}>Sign In</button>
                    create a thread
                </div>
            ) : (
                <>
                    {current_user.role === "admin" ? (
                        <span>Admins cannot create a thread</span>
                    ) : (
                        <CreateThread />
                    )}
                </>
            )}
        </div>
    );
}

export default CreateThreadPage;
