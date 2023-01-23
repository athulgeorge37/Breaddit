// styles
import "./EditPassword.scss";

// hooks
import { useState } from "react";
import { useNotification } from "../../../context/Notifications/NotificationProvider";
import { useMutation } from "@tanstack/react-query";

// form
import PasswordInput from "../../../components/form/PasswordInput";

// api
import { edit_user_password } from "../../../api/UserRequests";

function EditPassword() {
    const add_notification = useNotification();
    const [is_editing, set_is_editing] = useState(false);

    // when user clicks save, check if current password is valid before changing it
    const [current_password, set_current_password] = useState("");

    // only check valididty and requirements for new password
    const [new_password, set_new_password] = useState("");
    const [password_validity, set_password_validity] = useState(false);

    const { mutate: update_password } = useMutation(
        () => {
            return edit_user_password({
                current_password: current_password,
                new_password: new_password,
            });
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    add_notification(data.error, "ERROR");
                    return;
                }
                add_notification("Succesfully Edited Password");
                handle_cancel_btn();
            },
            onError: () => {
                add_notification(
                    "Unable to edit password, please try again later.",
                    "ERROR"
                );
            },
        }
    );

    const handle_cancel_btn = () => {
        set_is_editing(false);
        set_current_password("");
        set_new_password("");
        set_password_validity(false);
    };

    const handle_save_btn = () => {
        if (password_validity === false) {
            add_notification(
                "You have not met the password requirements",
                "ERROR"
            );
            return;
        }

        update_password();
    };

    return (
        <div className={`EditPassword ${is_editing ? "editing" : "static"}`}>
            {is_editing ? (
                <div className="edit_content">
                    <PasswordInput
                        password={current_password}
                        set_password={set_current_password}
                        input_props={{
                            label_text: "Current Password:",
                            id: "current_password",
                        }}
                        show_errors={false}
                    />

                    <PasswordInput
                        password={new_password}
                        set_password={set_new_password}
                        set_validity={set_password_validity}
                        input_props={{
                            label_text: "New Password:",
                            id: "new_password",
                        }}
                    />
                </div>
            ) : (
                <div className="static_content">
                    <label>Password:</label>
                </div>
            )}

            <div className="btns">
                {is_editing ? (
                    <>
                        <button onClick={handle_cancel_btn}>
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
                        <button className="save_btn" onClick={handle_save_btn}>
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

export default EditPassword;
