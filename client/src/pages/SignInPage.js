// styles
import "./SignInPage.scss";

// hooks
import { useEffect, useState } from "react";
import useEmail from "../hooks/useEmail";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useNotification } from "../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

// form
import Input from "../components/form/Input";
import PasswordInput from "../components/form/PasswordInput";

// ui
import Loading from "../components/ui/Loading";

// api
import { sign_in_request } from "../api/UserRequests";

function SignInPage() {
    const navigate = useNavigate();
    const add_notification = useNotification();
    const { initialise_curr_user } = useCurrentUser();
    const location = useLocation();

    const [email, set_email] = useState(location.state?.initialise_email ?? "");
    const { is_unique_email } = useEmail(email);

    const [password, set_password] = useState("");

    const [loading_sign_in, set_loading_sign_in] = useState(false);

    const { mutate: sign_in, data: sign_in_data } = useMutation(
        (as_guest = false) => {
            return sign_in_request(email, password, as_guest);
        },
        {
            onSuccess: async (data) => {
                if (data?.error) {
                    // console.log({ data });
                    if (data.error === "Wrong Email Password Combination") {
                        add_notification(
                            "Invalid Email Password Combination",
                            "ERROR"
                        );
                    } else if (data.error === "User does not exist") {
                        add_notification(
                            "This email isn't connected to an account.",
                            "ERROR"
                        );
                    } else if (
                        data.error ===
                        "The Account associated with this login is banned"
                    ) {
                        add_notification(data.error, "ERROR");
                    } else {
                        console.log({ data });
                        add_notification(
                            "An error occured while Signing In, please try again later",
                            "ERROR"
                        );
                    }
                    return;
                }

                if (data?.is_banned === true) {
                    add_notification("This account has been banned", "ERROR");
                    return;
                }

                set_loading_sign_in(true);

                const { username, role } = await initialise_curr_user();

                setTimeout(() => {
                    set_loading_sign_in(false);
                    add_notification("Succesfully Signed In");

                    if (role === "admin") {
                        navigate(`/admin_dashboard`);
                    } else if (role === "user") {
                        navigate(`/user/${username}/profile`);
                    }
                }, 1500);
            },
            onError: (data) => {
                console.log({ data });
                add_notification(
                    "Unable to Sign In, please try again later",
                    "ERROR"
                );
            },
        }
    );

    const handle_sign_in = () => {
        if (email === "") {
            add_notification("Please enter an email adress", "ERROR");
            return;
        }

        if (password === "") {
            add_notification("Please enter a password", "ERROR");
            return;
        }

        sign_in();
    };

    useEffect(() => {
        if (location.state?.sign_in_as_guest === true) {
            sign_in(true);
        }
    }, []);

    return (
        <div className="SignInPage">
            <div className="sign_in_card">
                <h2>Sign In:</h2>
                <Input
                    label_text="Email:"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => set_email(e.target.value)}
                />

                {is_unique_email === true && email !== "" && (
                    <div className="sign_in_redirect_div">
                        This email is not connected to an account.
                        <button
                            className="sign_up_redirect"
                            onClick={() => navigate("/signup")}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                <PasswordInput
                    password={password}
                    set_password={set_password}
                    set_validity={() => {}}
                    input_props={{
                        label_text: "Password:",
                        id: "password",
                    }}
                    show_errors={false}
                />

                {loading_sign_in ? (
                    <div className="loading_div">
                        <Loading />
                    </div>
                ) : (
                    <button className="sign_in_btn" onClick={handle_sign_in}>
                        Sign In
                    </button>
                )}

                {sign_in_data?.is_banned === true && (
                    <div className="is_banned_error error">
                        The account associated with this email adress has been
                        banned.
                    </div>
                )}

                {sign_in_data?.error === "Wrong Email Password Combination" && (
                    <div className="invalid_credentials error">
                        Invalid Email Password Combination
                    </div>
                )}
            </div>
            <div className="sign_in_as_guest_div">
                Don't want to create an account?
                <button
                    onClick={() => {
                        sign_in(true);
                    }}
                >
                    Sign in as Guest
                </button>
            </div>
        </div>
    );
}

export default SignInPage;
