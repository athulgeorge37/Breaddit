// styles
import "./EditUsername.scss";

// hooks
import { useState } from "react";
import useUsername from "../../../hooks/useUsername";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../../context/CurrentUser/CurrentUserProvider";

// ui
import Input from "../../../components/form/Input";

// api
import { edit_user_details } from "../../../api/UserRequests";

function EditUsername({ original_username }) {
    const add_notification = useNotification();
    const queryClient = useQueryClient();
    const { update_current_user_username } = useCurrentUser();

    const [username, set_username] = useState(original_username);
    const [is_editing, set_is_editing] = useState(false);

    const {
        is_unique_username,
        max_fifteen_char,
        min_three_char,
        contains_space,
        is_valid_username,
    } = useUsername(username, original_username);

    const { mutate: update_username } = useMutation(
        () => {
            return edit_user_details({ username: username });
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    if (data.error.name === "SequelizeUniqueConstraintError") {
                        add_notification("Username must be unique", "ERROR");
                    } else {
                        //console.log(data.error);
                    }
                    return;
                }
                update_current_user_username(username);
                queryClient.removeQueries([
                    "user_details",
                    {
                        username: original_username,
                    },
                ]);
                add_notification("Succesfully Edited Username");
                set_is_editing(false);
            },
            onError: () => {
                add_notification(
                    "Unable to edit username, please try again later.",
                    "ERROR"
                );
            },
        }
    );

    return (
        <div className={`EditUsername ${is_editing ? "editing" : ""}`}>
            {is_editing ? (
                <div className="edit_content">
                    <Input
                        label_text="Username:"
                        id="username"
                        type="text"
                        value={username}
                        autoFocus
                        onChange={(e) => set_username(e.target.value)}
                        placeholder="something good"
                        errors={[
                            {
                                id: "is_unique",
                                msg: "Must be a unique username",
                                is_error: !is_unique_username,
                                hidden: false,
                            },
                            {
                                id: "min_three_char",
                                msg: "Must contain atleast 3 characters",
                                is_error: !min_three_char,
                                hidden: false,
                            },
                            {
                                id: "max_fifteen_char",
                                msg: "Must be less than 15 characters",
                                is_error: !max_fifteen_char,
                                hidden: false,
                            },
                            {
                                id: "contains_space",
                                msg: "Cannot contain a space",
                                is_error: contains_space,
                                hidden: false,
                            },
                        ]}
                    />
                </div>
            ) : (
                <div className="static_content">
                    <label htmlFor="username">Username:</label>
                    <p id="username">{username}</p>
                </div>
            )}

            <div className="btns">
                {is_editing ? (
                    <>
                        <button
                            onClick={() => {
                                set_username(original_username);
                                set_is_editing(false);
                            }}
                        >
                            <svg
                                className="cancel_icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Cancel
                        </button>
                        <button
                            className="save_btn"
                            onClick={() => {
                                if (is_valid_username) {
                                    update_username();
                                } else {
                                    add_notification(
                                        "Please ensure you have met all Username requirements",
                                        "ERROR"
                                    );
                                }
                            }}
                        >
                            <svg
                                className="save_icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Save
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            set_is_editing(true);
                        }}
                    >
                        <svg
                            className="edit_icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
}

export default EditUsername;
