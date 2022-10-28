// style import
import "./SignIn.scss";

// hook imports
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// component imports
import LoginInput from "../components/form/LoginInput";

// rest api request imports
import { is_unique_email, sign_in } from "../rest_api_requests/UserRequests";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

function SignInPage() {
    const navigate = useNavigate();
    const { initialise_curr_user } = useCurrentUser();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [is_signing_in, set_is_signing_in] = useState(false);

    // constructor to deal with the validity of email and password and the overall form
    const [valid_signup_details, set_valid_signup_details] = useState({
        email_validity: true,
        password_validity: true,
        form_validity: true,
        is_banned: false,
    });

    const submit_sign_in_form = async (e) => {
        e.preventDefault();

        // checks if the form is filled out or not
        for (const field of [email, password]) {
            if (field === "") {
                set_valid_signup_details({
                    ...valid_signup_details,
                    form_validity: false,
                });
                return;
            }
        }

        const unique_email_response = await is_unique_email(email);
        // setting email validity to false, if
        // email entered is unique which means they dont have an account
        const valid_email = !unique_email_response;

        let is_banned = false;
        let valid_password = false;
        if (valid_email) {
            const sign_in_response = await sign_in(email, password);
            if (sign_in_response.error) {
                // if there is no errors
                console.log("sign_in_request error:", sign_in_response.error);
                if (sign_in_response.is_banned === true) {
                    is_banned = true;
                    valid_password = true;
                }
            } else {
                valid_password = true;

                // so that the curr_user state is updated in App.js
                // allows the user to interact with the other pages
                const { username, role } = await initialise_curr_user();

                // Delays the redirect so the user can see the visual cue
                set_is_signing_in(true);

                if (role === "admin") {
                    setTimeout(() => navigate(`/admin_dashboard`), 1000);
                } else if (role === "user") {
                    setTimeout(() => navigate(`/profile/${username}`), 1000);
                }
            }
        }

        set_valid_signup_details({
            ...valid_signup_details,
            email_validity: valid_email,
            password_validity: valid_password,
            form_validity: true,
            is_banned: is_banned,
        });
    };

    return (
        <div className="Sign_In_Page">
            <h2>Sign In</h2>

            <div className="sign_in_card">
                <form onSubmit={submit_sign_in_form}>
                    <LoginInput
                        htmlFor="email"
                        input_type="email"
                        update_on_change={setEmail}
                        boolean_check={valid_signup_details.email_validity}
                    >
                        <div className="link">
                            This email is not connected to an account.
                            <button
                                onClick={() =>
                                    setTimeout(() => navigate("/signup"), 1000)
                                }
                            >
                                Sign Up
                            </button>
                        </div>
                    </LoginInput>

                    <LoginInput
                        htmlFor="password"
                        input_type="password"
                        update_on_change={setPassword}
                        boolean_check={valid_signup_details.password_validity}
                    >
                        Your email password combination is incorrect!
                    </LoginInput>

                    <input
                        type="submit"
                        value={is_signing_in ? "...Signing In" : "Sign In"}
                        className="submit_btn"
                    />
                </form>

                <div className="errors">
                    {valid_signup_details.form_validity === false &&
                        "Please ensure all sign in fields are entered"}

                    {valid_signup_details.is_banned === true &&
                        "The Account associated with this login has been banned"}
                </div>
            </div>
        </div>
    );
}

export default SignInPage;
