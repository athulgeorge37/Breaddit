// styles
import "./PasswordInput.scss";

// hooks
import { useState, useRef, useEffect } from "react";

const MIN_PASSWORD_LENGTH = 6;

function PasswordInput({ set_password_info, label_name, initial_password }) {
    const input_ref = useRef(null);

    const [show_password, set_show_password] = useState(false);
    const [password_validity, set_password_validity] = useState({
        uppercase_letter: false,
        lowercase_letter: false,
        special_character: false,
        number: false,
        valid_length: false,
    });

    const validate_password = (new_password) => {
        let uppercase_letter = false;
        let lowercase_letter = false;
        let special_character = false;
        let number = false;
        let valid_length = false;

        if (new_password.length >= MIN_PASSWORD_LENGTH) {
            valid_length = true;
        }

        for (const letter of new_password) {
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

        set_password_info({
            password: new_password,
            valid:
                uppercase_letter &&
                lowercase_letter &&
                special_character &&
                number &&
                valid_length,
        });
    };

    useEffect(() => {
        // required for edit profile component
        // where we initialise the pasword
        if (initial_password !== undefined) {
            validate_password(initial_password);
        }
    }, []);

    return (
        <div className="PasswordInput">
            <label htmlFor="password">{label_name}:</label>
            <div className="password_input">
                <input
                    id="password"
                    type={show_password ? "text" : "password"}
                    onChange={(e) => validate_password(e.target.value)}
                    ref={input_ref}
                    defaultValue={initial_password}
                    data-testid="password_input"
                />
                <img
                    src={
                        show_password
                            ? "../images/visible.png"
                            : "../images/not_visible.png"
                    }
                    alt={show_password ? "show password" : "show password"}
                    onClick={() => {
                        set_show_password(!show_password);
                        input_ref.current.focus();
                    }}
                />
            </div>

            <div className="errors">
                <ul>
                    <li
                        className={
                            password_validity.uppercase_letter
                                ? "valid"
                                : "invalid"
                        }
                    >
                        1 Uppercase Letter
                    </li>
                    <li
                        className={
                            password_validity.lowercase_letter
                                ? "valid"
                                : "invalid"
                        }
                    >
                        1 Lowercase Letter
                    </li>
                    <li
                        className={
                            password_validity.special_character
                                ? "valid"
                                : "invalid"
                        }
                    >
                        1 Special Character
                    </li>
                    <li
                        className={
                            password_validity.number ? "valid" : "invalid"
                        }
                    >
                        1 Number
                    </li>
                    <li
                        className={
                            password_validity.valid_length ? "valid" : "invalid"
                        }
                    >
                        {MIN_PASSWORD_LENGTH} Characters
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default PasswordInput;
