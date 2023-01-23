import "./SignUpPage.scss";

// hooks
import { useState } from "react";
import { useUsername } from "../features/profile/edit_profile_details/EditUsername";
import { useEmail } from "../features/profile/edit_profile_details/EditEmail";
import { useMutation } from "@tanstack/react-query";
import { useNotification } from "../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";
import { useNavigate } from "react-router-dom";

// form
import Input from "../components/form/Input";
import PasswordInput from "../components/form/PasswordInput";
import OTPInput from "../components/form/OTPInput";

// ui
import Loading from "../components/ui/Loading";

// api
import { send_verification_code_email } from "../api/EmailRequests";
import { create_user } from "../api/UserRequests";

function SignUpPage() {
    const add_notification = useNotification();
    const { initialise_curr_user } = useCurrentUser();
    const navigate = useNavigate();

    const [username, set_username] = useState("");
    const {
        is_unique_username,
        max_fifteen_char,
        min_three_char,
        contains_space,
        is_valid_username,
    } = useUsername(username);

    const [email, set_email] = useState("");
    const { is_unique_email, is_valid_email } = useEmail(email);

    const [password, set_password] = useState("");
    const [password_validity, set_password_validity] = useState(false);

    const [verification_code, set_verification_code] = useState(null);
    const [email_is_verified, set_email_is_verified] = useState(false);

    const [is_loading_redirect, set_is_loading_redirect] = useState(false);

    const {
        mutate: send_verification_code,
        isLoading: verification_code_loading,
    } = useMutation(
        () => {
            return send_verification_code_email(email, username);
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

    const { mutate: sign_up } = useMutation(
        () => {
            return create_user(email, username, password);
        },
        {
            onSuccess: async () => {
                const user_details = await initialise_curr_user();
                set_is_loading_redirect(true);

                setTimeout(() => {
                    add_notification("Succesfully Signed Up");
                    navigate(`/user/${user_details.username}/profile`);
                    set_is_loading_redirect(false);
                }, 1500);
            },
            onError: (data) => {
                console.log(data);
                add_notification(
                    "Unable To Sign Up, please try again later",
                    "ERROR"
                );
            },
        }
    );

    const handle_sign_up = () => {
        if (is_valid_username === false || username === "") {
            add_notification(
                "Please ensure you have met the username requirements",
                "ERROR"
            );
            return;
        }

        if (is_valid_email === false || email === "") {
            add_notification(
                "Please ensure you have met the email requirements",
                "ERROR"
            );
            return;
        }

        if (email_is_verified === false) {
            add_notification(
                "Please ensure you have verified your email with the verification code",
                "ERROR"
            );
            return;
        }

        if (password_validity === false) {
            add_notification(
                "Please ensure you have me the password requirements",
                "ERROR"
            );
            return;
        }

        sign_up();
    };

    return (
        <div className="SignUpPage">
            <h2>Sign Up:</h2>
            <Input
                label_text="Username:"
                type="text"
                id="username"
                value={username}
                onChange={(e) => set_username(e.target.value)}
                errors={[
                    {
                        id: "min_three_char",
                        msg: "Must contain atleast 3 characters",
                        is_error: !min_three_char,
                        hidden: username === "" ? true : false,
                    },
                    {
                        id: "max_fifteen_char",
                        msg: "Must be less than 15 characters",
                        is_error: !max_fifteen_char,
                        hidden: username === "" ? true : false,
                    },
                    {
                        id: "contains_space",
                        msg: "Must not contain a space",
                        is_error: contains_space,
                        hidden: username === "" ? true : false,
                    },
                    {
                        id: "is_unique",
                        msg: "Must be a unique username",
                        is_error: !is_unique_username,
                        hidden: username === "" ? true : false,
                    },
                ]}
            />

            <Input
                label_text="Email:"
                type="email"
                id="email"
                value={email}
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
                        hidden: email === "" ? true : false,
                    },
                    {
                        id: "is_unique",
                        msg: "Must be a unique email",
                        is_error: !is_unique_email,
                        hidden: email === "" ? true : false,
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
                            {email !== "" && is_valid_email && (
                                <>
                                    {is_unique_email ? (
                                        <>
                                            {verification_code === null ? (
                                                <button
                                                    className="send_verification_btn"
                                                    onClick={() => {
                                                        if (is_valid_username) {
                                                            send_verification_code();
                                                        } else {
                                                            add_notification(
                                                                "Please ensure username is valid first",
                                                                "ERROR"
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Send Verification Code
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        className="send_verification_btn"
                                                        onClick={() => {
                                                            if (
                                                                is_valid_username
                                                            ) {
                                                                send_verification_code();
                                                            }
                                                        }}
                                                    >
                                                        Resend Verification Code
                                                    </button>
                                                    <div className="verification_code_div">
                                                        <OTPInput
                                                            input_length={6}
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
                                    ) : (
                                        <div className="sign_in_redirect">
                                            This email already has an account.
                                            <button
                                                className="sign_in_btn"
                                                onClick={() =>
                                                    navigate("/signin")
                                                }
                                            >
                                                Sign In
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}

            <PasswordInput
                password={password}
                set_password={set_password}
                set_validity={set_password_validity}
                input_props={{
                    label_text: "Password:",
                    id: "password",
                }}
                show_errors={password === "" ? false : true}
            />

            {is_loading_redirect ? (
                <div className="loading_div">
                    <Loading />
                </div>
            ) : (
                <button
                    className="sign_up_btn"
                    // disabled={true}
                    onClick={handle_sign_up}
                >
                    Sign Up
                </button>
            )}
        </div>
    );
}

export default SignUpPage;
