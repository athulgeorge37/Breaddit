import React, { useState, useContext } from 'react';
import LoginInput from '../components/LoginInput';
import PopUpMenu from '../components/PopUpMenu';
import './Profile.scss';
import { useNavigate } from 'react-router-dom';

import ProfilePicture from '../components/ProfilePicture';

import { get_item_local_storage, set_item_local_storage, remove_item_local_storage } from '../helper_functions/local_storage';
import PostContent from '../components/PostContent';
import { ALL_POSTS_CONTEXT } from '../App';



const initializePosts = () => {
 
    const all_user_posts = []
    let all_posts = get_item_local_storage("Available_Posts")
    let current_author = get_item_local_storage("Current_User")
    for (const post of all_posts){
        if (post.post_author === current_author){
            all_user_posts.push(post)
        }
    }
    return all_user_posts

}

// importing the All_Posts_Context from posts.js

function Profile() {
    const navigate = useNavigate();
    //const { all_posts, set_all_posts } = useContext(ALL_POSTS_CONTEXT);

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


    const user_posts = initializePosts()


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
                    //++count
                }
                if (all_posts[t].post_comments.length !==0){
                    //console.log(i)
                    try{
                        let children_comments = comments[i].children_comments
                    //  console.log(children_comments)
                        for (let j = 0; j < children_comments.length; ++j) {
                            if (logged_in_user_id === children_comments[j].comment_author){
                                all_posts[t].post_comments[i].children_comments.splice(j, 1)
                                --j
                                //++count
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

        navigate("/signup")
        
    }

    return (
       <>
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
                        btn_1_handler={() => set_delete_confirmation(false)}

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
        <div className='user_posts'>
                {
                    user_posts.length === 0

                    ?

                    <div className='no_posts'>
                        Wow, such empty!
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
        
    )
}

export default Profile