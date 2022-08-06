import React, { useState, useRef, useEffect } from 'react';
import './AddComment.scss'

import { v4 as uuid } from 'uuid';

function AddComment(props) {

    const [comment_content, set_comment_content] = useState("");


    const handle_add_comment = () => {

        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        const new_comment = {
            comment_id: uuid(),
            parent_id: "none",
            children_comments: [],
            indent_level: 0,
            comment_date_time: new Date().getTime(),
            comment_content: comment_content,
            comment_author: "commenter",  // need to change to current user logged in
            comment_up_votes: 0,
            comment_down_votes: 0
        }

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                post.post_comments = [...post.post_comments,
                    new_comment
                ]
            }
        }

        localStorage.setItem("Available_Posts", JSON.stringify(all_posts))

        props.set_show_add_comment(false)
        props.set_show_comments_section(true)
    }

    const handle_resize = (e) => {

        set_comment_content(e.target.value)

        // alows textarea to shrink when space is not being used
        e.target.style.height = 'inherit';
        
        // e.target.style.height = `${e.target.scrollHeight}px`; 

        // ensures add comment text_area does not exceed 150px
        // if it does, it will turn into a scrollable area
        e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
        
    }




    return (
        <div className="Add_Comment">
            <div className="add_comment_pic_and_input">
                <div className="default_profile_pic_div">
                    <img 
                        src="./images/default_user.png" 
                        alt="profile_picture" 
                        className="default_profile_pic"
                    />
                </div>
                <textarea 
                    name="add_comment" 
                    placeholder="Add Comment" 
                    className="add_comment_input" 
                    rows={1}
                    autoFocus
                    onChange={handle_resize}
                />
            </div>


            <button
                className="comment_btn"
                onClick={handle_add_comment}
            >
                Comment
            </button>

            
        </div>
    )
}

export default AddComment