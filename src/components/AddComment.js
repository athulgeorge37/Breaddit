import React, { useState } from 'react';
import './AddComment.scss'

import ProfilePicture from './ProfilePicture';
import ExpandableInput from './ExpandableInput';
import { get_user_details } from '../helper_functions/get_user_details';
import { get_item_local_storage } from '../helper_functions/local_storage';

function AddComment(props) {

    const [comment_content, set_comment_content] = useState("");

    const current_user_profile_pic = get_user_details(get_item_local_storage("Current_User")).profile_picture_url

    return (
        <div className="Add_Comment">
            <div className="add_comment_pic_and_input">
                <ProfilePicture 
                    profile_picture_url={current_user_profile_pic}
                />
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