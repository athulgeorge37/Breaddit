// styles
import "./EditUsername.scss";

// hooks
import { useState, useEffect } from "react";
import useDebounce from "../../hooks/useDebounce";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

// ui
import Input from "../../components/form/Input";

// api
import { is_unique_username_request } from "../../api/UserRequests";
import { edit_user_details } from "../../api/UserRequests";

function EditUsername({ user_details }) {
    const add_notification = useNotification();
    const queryClient = useQueryClient();
    const { update_current_user_username } = useCurrentUser();

    const [username, set_username] = useState(user_details.username);
    const [is_editing, set_is_editing] = useState(false);

    const [is_unique_username, set_is_unique_username] = useState(true);
    const debounced_search = useDebounce(username, 500);
    // const [is_loading, set_is_loading] = useState(false);
    const [min_three_char, set_min_three_char] = useState(true);
    const [max_fifteen_char, set_max_fifteen_char] = useState(true);

    useEffect(() => {
        // searching the api for thread names
        const check_is_unique_username = async () => {
            // set_is_loading(true);

            if (username === "") {
                set_is_unique_username(false);
                return;
            }

            if (username === user_details.username) {
                // when user is searching their own name, no need to make a request
                // and should be true since they already have registered that username
                set_is_unique_username(true);
                return;
            }

            let has_min_three_char = true;
            if (username.length < 3) {
                has_min_three_char = false;
            }

            let has_max_fifteen_char = true;
            if (username.length > 15) {
                has_max_fifteen_char = false;
            }

            set_max_fifteen_char(has_max_fifteen_char);
            set_min_three_char(has_min_three_char);

            if (!has_min_three_char || !has_max_fifteen_char) {
                // not making a request until they have met the following conditions
                return;
            }

            const data = await is_unique_username_request(debounced_search);
            if (data.error) {
                console.log({ data });
                return;
            }
            set_is_unique_username(data.is_unique);

            // set_is_loading(false);
        };

        if (debounced_search) {
            // will only check if username is unqiue when 500ms
            // has passed, after typing
            check_is_unique_username();
        }
    }, [debounced_search]);

    const { mutate: update_username } = useMutation(
        () => {
            return edit_user_details({ username: username });
        },
        {
            onSuccess: () => {
                update_current_user_username(username);
                queryClient.removeQueries([
                    "user_details",
                    {
                        username: user_details.username,
                    },
                ]);
                add_notification("Succesfully Edited Username");
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
                                set_username(user_details.username);
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
                                if (
                                    is_unique_username &&
                                    min_three_char &&
                                    max_fifteen_char
                                ) {
                                    update_username();
                                    set_is_editing(false);
                                } else {
                                    add_notification(
                                        "Please ensure you have met all Username requirements",
                                        "ERROR"
                                    );
                                }
                                // navigate(`/user/${username}/profile`);
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
