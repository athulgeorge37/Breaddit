import React, { useState, useRef, useEffect } from 'react';
import './AddComment.scss'



function AddComment(props) {

    const [comment_content, set_comment_content] = useState("");


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
                onClick={() => props.handle_add_comment(comment_content)}
            >
                Comment
            </button>

            
        </div>
    )
}

export default AddComment