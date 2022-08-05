import React, { useState } from 'react';
import './CreatePost.scss';

import TextEditor from './TextEditor';


const MAX_POST_TEXT_CHARACTERS = 250

function CreatePost({ update_all_posts }) {

    const [expanded_view, set_expanded_view] = useState(false);
    const [post_title, set_post_title] = useState("");
    const [post_text, set_post_text] = useState("");

    return (
        <div className="Create_Post">
            {
                expanded_view ?
                
                <div className="expanded_post_view">
                    <h2>Create Post</h2>

                    <div className="post_inputs">
                        <input 
                            type="text" 
                            placeholder="Title" 
                            className="post_title" 
                            autoFocus
                            onChange={(e) => set_post_title(e.target.value)}
                        />

                        <TextEditor update_text={set_post_text}/>

                    </div>

                    <div className="characters_and_btns">
                        <span className="characters_left">
                            {MAX_POST_TEXT_CHARACTERS - post_text.length}
                            {" "}
                            characters left
                        </span>

                        <div className="post_btns">
                            <button 
                                className="cancel_btn"
                                onClick={() => set_expanded_view(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="post_btn"
                                onClick={() => {
                                    update_all_posts(post_title, post_text)
                                    set_expanded_view(false)
                                }}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>

                :

                <div className="collapsed_post_view">
                    <div className="default_profile_pic_div">
                        <img 
                            src="./images/default_user.png" 
                            alt="profile_picture" 
                            className="default_profile_pic"/>
                    </div>
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