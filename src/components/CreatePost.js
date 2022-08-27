import React, { useState } from 'react';
import './CreatePost.scss';

import ProfilePicture from './ProfilePicture';
import EditPost from './EditPost';

import { useEditPost } from './useEditPost';

const MAX_POST_TEXT_CHARACTERS = 250

function CreatePost() {

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
    } = useEditPost(); 


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

                :

                <div className="collapsed_post_view">
                    <ProfilePicture/>
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