import React, { useState } from 'react';
import LoginInput from '../components/LoginInput';
import PopUpMenu from '../components/PopUpMenu';
import './Profile.scss';
import { useNavigate } from 'react-router-dom';

import ProfilePicture from '../components/ProfilePicture';

import { get_item_local_storage, set_item_local_storage, remove_item_local_storage } from '../helper_functions/local_storage';
import PostContent from '../components/PostContent';
import { get_user_details } from '../helper_functions/get_user_details';
import UsernameInput from './UsernameInput';
import EmailInput from './EmailInput';



const initialise_user_posts = () => {
 
    const all_user_posts = []
    let all_posts = get_item_local_storage("Available_Posts")
    if (all_posts === null) {
        all_posts = []
    }

    let current_author = get_item_local_storage("Current_User")
    for (const post of all_posts){
        if (post.post_author === current_author){
            all_user_posts.push(post)
        }
    }
    return all_user_posts

}

function Profile() {
    const navigate = useNavigate();


    const [user_details, set_user_details] = useState(get_user_details(get_item_local_storage("Current_User")));
    const user_posts = initialise_user_posts();

    const [edit_btn_active, set_edit_btn_active] = useState(false);
    const [delete_confirmation, set_delete_confirmation] = useState(false);

    const [username_info, set_username_info] = useState(
        { username: user_details.username, valid: true}
    );

	const [email_info, set_email_info] = useState(
        {email: user_details.email, valid: true}
    );

   


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

    const handle_edit_user_details = () => {

        if (edit_btn_active === false) {
            set_edit_btn_active(true)
            return
        }

        for(const input of [email_info, username_info]) {
			if (input.valid === false) {
				return
			}
		}

		// setting user_details to localstorage
		let all_users = get_item_local_storage("All_Users")

        const logged_in_user_id = get_item_local_storage("Current_User")

        // modifying user details
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

        // adding the user to a list of all users
		set_item_local_storage("All_Users", all_users)

        // updating state so profile page shows everything
        set_user_details(new_user_details)
        set_edit_btn_active(false)

    }

    const handle_delete_btn = () => {

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


    const handle_sign_out = () => {

        remove_item_local_storage("Current_User")

        navigate("/signin")

    }

    return (
        <div className="Profile_Page">
            {
                user_details.user_id === "unknown"
                ?
                <div>To view your profile, please <button onClick={() => navigate("/signin")}>Sign In</button></div>
                :
            
                <>
                    <div className="User_Info">
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
                                    onClick={handle_edit_user_details}
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
                                    btn_1_handler={() => set_delete_confirmation(false)}

                                    btn_2_txt="Delete"
                                    btn_2_handler={handle_delete_btn}
                                >
                                    <p>
                                        Are you sure you want to delete?
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

                            <div className="logout">
                                <button onClick={handle_sign_out}>Sign Out</button>
                            </div>

                        </div>
                    </div>

                    <div className='user_posts'>
                        {
                            user_posts.length === 0

                            ?

                            <div className='no_posts'>
                                You have not made any posts
                                <button onClick={() => navigate("/posts")}>Create Post</button>
                            </div>

                            :
                            <div className="All_Posts">
                                {user_posts.map((post_details) => {
                                    
                                    return (
                                        <PostContent 
                                            post_details={post_details}
                                            key={post_details.post_id}
                                        />
                                    )
                                })}
                            </div>
                            
                        }
                    </div>
                </>
            }
        </div>
        
    )
}

export default Profile