// styles
import "./EditUsername.scss";

// hooks
import { useState, useEffect } from "react";
import useDebounce from "../../hooks/useDebounce";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../context/Notifications/NotificationProvider";

// ui
import Input from "../../components/form/Input";

// api
import { is_unique_username_request } from "../../api/UserRequests";
import { edit_user_details } from "../../api/UserRequests";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

function EditUsername({ user_details }) {
    const add_notification = useNotification();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
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
                    <label>Username:</label>
                    <p>{username}</p>
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
                            Cancel
                        </button>
                        <button
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
                            Save
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            set_is_editing(true);
                        }}
                    >
                        Edit
                    </button>
                )}
            </div>
        </div>
    );
}

export default EditUsername;
