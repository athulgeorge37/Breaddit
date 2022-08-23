import React, { useState } from 'react';
import './CreatePost.scss';

import TextEditor from './TextEditor';
import ProfilePicture from './ProfilePicture';
import LoginInput from './LoginInput';

import { v4 as uuid } from 'uuid';

const MAX_POST_TEXT_CHARACTERS = 250

function CreatePost({ set_all_posts }) {

    const [expanded_view, set_expanded_view] = useState(false);
    const [post_title, set_post_title] = useState("");
    const [post_text, set_post_text] = useState("");

    const [valid_title, set_valid_title] = useState(true);


    const handle_post = () => {

        // collates all the details of the post we are trying to post
        // we get all the previous post details
        // we add it to local storage, and update the state of all_posts
        // causes re-render showing the new post on the screen

        if (post_title.trim().length === 0) {
            set_valid_title(false)
            return
        }                                   

        const user_who_posted = JSON.parse(localStorage.getItem("Current_User"))

        const new_post_details = {
            post_author: user_who_posted,
            post_id: uuid(),
            post_title: post_title,
            post_text: post_text,
            post_date_time: new Date().getTime(),
            post_up_votes: 0,
            post_down_votes: 0,
            post_comments: []
        }

        // previous_posts is of type array
        let previous_posts = localStorage.getItem("Available_Posts")
        if (previous_posts) {
            previous_posts = JSON.parse(previous_posts)
            const updated_post_list = [new_post_details, ...previous_posts]

            localStorage.setItem("Available_Posts", JSON.stringify(updated_post_list))
            set_all_posts(updated_post_list)
        }

        set_valid_title(true)
        set_post_title("")
        set_post_text("")
        set_expanded_view(false)
    }

    return (
        <div className="Create_Post">
            {
                expanded_view ?
                
                <div className="expanded_post_view">
                    <h2>Create Post</h2>

                    <div className="post_inputs">

                        <div className="post_title">
                            <LoginInput 
                                htmlFor="title" 
                                input_type="text" 
                                label_name="Title"
                                update_on_change={set_post_title} 
                                boolean_check={valid_title}
                            >
                            Title cannot be empty!
                            </LoginInput>
                        </div>                       

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
                                onClick={() => {
                                    set_expanded_view(false)
                                    set_valid_title(true)
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="post_btn"
                                onClick={handle_post}
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