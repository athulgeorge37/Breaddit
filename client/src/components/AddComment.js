import React, { useState } from 'react';
import './AddComment.scss'

import ProfilePicture from './ProfilePicture';
import ExpandableInput from './ExpandableInput';

import { create_comment_or_reply, edit_comment_or_reply } from '../rest_api_requests/CommentRequests';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../Contexts/Notifications/NotificationProvider';
import { useCurrentUser } from '../Contexts/CurrentUser/CurrentUserProvider';

function AddComment({ 
        comment_type, execute_after_add_comment, add_comment_or_reply_to_list,
        placeholder, btn_text, initial_content, post_id, 
        parent_comment_id=null, is_editing=false, show_profile_pic=true
    }) {

    const add_notification = useNotification();

    const navigate = useNavigate();
    const { current_user } = useCurrentUser();

    const [comment_content, set_comment_content] = useState("");
    const [error_msg, show_error_msg] =useState(false);


    const submit_add_comment = async () => {
        if (validate_comment_content() === false) {
            return
        }

        const response = await create_comment_or_reply(post_id, comment_content, comment_type, parent_comment_id);

        console.log(response)
        if (response.error) {
            return
        }

        show_error_msg(false)

        const new_comment_or_reply_details = {
            ...response.new_comment_or_reply_details,
            author_details: {
                username: current_user.username,
                profile_pic: current_user.profile_pic
            }
        }

        add_comment_or_reply_to_list(new_comment_or_reply_details)

        execute_after_add_comment()

        add_notification(`Succesfully Added ${btn_text}`)

    }

    const submit_edit_comment = async () => {
        if (validate_comment_content() === false) {
            return
        }

        const response = await edit_comment_or_reply(parent_comment_id, comment_content);
        
        console.log(response)
        if (response.error) {
            return
        }
        show_error_msg(false)
        execute_after_add_comment()

        add_notification(`Succesfully Edited ${comment_type}`)
    }

    const validate_comment_content = () => {
        if (comment_content.trim().length === 0) {
            show_error_msg(true)
            add_notification(`${comment_type} cannot be empty`, "ERROR")
            return false
        }
        return true
    }

    return (
        <div className="Add_Comment">

            {
                current_user.role === "user"
                ?
                <>
                    <div className="add_comment_pic_and_input">
                        {                    
                            show_profile_pic 
                            &&
                            <ProfilePicture 
                                profile_picture_url={current_user.profile_pic}
                                username={current_user.username}
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
                </>
                :
                <div className='not_signed_in'>
                    <button onClick={() => setTimeout(() => navigate("/signin"), 1000)}>
                        Sign In
                    </button> 
                    to Add A Comment
                </div>
            }

        </div>
    )
}

export default AddComment