import './Comment.scss';
import { useState, useEffect, useRef } from 'react';

import { calculate_time_passed } from '../helper_functions/time';



import DOMPurify from 'dompurify';

import AddComment from './AddComment';
import ProfilePicture from './ProfilePicture';
import Votes from './Votes';
import Modal from './Modal';

import AdjustableButton from './AdjustableButton';
import ResizablePanel, { useResizablePanel } from './ResizablePanel';
import { get_all_replies_by_comment_id, check_if_comments_or_replies_exist, delete_comment, delete_comment_or_reply } from '../rest_api_requests/CommentRequests';
import { useNotification } from '../Contexts/Notifications/NotificationProvider';
import { useCurrentUser } from '../Contexts/CurrentUser/CurrentUserProvider';


function Comment({ comment, remove_comment_or_reply_from_list, post_id }) {

    
    // the comment component renders both surface level comments and
    // replies of those comments, therfore this component actually serves
    // 2 purposes and behaves slightly differently depending on if 
    // it is a comment or a reply

    const { current_user } = useCurrentUser();
    const add_notification = useNotification();

    const modal_ref = useRef();

    // still need to implement infinite scroll for comments and replies


    const [show_replies_section, set_show_replies_section] = useState(false);
    const [allow_replies_section_btn, set_allow_replies_section_btn] = useState(false);

    const [show_add_reply, set_show_add_reply] = useState(false);

    // const [allow_read_more_btn, set_allow_read_more_btn] = useState(false);
    // const [read_more_content, set_read_more_content] = useState(false);

    const resizable_panel_states = useResizablePanel();

    const [comment_edit_mode, set_comment_edit_mode] = useState(false);
    // const [delete_btn_active, set_delete_btn_active] = useState(false);

    const [all_replies, set_all_replies] = useState([]);

    // required for read_more/less button
    // const comment_content_ref = useRef();

    const add_reply_to_list = (new_reply_details) => {
        // when adding new_reply_details, ensure that
        // it has all the reply details including updatedAt and 
        // author_details = { username, profile_pic }

        set_all_replies([
            ...all_replies,
            { reply_content: new_reply_details }
        ])
    }

    const remove_reply_from_list = (reply_to_remove_id) => {
        
        const new_replies_list = all_replies.filter((my_reply) => {
            return my_reply.reply_content.id !== reply_to_remove_id
        })

        set_all_replies(new_replies_list)

        add_notification("Succesfully Deleted Reply")
    }


    // // for read more btn
    // useEffect(() => {
    //     const comment_content_height = comment_content_ref.current.clientHeight

    //     // only allowing component to render show more/less btn
    //     // if the content of the post takes up more than 100px

    //     //  if you want to change this value, u must also change in the css
    //     // where the classname is .show_less
    //     if (comment_content_height > 100) {
    //         set_allow_read_more_btn(true)
    //     }

    // }, [])


    useEffect(() => {
        initialse_allow_show_replies_section()
    }, [])


    const initialse_allow_show_replies_section = async () => {

        // there is no need to check if there are replies
        // when the comment rendered already is a reply
        if (comment.is_reply === true) {
            // console.log("isreply is true, returning")
            return
        }

        const response = await check_if_comments_or_replies_exist("reply", comment.id);

        if (response.error) {
            console.log(response) 
            return
        }

        set_allow_replies_section_btn(response.is_any)
    }


    const initialise_all_replies = async () => {
        
        if (allow_replies_section_btn === false) {
            return
        }

        const response = await get_all_replies_by_comment_id(comment.id);

        // console.log("initialising all replies")
        if (response.error) {
            console.log(response) 
            return
        }

        // response.all_replies is slightly differnt structure to all_comments
        // actual comment content is in response.all_replies.reply_content
        set_all_replies(response.all_replies)
    }

    const handle_delete_comment = async () => {

        // const response = await delete_comment(comment.id);
        const type = comment.is_reply ? "reply" : "comment";
        const response = await delete_comment_or_reply(type, comment.id);
        

        if (response.error) {
            console.log(response)
            return 
        }

        remove_comment_or_reply_from_list(comment.id)

        // set_delete_btn_active(false)
    }

    

    return (
        <div 
            className={"comment_or_reply " + (comment.is_reply ? "Reply" : "Comment")}
        >

            <Modal
                ref={modal_ref}
                btn_color="red"
                width="300"
            >
                <h2>Delete {comment.is_reply ? "Reply" : "Comment"}?</h2>
                <p>
                    Are you sure you want to delete your {comment.is_reply ? "Reply" : "Comment"}?
                    This action is not reversible.
                </p>

                <button 
                    className='delete_post_btn'
                    onClick={() => {
                        handle_delete_comment()
                        modal_ref.current.close_modal()
                    }}
                >
                    Delete {comment.is_reply ? "Reply" : "Comment"}
                </button>
            </Modal>

            <div className="profile_picture">
                <ProfilePicture
                    profile_picture_url={comment.author_details.profile_pic}
                    username={comment.author_details.username}
                />
            </div>

            <div className="comment_content_container">

                <div className="comment_content">
                    <div className="comment_author_and_edit_delete_btns">
                        <div className="comment_author">
                            <b>{comment.author_details.username} • </b>
                            {comment.edited && "(edited) • "}
                            {calculate_time_passed(comment.updatedAt)} ago
                        </div>
                        {
                            comment.author_details.username === current_user.username
                            &&
                            <div className="edit_and_delete_btns">
                                <AdjustableButton
                                    boolean_check={comment_edit_mode}
                                    execute_onclick={() => set_comment_edit_mode(!comment_edit_mode)}
                                    original_class_name="edit_cancel_btn"
                                    active_name="Cancel"
                                    inactive_name="Edit"
                                    btn_type_txt={true}
                                />

                                <button 
                                    className="delete_comment_btn"
                                    onClick={() => modal_ref.current.open_modal()}
                                >
                                    Delete
                                </button>
                            </div>
                        }
                    </div>
                    {
                        comment_edit_mode
                        ?
                        <>
                        {
                            comment.author_details.username === current_user.username
                            &&
                            <div className='edit_comment'>
                                <AddComment 
                                    parent_comment_id={comment.id}
                                    execute_after_add_comment={() => {
                                        set_comment_edit_mode(false)
                                    }}
                                    is_editing={true}
                                    initial_content={comment.text}
                                    show_profile_pic={false}
                                    comment_type={comment.is_reply ? "Reply" : "Comment"}
                                    btn_text="Save"
                                />
                            </div>
                        }
                        </>
                        :
                        <ResizablePanel
                            min_height={120}
                            {...resizable_panel_states}
                        >
                            <div 
                                className="comment_content_text"                                
                            >
                                <div 
                                    className="comment_text"
                                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(comment.text)}}
                                />
                            </div>
                        </ResizablePanel>
                    }

                </div>

                <div className="comment_btns">
                    <div className="votes_and_read_more_btns">
                        <Votes 
                            vote_type={comment.is_reply ? "reply" : "comment"}
                            comment_id={comment.id}
                        /> 

                        {
                            comment_edit_mode === false
                            &&
                            <div className="show_more_btn">
                                <resizable_panel_states.ShowMoreBtn/>
                            </div>
                        }
                    </div>


                    <div className="reply_btns">

                        {
                            comment.is_reply === false

                            &&
                            <div className="reply_btns">
                                {
                                    current_user.role !== "admin"
                                    &&
                                    <AdjustableButton
                                        boolean_check={show_add_reply}
                                        execute_onclick={() => set_show_add_reply(!show_add_reply)}
                                        original_class_name="reply_btn"
                                        active_name="Cancel"
                                        inactive_name="Reply"
                                        btn_type_txt={true}
                                    />
                                }

                                {
                                    allow_replies_section_btn === true
                                    &&
                                    <AdjustableButton
                                        // boolean_check={show_replies}
                                        boolean_check={show_replies_section}
                                        execute_onclick={() => {
                                            // set_show_replies(!show_replies)
                                            set_show_replies_section(!show_replies_section)

                                            if (show_replies_section === false) {
                                                initialise_all_replies()
                                            }
                                        }}
                                        original_class_name="view_replies_btn"
                                        active_name="Hide Replies"
                                        inactive_name="Show Replies"
                                        btn_type_txt={true}
                                    />
                                }
                            </div>
                        }
                    </div>
                </div>
                    

                <div className="add_comments_and_show_replies">

                    <div className="add_comments">
                        {
                            show_add_reply 
                            && 
                            <AddComment 
                                execute_after_add_comment={() => {
                                    set_show_add_reply(false)
                                    set_show_replies_section(true)
                                }}
                                placeholder="Add Reply"
                                btn_text="Reply"
                                comment_type="reply"

                                post_id={post_id}
                                parent_comment_id={comment.id}

                                add_comment_or_reply_to_list={add_reply_to_list}
                            />
                        }
                    </div>

                    {
                        comment.is_reply === false 
                        &&
                        <div className="comment_replies">
                            {
                                show_replies_section 
                                &&
                                <>
                                {
                                    all_replies.map((reply_object) => {
                                        const reply = reply_object.reply_content;
                                        return (
                                            <Comment
                                                comment={reply} 
                                                key={reply.id}
                                                remove_comment_or_reply_from_list={remove_reply_from_list}
                                            />
                                        )
                                    })
                                }
                                </>
                            }
                        </div>
                    } 
                </div>

            </div>
            
        </div>
    )
}

export default Comment