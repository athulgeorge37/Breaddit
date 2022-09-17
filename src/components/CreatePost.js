import React, { useState } from 'react';
import './CreatePost.scss';

import ProfilePicture from './ProfilePicture';
import EditPost from './EditPost';

import { get_item_local_storage } from '../helper_functions/local_storage';
import { useEditPost } from './useEditPost';
import { useNavigate } from 'react-router-dom';
import { get_user_details } from '../helper_functions/get_user_details';


const MAX_POST_TEXT_CHARACTERS = 250

function CreatePost({ set_all_posts }) {
    const navigate = useNavigate();

    const [expanded_view, set_expanded_view] = useState(false);

    const {
        post_title, 
        post_text, 
        valid_title,
        set_post_title,
        set_valid_title,
        set_post_text,
        handle_add_post,

        image_stuff
    } = useEditPost(set_all_posts); 


    const handle_post_submit = () => {

                
        if (post_title.trim().length === 0) {
            set_valid_title(false)
            return
        }

        // only handling post if there is a post title
        handle_add_post(post_title, post_text, image_stuff.image_url)

        set_valid_title(true)
        set_post_title("")
        set_post_text("")
        image_stuff.set_image_url("")

        set_expanded_view(false)

    }

    return (
        <div className="Create_Post">
            {
                expanded_view ?
                
                <>
                    {
                        get_item_local_storage("Current_User") === null
                        ?
                        <div className="redirect_from_posts">
                            Please{" "}
                            <button 
                                className='sign_in_btn'
                                onClick={() => navigate("/signin")}
                            >
                                Sign In
                            </button>
                            {" "}
                            to Post
                        </div>  
                        :
                        <div className="expanded_post_view">
                            <h2>Create Post</h2>

                            <EditPost
                                set_post_title={set_post_title}
                                valid_title={valid_title}
                                set_post_text={set_post_text}
                                image_stuff={image_stuff}
                            />

                            <div className="characters_and_btns">
                                
                                <span className="characters_left">
                                    {MAX_POST_TEXT_CHARACTERS - post_text.length}
                                    {" "}
                                    characters left
                                </span>

                                <div className="post_btns">
                                    <button 
                                        className="cancel_btn"
                                        onClick={() => {
                                            set_expanded_view(false)
                                            set_valid_title(true)
                                            image_stuff.set_image_url("")
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="post_btn"
                                        onClick={handle_post_submit}
                                    >
                                        Post
                                    </button>
                                </div>

                            </div>
                        </div>
                    }
                </>

                :

                <div className="collapsed_post_view">
                    <ProfilePicture
                        profile_picture_url={get_user_details(get_item_local_storage("Current_User")).profile_picture_url}
                    />
                    <input 
                        type="text" 
                        placeholder="Create Post"
                        onFocus={() => set_expanded_view(true)}
                    />
                </div>
            }

        </div>
    )
}

export default CreatePost