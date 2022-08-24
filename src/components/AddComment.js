import React, { useState } from 'react';
import './AddComment.scss'

import ProfilePicture from './ProfilePicture';
import ExpandableInput from './ExpandableInput';

function AddComment(props) {

    const [comment_content, set_comment_content] = useState("");

    return (
        <div className="Add_Comment">
            <div className="add_comment_pic_and_input">
                <ProfilePicture/>
                <ExpandableInput
                    set_input_content={set_comment_content}
                    max_height_px={150}
                    placeholder={props.placeholder} 
                    // might want to prop drill this, as it comes from PostContent component
                />
            </div>


            <button
                className="comment_btn"
                onClick={() => props.handle_add_comment(comment_content)}
            >
                {props.btn_text}
            </button>

            
        </div>
    )
}

export default AddComment