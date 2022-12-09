import React, { useState } from "react";
import "./AddComment.scss";

import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import ExpandableInput from "../../components/form/ExpandableInput";

import {
    create_comment_or_reply,
    edit_comment_or_reply,
} from "../../rest_api_requests/CommentRequests";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function AddComment({
    comment_type,
    placeholder,
    btn_text,
    post_id,
    initial_content = "",
    execute_after_add_comment = () => null,
    comment_id = null,
    parent_comment_id = null,
    is_editing = false,
    show_profile_pic = true,
}) {
    const add_notification = useNotification();
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();
    const queryClient = useQueryClient();

    const [comment_content, set_comment_content] = useState(initial_content);
    const [error_msg, show_error_msg] = useState(false);

    const add_comment = useMutation(
        () => {
            return create_comment_or_reply(
                post_id,
                comment_content,
                comment_type,
                parent_comment_id
            );
        },
        {
            onSuccess: () => {
                if (comment_type === "comment") {
                    queryClient.invalidateQueries([
                        "comments_of_post_id",
                        post_id,
                    ]);
                } else if (comment_type === "reply") {
                    queryClient.invalidateQueries([
                        "replies_of_comment_id_and_post_id",
                        parent_comment_id,
                        post_id,
                    ]);
                }

                show_error_msg(false);
                set_comment_content("");
                execute_after_add_comment();
                add_notification(`Succesfully Added ${btn_text}`);
            },
            onError: (error) => {
                console.log({ error });
            },
        }
    );

    const edit_comment = useMutation(
        () => {
            return edit_comment_or_reply(comment_id, comment_content);
        },
        {
            onSuccess: () => {
                if (comment_type === "comment") {
                    // console.log({ comment_type, post_id });
                    queryClient.invalidateQueries([
                        "comments_of_post_id",
                        post_id,
                    ]);
                } else if (comment_type === "reply") {
                    // console.log({ comment_type, post_id, parent_comment_id });
                    queryClient.invalidateQueries([
                        "replies_of_comment_id_and_post_id",
                        parent_comment_id,
                        post_id,
                    ]);
                }

                show_error_msg(false);
                execute_after_add_comment();
                add_notification(`Succesfully Edited ${comment_type}`);
            },
            onError: (error) => {
                console.log({ error });
            },
        }
    );

    const submit_add_comment = () => {
        if (validate_comment_content() === false) {
            return;
        }

        add_comment.mutate();
    };

    const submit_edit_comment = async () => {
        if (validate_comment_content() === false) {
            return;
        }

        edit_comment.mutate();
    };

    const validate_comment_content = () => {
        if (comment_content.trim().length === 0) {
            show_error_msg(true);
            add_notification(`${comment_type} cannot be empty`, "ERROR");
            return false;
        }
        return true;
    };

    return (
        <div className={`Add_Comment ${comment_type}_add_comment`}>
            {current_user.role === "user" ? (
                <>
                    <div className="add_comment_pic_and_input">
                        {show_profile_pic && (
                            <ProfilePicture
                                profile_picture_url={current_user.profile_pic}
                                username={current_user.username}
                            />
                        )}

                        <div className="input_and_errors">
                            <ExpandableInput
                                set_input_content={set_comment_content}
                                max_height_px={150}
                                placeholder={placeholder}
                                initial_content={comment_content}
                            />

                            {error_msg && (
                                <div className="error_msg">
                                    Comment cannot be empty!
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        className="comment_btn"
                        onClick={
                            is_editing
                                ? submit_edit_comment
                                : submit_add_comment
                        }
                    >
                        {btn_text}
                    </button>
                </>
            ) : (
                <div className="not_signed_in">
                    <button
                        onClick={() =>
                            setTimeout(() => navigate("/signin"), 1000)
                        }
                    >
                        Sign In
                    </button>
                    to Add A Comment
                </div>
            )}
        </div>
    );
}

export default AddComment;
