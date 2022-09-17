import React, { useState } from 'react';
import './AddComment.scss'

import ProfilePicture from './ProfilePicture';
import ExpandableInput from './ExpandableInput';
import { get_user_details } from '../helper_functions/get_user_details';
import { get_item_local_storage } from '../helper_functions/local_storage';

function AddComment({ handle_add_comment, placeholder, btn_text, initial_content, show_profile_pic=true}) {

    // gotta handle add_comment errors here

    const [comment_content, set_comment_content] = useState("");
    const [error_msg, show_error_msg] =useState(false);

    const current_user_profile_pic = get_user_details(get_item_local_storage("Current_User")).profile_picture_url

    const submit_add_comment = () => {
        if (comment_content.trim().length === 0) {
            show_error_msg(true)
            return
        }

        show_error_msg(false)
        handle_add_comment(comment_content)
    }

    return (
        <div className="Add_Comment">

            <div className="add_comment_pic_and_input">
                {                    
                    show_profile_pic 
                    &&
                    <ProfilePicture 
                        profile_picture_url={current_user_profile_pic}
                    />
                }

                <div className="input_and_errors">
                    <ExpandableInput
                        set_input_content={set_comment_content}
                        max_height_px={150}
                        placeholder={placeholder} 
                        initial_content={initial_content}
                    />

                    {
                        error_msg 
                        &&
                        <div className="error_msg">
                            Comment cannot be empty!
                        </div>
                    }
                </div>
            </div>


            <button
                className="comment_btn"
                onClick={submit_add_comment}
            >
                {btn_text}
            </button>

        </div>
    )
}

export default AddComment