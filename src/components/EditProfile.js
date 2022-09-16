import './EditProfile.scss';

import EmailInput from '../pages/sign_up_page/components/EmailInput';
import PasswordInput from '../pages/sign_up_page/components/PasswordInput';
import UsernameInput from '../pages/sign_up_page/components/UsernameInput';

import EditProfilePic from './EditProfilePic';
import ExpandableInput from './ExpandableInput';

import { useState, useRef } from 'react';

import { get_user_details } from '../helper_functions/get_user_details';
import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';


function EditProfile({ set_toggle_edit_page }) {

    const inital_user_details = get_user_details(get_item_local_storage("Current_User"));

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
	const [password_info, set_password_info] = useState({ 
        password: inital_user_details.password, 
        valid: true 
    });


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

        for(const sign_up_input of [email_info, username_info, password_info]) {
			if (sign_up_input.valid === false) {
				return
			}
		}

        let all_users = get_item_local_storage("All_Users");
        const current_user = get_item_local_storage("Current_User");
    
        for (const user of all_users) {
            if (user.user_id === current_user) {
                user.username = username_info.username
                user.email = email_info.email
                user.password = password_info.password
                user.about_me = about_me_section
                user.profile_picture_url = profile_picture_url
                break;
            }
        }
    
        set_item_local_storage("All_Users", all_users)

        set_toggle_edit_page(false)
    }
    

    return (
        <div className="edit_profile_page">
            <div className="picture_and_inputs">
                <div className="edit_profile_picture">
                    <EditProfilePic 
                        set_profile_picture_url={set_profile_picture_url}
                        profile_picture_url={profile_picture_url}
                    />                
                </div>

                <div className="edit_user_details">
                    <UsernameInput
                        set_username_info={set_username_info}
                        initial_username={inital_user_details.username}
                    />

                    <ExpandableInput
                        set_input_content={set_about_me_section}
                        max_height_px={150}
                        placeholder={"About Me"} 
                        initial_content={inital_user_details.about_me}
                    />

                    <EmailInput 
                        set_email_info={set_email_info} 
                        initial_email={inital_user_details.email}
                    />

                    <PasswordInput
                        set_password_info={set_password_info}
                        initial_password={inital_user_details.password}
                    />

                </div>
            </div>

            <div className="edit_profile_page_btns">
                <button
                    className='cancel_profile_edits_btn'
                    onClick={handle_revert_changes}
                >
                    Revert Changes
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