import './EditProfile.scss';

import EmailInput from '../pages/sign_up_page/components/EmailInput';
import PasswordInput from '../pages/sign_up_page/components/PasswordInput';
import UsernameInput from '../pages/sign_up_page/components/UsernameInput';
// import PasswordCheck from './PasswordCheck';

import EditProfilePic from './EditProfilePic';
import ExpandableInput from './ExpandableInput';
import PopUpMenu from './PopUpMenu';

import { useState } from 'react';

import { get_user_details } from '../helper_functions/get_user_details';
import { get_item_local_storage, set_item_local_storage, remove_item_local_storage } from '../helper_functions/local_storage';

import { useNavigate } from 'react-router-dom';


function EditProfile({ set_toggle_edit_page }) {

    const navigate = useNavigate();

    const inital_user_details = get_user_details(get_item_local_storage("Current_User"));

    const [delete_confirmation, set_delete_confirmation] = useState(false);

    const [profile_picture_url, set_profile_picture_url] = useState(inital_user_details.profile_picture_url)
    const [about_me_section, set_about_me_section] = useState(inital_user_details.about_me);
    const [email_info, set_email_info] = useState({ 
        email: inital_user_details.email,
        valid: true 
        });
	const [username_info, set_username_info] = useState({ 
        username: inital_user_details.username,     
        valid: true 
    });
	const [new_password_info, set_new_password_info] = useState({ 
        password: inital_user_details.password, 
        valid: true 
    });

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

        let all_users = get_item_local_storage("All_Users");
        const current_user = get_item_local_storage("Current_User");
    
        for (const user of all_users) {
            if (user.user_id === current_user) {
                user.username = inital_user_details.username
                user.email = inital_user_details.email
                user.password = inital_user_details.password
                user.about_me = inital_user_details.about_me
                user.profile_picture_url = inital_user_details.profile_picture_url
                break;
            }
        }
        set_item_local_storage("All_Users", all_users)

        set_toggle_edit_page(false)
    }


    const handle_submit_edit_profile_form = () => {

        for(const sign_up_input of [email_info, username_info, new_password_info]) {
			if (sign_up_input.valid === false) {
				return
			}
		}

        // let use_new_password = true
        // // if new password has changed
        // if (new_password_info.password.length > 0) {
        //     // and the current password is invalid, return
        //     if (current_password.valid === false) {
        //         return
        //     }
        // }

        let all_users = get_item_local_storage("All_Users");
        const current_user = get_item_local_storage("Current_User");
    
        for (const user of all_users) {
            if (user.user_id === current_user) {
                user.username = username_info.username
                user.email = email_info.email
                user.password = new_password_info.password
                user.about_me = about_me_section
                user.profile_picture_url = profile_picture_url
                break;
            }
        }
    
        set_item_local_storage("All_Users", all_users)

        set_toggle_edit_page(false)
    }

    const handle_delete_profile = () => {

        // delete the posts

        const logged_in_user_id = get_item_local_storage("Current_User")
        let all_posts = get_item_local_storage("Available_Posts")
        let all_users = get_item_local_storage("All_Users")
        

        for (let i =0; i < all_posts.length; ++i) {
            if (logged_in_user_id === all_posts[i].post_author) {
                all_posts.splice(i, 1)
                i--     
            }
        }

        
        // delete the comments and replies made by user

        for (let t = 0; t < all_posts.length; ++t) {
            let comments = all_posts[t].post_comments

            for (let i = 0; i < comments.length; ++i){
  
                if (logged_in_user_id === comments[i].comment_author) {
                    all_posts[t].post_comments.splice(i, 1)
                    --i
                }
                if (all_posts[t].post_comments.length !== 0){
                    try{
                        let children_comments = comments[i].children_comments
                        for (let j = 0; j < children_comments.length; ++j) {
                            if (logged_in_user_id === children_comments[j].comment_author){
                                all_posts[t].post_comments[i].children_comments.splice(j, 1)
                                --j
                            }
                        }   
                    }
                    catch(err){

                    }
                }
            }
        }

        set_item_local_storage("Available_Posts", all_posts)

        // delete the user

        for (let i = 0; i < all_users.length; ++i){

            if (logged_in_user_id === all_users[i].user_id) {

                all_users.splice(i, 1)
            }
        }
        
        set_item_local_storage("All_Users", all_users)

        remove_item_local_storage("Current_User")

        setTimeout(() => navigate("/signup"), 1500)
        
    }
    

    return (
        <div className="edit_profile_page">

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
                        <p>
                            Are you sure you want to delete your Account?
                            <br />
                            <span>This action will delete:</span>
                            <ul>
                                <li>Your Profile</li>
                                <li>Your Posts</li>
                                <li>Your Comments</li>
                            </ul>
                            This action is not reversible.
                        </p>
                    </PopUpMenu>
                }
            </div>

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
                        initial_email={inital_user_details.email}
                    />

                    <PasswordInput
                        set_password_info={set_new_password_info}
                        initial_password={inital_user_details.password}
                        label_name="New Password"
                    />

                </div>

                <div className="username_and_about_me">

                    <UsernameInput
                        set_username_info={set_username_info}
                        initial_username={inital_user_details.username}
                    />

                    <label htmlFor="about_me">Bio:</label>
                    <ExpandableInput
                        id="about_me"
                        set_input_content={set_about_me_section}
                        max_height_px={150}
                        placeholder={"About Me"} 
                        initial_content={inital_user_details.about_me}
                    />
                </div>
            </div>

            <div className="edit_profile_page_btns">
                <button 
                    className="delete_account_btn"
                    onClick={() => set_delete_confirmation(true)}
                >
                    Delete Account
                </button>

                <button
                    className='cancel_profile_edits_btn'
                    onClick={handle_revert_changes}
                >
                    Cancel Changes
                </button>

                <button
                    className='save_profile_btn'
                    onClick={handle_submit_edit_profile_form}
                >
                    Save Changes
                </button>
            </div>
        </div>
    )
}

export default EditProfile


