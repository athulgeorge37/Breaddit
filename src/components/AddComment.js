import React, { useState } from 'react';
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

    return (
        <div className="Add_Comment">
            <div className="add_comment_pic_and_input">
                <div className="profile_pic">Img</div>
                <input 
                    type="text" 
                    placeholder="Add Comment" 
                    className="add_comment_input" 
                    autoFocus
                    onChange={(e) => set_comment_content(e.target.value)}
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