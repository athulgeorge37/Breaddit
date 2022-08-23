import React, { useState } from 'react';
import LoginInput from './LoginInput';
import PopUpMenu from './PopUpMenu';
import './Profile.scss';

import ProfilePicture from './ProfilePicture';

import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';


function Profile() {

    const initialise_user_details = () => {

        const logged_in_user_id = get_item_local_storage("Current_User")
        const all_users = get_item_local_storage("All_Users")

        for (const user of all_users) {
            if (user.user_id === logged_in_user_id) {
                return user
            }
        }
    }

    const [user_details, set_user_details] = useState(initialise_user_details());

    const [edit_btn_active, set_edit_btn_active] = useState(false);

    const [username_info, set_username_info] = useState(
        { username: user_details.username, validity: true}
    );

	const [email_info, set_email_info] = useState(
        {email: user_details.email, validity: true}
    );

    const update_username = (new_username) => {
        set_username_info({...username_info, username: new_username})
    }
    const update_email = (new_email) => {
        set_email_info({...email_info, email: new_email})
    }

    const [delete_confirmation, set_delete_confirmation] = useState(false);

    const handle_edit_btn = () => {

        if (edit_btn_active === true) {

            // checks if username is of correct length
            let valid_username = false
            if (username_info.username.length >= 3 && username_info.username.length <= 30) {
                valid_username = true
            }

            let valid_email = false
            if (email_info.email.includes("@") && email_info.email.includes(".")) {
                valid_email = true
            }

            set_username_info({...username_info, validity: valid_username})
            set_email_info({...email_info, validity: valid_email})

            if (valid_username && valid_email) {
                const logged_in_user_id = get_item_local_storage("Current_User")
                let all_users = get_item_local_storage("All_Users")

                let new_user_details = user_details
                for (let n=0; n < all_users.length; n++) {
                    if (all_users[n].user_id === logged_in_user_id) {

                        all_users[n] = {
                            ...all_users[n],
                            username: username_info.username,
                            email: email_info.email,
                        }

                        new_user_details = all_users[n]
                        break
                    }
                }

                set_item_local_storage("All_Users", all_users)
                set_user_details(new_user_details)
                set_edit_btn_active(false)
            } 
            
        } else {
            set_edit_btn_active(true)
        }
    }

    const handle_delete_btn = () => {
        // need to implement
    }

    return (
        <div className="Profile_Page">
            <h1>Profile Page</h1>
            <div className="profile_container">

                <div className="img_date">
                    <div className="profile_pic">
                        <ProfilePicture/>
                    </div>
                    <div className="date_joined">Date Joined: {user_details.date_joined}</div>
                </div>
                
                <div className="username_email">
                    {
                        edit_btn_active ? 

                        <LoginInput 
                            htmlFor="username" 
                            input_type="text" 
                            label_name="Username"
                            input_fill={username_info.username}
                            update_on_change={update_username} 
                            boolean_check={username_info.validity}
                        >
                            Username must be between 3 and 12 characters long
                        </LoginInput>

                        : 

                        <div className="username_div">
                            <label htmlFor="username">Username:</label>
                            <div id="username">
                                {username_info.username}
                            </div>
                        </div>
                    }

                    {
                        edit_btn_active ? 

                        <LoginInput 
                            htmlFor="email" 
                            input_type="email" 
                            input_fill={email_info.email}
                            update_on_change={update_email} 
                            boolean_check={email_info.validity}
                        >
                            Email must contain an "@" and "." characters
                        </LoginInput>

                        : 

                        <div className="email_div">
                            <label htmlFor="email">Email:</label>
                            <div id="email">
                                {email_info.email}
                            </div>
                        </div>
                    }
                    
                    
                </div>

                <div className="profile_btns">
                    <button 
                        className="confirm_edit_btn" 
                        onClick={handle_edit_btn}
                    >
                        <img 
                            src={edit_btn_active ? "./images/confirm.png"  : "./images/edit.png"}
                            alt={edit_btn_active ? "confirm_btn"  : "edit_btn"}
                            className={"confirm_edit_img " + (edit_btn_active ? "confirm_img" : "edit_img")} 
                        />
                    </button>
                    <button 
                        className="delete_btn"
                        onClick={() => set_delete_confirmation(true)}
                    >
                        <img 
                            src="./images/delete.png" 
                            alt="delete_btn" 
                            className="delete_img"
                        />
                    </button>
                </div>

                {
                    delete_confirmation 
                    && 
                    <PopUpMenu
                        title="Delete Account?"

                        btn_1_txt="Cancel"
                        btn_1_handler={set_delete_confirmation}
                        btn_1_parameter={false}

                        btn_2_txt="Delete"
                        btn_2_handler={handle_delete_btn}
                    >
                        <p>
                            Are you sure you want to delete your profile?
                            This action is not reversible.
                        </p>
                    </PopUpMenu>
                }

            </div>
        </div>
    )
}

export default Profile