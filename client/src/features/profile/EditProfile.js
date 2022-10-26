import "./EditProfile.scss";

import UsernameInput from "../authentication/UsernameInput/UsernameInput";
import EmailInput from "../authentication/EmailInput/EmailInput";
import PasswordInput from "../authentication/PasswordInput/PasswordInput";

import EditProfilePic from "./profile_picture/EditProfilePic";
import ExpandableInput from "../../components/form/ExpandableInput";
import Modal from "../../components/ui/Modal";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
    get_curr_user_details,
    delete_user,
    edit_user_details,
} from "../../rest_api_requests/UserRequests";
import { useEffect } from "react";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useRef } from "react";

function EditProfile({ set_toggle_edit_page }) {
    const navigate = useNavigate();

    const { update_current_user, remove_current_user } = useCurrentUser();
    const modal_ref = useRef();

    const [profile_picture_url, set_profile_picture_url] = useState(null);
    const [bio, set_bio] = useState("");
    const [email_info, set_email_info] = useState({
        email: "",
        valid: true,
    });
    const [username_info, set_username_info] = useState({
        username: "",
        valid: true,
    });
    const [new_password_info, set_new_password_info] = useState({
        password: "Pass1!",
        valid: true,
    });

    useEffect(() => {
        initialise_user_details();
    }, []);

    const initialise_user_details = async () => {
        const response = await get_curr_user_details();

        if (response.error) {
            console.log(response);
            return;
        }

        set_profile_picture_url(response.user_details.profile_pic);
        set_bio(response.user_details.bio);
        set_email_info({
            ...email_info,
            email: response.user_details.email,
        });
        set_username_info({
            ...username_info,
            username: response.user_details.username,
        });
    };

    // const [current_password, set_current_password] = useState({
    //     password: "",
    //     valid: false
    // });

    // const validate_current_password = (curr_password_input) => {

    //     const correct_password = get_user_details(get_item_local_storage("Current_User")).password;

    //     let valid_curr_password = false
    //     if (curr_password_input === correct_password) {
    //        valid_curr_password = true
    //     }

    //     set_current_password({
    //         password: curr_password_input,
    //         valid: valid_curr_password
    //     })

    // }

    const handle_revert_changes = () => {
        // just going back to the read_only version
        // shows original profile details since we havent
        // updated user_profile_details yet
        set_toggle_edit_page(false);
    };

    const handle_submit_edit_profile_form = async () => {
        for (const sign_up_input of [
            email_info,
            username_info,
            new_password_info,
        ]) {
            if (sign_up_input.valid === false) {
                return;
            }
        }

        const response = await edit_user_details(
            email_info.email,
            username_info.username,
            profile_picture_url,
            bio
        );

        if (response.error) {
            console.log(response);
            return;
        }
        //console.log(response)

        // // setting user details again on the client side
        // // to reflect the changes made in the DB
        // set_user_profile_details({
        //     ...user_profile_details,
        //     emai: email_info.email,
        //     username: username_info.username,
        //     profile_pic: profile_picture_url,
        //     bio: bio
        // })

        update_current_user(username_info.username, profile_picture_url);

        set_toggle_edit_page(false);
    };

    const handle_delete_profile = async () => {
        const response = await delete_user();

        console.log(response);
        if (response.error) {
            return;
        }

        setTimeout(() => {
            navigate("/signup");

            remove_current_user();
        }, 1000);
    };

    return (
        <div className="edit_profile_page">
            <Modal ref={modal_ref} btn_color="red" width="500">
                <h2>Are you sure you want to delete your Account?</h2>

                <span>This action will delete:</span>
                <div>
                    <ul>
                        <li>Your Profile</li>
                        <li>Your Posts</li>
                        <li>Your Comments</li>
                    </ul>
                </div>
                <p>This action is not reversible.</p>

                <button
                    className="Delete Account"
                    onClick={() => {
                        handle_delete_profile();
                        modal_ref.current.close_modal();
                    }}
                >
                    Delete Account
                </button>
            </Modal>
            {/* 
            <div className="delete_acount_pop_up_div">
                {
                    delete_confirmation 
                    && 
                    <PopUpMenu
                        title="Delete Account?"

                        btn_1_txt="Cancel"
                        btn_1_handler={() => set_delete_confirmation(false)}

                        btn_2_txt="Delete"
                        btn_2_handler={handle_delete_profile}
                    >
                        <div>
                            Are you sure you want to delete your Account?
                            <br />
                            <span>This action will delete:</span>
                            <ul>
                                <li>Your Profile</li>
                                <li>Your Posts</li>
                                <li>Your Comments</li>
                            </ul>
                            This action is not reversible.
                        </div>
                    </PopUpMenu>
                }
            </div> */}

            <div className="picture_and_inputs">
                <div className="edit_profile_picture">
                    <EditProfilePic
                        set_profile_picture_url={set_profile_picture_url}
                        profile_picture_url={profile_picture_url}
                    />
                </div>

                <div className="email_and_password">
                    {/* <div className="current_password">
                        <PasswordCheck 
                            label_name="Current Password"
                            set_password={validate_current_password}
                        />
                        <div className="errors">
                            <ul>
                                <li 
                                    className={current_password.valid ? "valid" : "invalid"}
                                >
                                    Valid
                                </li>
                            </ul>
                        </div>
                    </div> */}
                    <EmailInput
                        set_email_info={set_email_info}
                        initial_email={email_info.email}
                    />

                    <PasswordInput
                        set_password_info={set_new_password_info}
                        initial_password={new_password_info.password}
                        label_name="New Password"
                    />
                </div>

                <div className="username_and_about_me">
                    <UsernameInput
                        set_username_info={set_username_info}
                        initial_username={username_info.username}
                    />

                    <label htmlFor="about_me">Bio:</label>
                    <ExpandableInput
                        id="about_me"
                        set_input_content={set_bio}
                        max_height_px={150}
                        placeholder={"About Me"}
                        initial_content={bio}
                    />
                </div>
            </div>

            <div className="edit_profile_page_btns">
                <button
                    className="delete_account_btn"
                    onClick={() => modal_ref.current.open_modal()}
                >
                    Delete Account
                </button>

                <button
                    className="cancel_profile_edits_btn"
                    onClick={handle_revert_changes}
                >
                    Cancel Changes
                </button>

                <button
                    className="save_profile_btn"
                    onClick={handle_submit_edit_profile_form}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

export default EditProfile;
