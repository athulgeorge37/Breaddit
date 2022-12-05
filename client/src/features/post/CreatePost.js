import { useState } from "react";
import "./CreatePost.scss";

import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import EditPost from "./EditPost";

import { useNavigate } from "react-router-dom";

import { create_post } from "../../rest_api_requests/PostRequests";

import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// import {
//     motion,
//     AnimatePresence,
//     AnimateSharedLayout,
//     LayoutGroup,
// } from "framer-motion";

const MAX_POST_TEXT_CHARACTERS = 500;

function CreatePost() {
    const add_notification = useNotification();
    const { current_user } = useCurrentUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [expanded_view, set_expanded_view] = useState(false);

    const [post_title, set_post_title] = useState("");
    const [post_text, set_post_text] = useState("");
    const [valid_title, set_valid_title] = useState(true);
    const [image_url, set_image_url] = useState(null);

    const make_post = useMutation(
        () => {
            return create_post(post_title, post_text, image_url);
        },
        {
            onSuccess: () => {
                handle_post_cancel();
                add_notification("Succesfully Created Post");
                queryClient.invalidateQueries(["posts"]);
            },
        }
    );

    const handle_post_submit = async () => {
        // only handling post if there is a post title
        if (post_title.trim().length === 0) {
            set_valid_title(false);
            return;
        }

        make_post.mutate();
    };

    const handle_post_cancel = () => {
        set_expanded_view(false);
        set_valid_title(true);
        set_image_url(null);
        set_post_title("");
        set_post_text("");
    };

    return (
        <div className="Create_Post">
            {expanded_view ? (
                <>
                    {current_user.authenticated ? (
                        <div className="expanded_post_view">
                            <h2>Create Post</h2>

                            <EditPost
                                image_url={image_url}
                                set_image_url={set_image_url}
                                post_title={post_title}
                                set_post_title={set_post_title}
                                post_text={post_text}
                                set_post_text={set_post_text}
                                valid_title={valid_title}
                            />

                            <div className="characters_and_btns">
                                <span className="characters_left">
                                    {MAX_POST_TEXT_CHARACTERS -
                                        post_text.length}{" "}
                                    characters left
                                </span>

                                <div className="post_btns">
                                    <button
                                        className="cancel_btn"
                                        onClick={handle_post_cancel}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="post_btn"
                                        onClick={handle_post_submit}
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="redirect_from_posts">
                            Please{" "}
                            <button
                                className="sign_in_btn"
                                onClick={() => navigate("/signin")}
                            >
                                Sign In
                            </button>{" "}
                            to Post
                        </div>
                    )}
                </>
            ) : (
                <div className="collapsed_post_view">
                    <ProfilePicture
                        profile_picture_url={current_user.profile_pic}
                        username={current_user.username}
                    />
                    <input
                        type="text"
                        placeholder="Create Post"
                        onFocus={() => set_expanded_view(true)}
                    />
                </div>
            )}
        </div>
    );
}

export default CreatePost;
