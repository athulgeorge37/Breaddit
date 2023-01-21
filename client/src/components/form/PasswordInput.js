// styles
import "./PasswordInput.scss";

// hooks
import { useEffect, useState } from "react";

// form
import Input from "./Input";

// ui
import ToolTip from "../ui/ToolTip";

// constants
const MIN_PASSWORD_LENGTH = 6;

function PasswordInput({
    input_props,
    password,
    set_password,
    set_validity,
    show_errors = true,
}) {
    const [show_password, set_show_password] = useState(false);
    const [password_validity, set_password_validity] = useState({
        uppercase_letter: false,
        lowercase_letter: false,
        special_character: false,
        number: false,
        valid_length: false,
    });

    const validate_password = () => {
        if (show_errors === false) {
            return;
        }

        let uppercase_letter = false;
        let lowercase_letter = false;
        let special_character = false;
        let number = false;
        let valid_length = false;

        if (password.length >= MIN_PASSWORD_LENGTH) {
            valid_length = true;
        }

        for (const letter of password) {
            if (letter.match(/^[A-Z]*$/)) {
                uppercase_letter = true;
            } else if (letter.match(/^[a-z]*$/)) {
                lowercase_letter = true;
            } else if (
                letter.match(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)
            ) {
                special_character = true;
            } else if (letter.match(/^[0-9]+$/)) {
                number = true;
            }
        }
        set_password_validity({
            uppercase_letter: uppercase_letter,
            lowercase_letter: lowercase_letter,
            special_character: special_character,
            number: number,
            valid_length: valid_length,
        });

        // setting the validity wherever the password is being controlled by
        set_validity(
            uppercase_letter &&
                lowercase_letter &&
                special_character &&
                number &&
                valid_length
        );
    };

    useEffect(() => {
        validate_password(password);
    }, [password]);

    return (
        <div className="PasswordInput">
            <Input
                // label_text="Current Password:"
                // id="current_password"
                // value={value}
                // onChange={onChange}
                // placeholder="ur old password"
                {...input_props}
                onChange={(e) => set_password(e.target.value)}
                type={show_password ? "text" : "password"}
                value={password}
                icon={
                    <ToolTip text={show_password ? "Hide" : "Show"}>
                        <button
                            className="show_password_btn"
                            onClick={() => set_show_password(!show_password)}
                        >
                            {show_password ? (
                                <svg
                                    className="eye_open_icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="eye_closed_icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            )}
                        </button>
                    </ToolTip>
                }
                errors={
                    show_errors
                        ? [
                              {
                                  id: "uppercase_letter",
                                  msg: "Must contain an uppercase letter",
                                  is_error: !password_validity.uppercase_letter,
                                  hidden: false,
                              },
                              {
                                  id: "lowercase_letter",
                                  msg: "Must contain a lowercase letter",
                                  is_error: !password_validity.lowercase_letter,
                                  hidden: false,
                              },
                              {
                                  id: "special_character",
                                  msg: "Must contain a special character",
                                  is_error:
                                      !password_validity.special_character,
                                  hidden: false,
                              },
                              {
                                  id: "number",
                                  msg: "Must contain a number",
                                  is_error: !password_validity.number,
                                  hidden: false,
                              },
                              {
                                  id: "valid_length",
                                  msg: `Must contain atleast ${MIN_PASSWORD_LENGTH} characters`,
                                  is_error: !password_validity.valid_length,
                                  hidden: false,
                              },
                          ]
                        : []
                }
            />
        </div>
    );
}

export default PasswordInput;
