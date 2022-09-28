import React, { useState } from 'react';
import './AddComment.scss'

import ProfilePicture from './ProfilePicture';
import ExpandableInput from './ExpandableInput';
import { get_user_details } from '../helper_functions/get_user_details';
import { get_item_local_storage } from '../helper_functions/local_storage';
import { useContext } from 'react';
import { VALID_USER_CONTEXT } from '../App';


import { create_comment, edit_comment } from '../rest_api_requests/CommentRequests';

function AddComment({ is_reply, parent_id, execute_after_add_comment, placeholder, btn_text, initial_content, is_editing=false, show_profile_pic=true}) {

    const { current_user } = useContext(VALID_USER_CONTEXT);
    // gotta handle add_comment errors here

    const [comment_content, set_comment_content] = useState("");
    const [error_msg, show_error_msg] =useState(false);

    // const current_user_profile_pic = get_user_details(get_item_local_storage("Current_User")).profile_picture_url

    const submit_add_comment = async () => {
        if (validate_comment_content() === false) {
            return
        }

        console.log(parent_id, comment_content, is_reply)
        const response = await create_comment(parent_id, comment_content, is_reply);

        console.log(response)
        if (!response.error) {
            show_error_msg(false)
            execute_after_add_comment()
        }
    }

    const submit_edit_comment = async () => {
        if (validate_comment_content() === false) {
            return
        }

        const response = await edit_comment(parent_id, comment_content);
        console.log(response)
        if (!response.error) {
            show_error_msg(false)
            execute_after_add_comment()
        }

    }

    const validate_comment_content = () => {
        if (comment_content.trim().length === 0) {
            show_error_msg(true)
            return false
        }
        return true
    }

    return (
        <div className="Add_Comment">

            <div className="add_comment_pic_and_input">
                {                    
                    show_profile_pic 
                    &&
                    <ProfilePicture 
                        profile_picture_url={current_user.profile_pic}
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


            {
                is_editing 
                ?
                <button
                    className="comment_btn"
                    onClick={submit_edit_comment}
                >
                    {btn_text}
                </button>
                :
                <button
                    className="comment_btn"
                    onClick={submit_add_comment}
                >
                    {btn_text}
                </button>
            }

        </div>
    )
}

export default AddComment