import "./EditEmail.scss";

// hooks
import { useState } from "react";
import useEmail from "../../../hooks/useEmail";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../../context/Notifications/NotificationProvider";

// form
import Input from "../../../components/form/Input";
import OTPInput from "../../../components/form/OTPInput";

// ui
import Loading from "../../../components/ui/Loading";

// api
import {
    is_unique_email_request,
    edit_user_details,
} from "../../../api/UserRequests";
import { send_verification_code_email } from "../../../api/EmailRequests";

function EditEmail({ original_email, original_username }) {
    const queryClient = useQueryClient();
    const add_notification = useNotification();
    const [is_editing, set_is_editing] = useState(false);
    const [email, set_email] = useState(original_email);

    const { is_unique_email, is_valid_email } = useEmail(email, original_email);

    const [verification_code, set_verification_code] = useState(null);
    const [email_is_verified, set_email_is_verified] = useState(true);

    const {
        mutate: send_verification_code,
        isLoading: verification_code_loading,
    } = useMutation(
        () => {
            return send_verification_code_email(email, original_username);
        },
        {
            onSuccess: (data) => {
                set_verification_code(data.verification_code);
                add_notification(
                    "Verification Code has been sent to your email adress"
                );
            },
            onError: (data) => {
                add_notification(
                    "Unable to send verification code, please try again later",
                    "ERROR"
                );
            },
        }
    );

    const { mutate: update_email } = useMutation(
        () => {
            return edit_user_details({ email: email });
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    if (data.error.name === "SequelizeUniqueConstraintError") {
                        add_notification("Email must be unique", "ERROR");
                    } else {
                        console.log(data.error);
                    }
                    return;
                }

                queryClient.removeQueries([
                    "user_details",
                    {
                        username: original_username,
                    },
                ]);
                add_notification("Succesfully Edited Email");
                set_is_editing(false);
                set_email_is_verified(false);
                set_verification_code(null);
                set_email(original_email);
            },
            onError: () => {
                add_notification(
                    "Unable to edit email, please try again later.",
                    "ERROR"
                );
            },
        }
    );

    return (
        <div className="EditEmail">
            {is_editing ? (
                <div className="edit_content">
                    <Input
                        label_text="Email:"
                        type="email"
                        id="email"
                        value={email}
                        placeholder="Your new email adress"
                        onChange={(e) => {
                            set_email(e.target.value);
                            set_email_is_verified(false);
                            set_verification_code(null);
                        }}
                        errors={[
                            {
                                id: "is_valid",
                                msg: "Must be a valid email",
                                is_error: !is_valid_email,
                                hidden: false,
                            },
                            {
                                id: "is_unique",
                                msg: "Must be a unique email",
                                is_error: !is_unique_email,
                                hidden: false,
                            },
                        ]}
                    />
                    {email_is_verified ? (
                        <div className="email_is_verified">
                            Your email has been succesfully verified.
                        </div>
                    ) : (
                        <>
                            {verification_code_loading ? (
                                <div className="loading_div">
                                    <Loading />
                                </div>
                            ) : (
                                <>
                                    {email !== "" &&
                                        email !== original_email &&
                                        is_valid_email && (
                                            <>
                                                {is_unique_email && (
                                                    <>
                                                        {verification_code ===
                                                        null ? (
                                                            <button
                                                                className="send_verification_btn"
                                                                onClick={() => {
                                                                    send_verification_code();
                                                                }}
                                                            >
                                                                Send
                                                                Verification
                                                                Code
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="send_verification_btn"
                                                                    onClick={() => {
                                                                        send_verification_code();
                                                                    }}
                                                                >
                                                                    Resend
                                                                    Verification
                                                                    Code
                                                                </button>
                                                                <div className="verification_code_div">
                                                                    <OTPInput
                                                                        input_length={
                                                                            6
                                                                        }
                                                                        onComplete={(
                                                                            user_inputted_code
                                                                        ) => {
                                                                            if (
                                                                                user_inputted_code.toString() ===
                                                                                verification_code.toString()
                                                                            ) {
                                                                                add_notification(
                                                                                    "Your Email Has Been Verified"
                                                                                );
                                                                                set_email_is_verified(
                                                                                    true
                                                                                );
                                                                            } else {
                                                                                add_notification(
                                                                                    "Invalid Code",
                                                                                    "ERROR"
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                </>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="static_content">
                    <label htmlFor="email">Email:</label>
                    <p id="email">{email}</p>
                </div>
            )}

            <div className="btns">
                {is_editing ? (
                    <>
                        <button
                            onClick={() => {
                                set_email(original_email);
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
                                if (email === original_email) {
                                    set_is_editing(false);
                                    set_email(original_email);
                                } else if (
                                    is_valid_email &&
                                    email_is_verified
                                ) {
                                    // update_username();
                                    update_email();
                                } else {
                                    add_notification(
                                        "Please ensure you have met all Email requirements",
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

export default EditEmail;
