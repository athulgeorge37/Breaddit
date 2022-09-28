import React, { useState, useEffect, useRef } from 'react';
import './Comment.scss';

import { calculate_time_passed } from '../helper_functions/time';
import { v4 as uuid } from 'uuid';

import { get_user_details } from '../helper_functions/get_user_details';
import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';

import AddComment from './AddComment';
import ProfilePicture from './ProfilePicture';
import Votes from './Votes';

import AdjustableButton from './AdjustableButton';
import PopUpMenu from './PopUpMenu';
import { useContext } from 'react';
import { VALID_USER_CONTEXT } from '../App';
import { get_all_comments_by_parent_id, delete_comment } from '../rest_api_requests/CommentRequests';

function Comment2({ comment, set_all_comments }) {

    const { current_user } = useContext(VALID_USER_CONTEXT);

    // the comment component renders both surface level comments and
    // replies of those comments, therfore this component actually serves
    // 2 purposes and behaves slightly differently depending on if 
    // it is a comment or a reply

    const [comment_up_votes, update_comment_up_votes] = useState();
    const [comment_down_votes, update_comment_down_votes] = useState();

    const [show_reply_to_comment, set_show_reply_to_comment] = useState(false);
    const [show_replies, set_show_replies] = useState(false);

    const [allow_read_more_btn, set_allow_read_more_btn] = useState(false);
    const [read_more_content, set_read_more_content] = useState(false);

    const [comment_edit_mode, set_comment_edit_mode] = useState(false);
    const [delete_btn_active, set_delete_btn_active] = useState(false);

    const [all_replies, set_all_replies] = useState([]);

    // required for read_more/less button
    const comment_content_ref = useRef();

    useEffect(() => {
        const comment_content_height = comment_content_ref.current.clientHeight

        // only allowing component to render show more/less btn
        // if the content of the post takes up more than 100px

        //  if you want to change this value, u must also change in the css
        // where the classname is .show_less
        if (comment_content_height > 100) {
            set_allow_read_more_btn(true)
        }

    }, [])


    useEffect(() => {
        if (comment.is_reply === false) {
            get_all_comments_by_parent_id(comment.id, true).then((response) => {
                if (response.error) {
                    console.log(response.error)
                    return
                } 
                // console.log(response.msg)
                // console.log(response.all_comments)
                set_all_replies(response.all_comments)
            })
        }
    }, [])


    const handle_delete_comment = async () => {
        const response = await delete_comment(comment.id);
        if (!response.error) {
            console.log(response)
            set_delete_btn_active(false)

            // also update all_posts to reflect in the UI
        }
    }


    

    // const handle_edit_comment = async () => {
    //     const response = await edit_comment()
    //     console.log(response)
    //     if (!response.error) {
    //         set_comment_edit_mode(false)
    //     }
    // }

    // const initialise_comment_votes = () => {
    //     let all_posts = get_item_local_storage("Available_Posts")

    //     for (const post of all_posts) {
    //         if (post.post_id === props.post_id) {
    //             for (let n=0; n < post.post_comments.length; n++) {

    //                 // if comment rendered is a reply, we must acces different part of
    //                 // localstorage to intialise the up and down votes
    //                 if (props.indented) {
    //                     for (const reply of post.post_comments[n].children_comments) {
    //                         if (reply.comment_id === props.comment.comment_id) {
    //                             update_comment_up_votes(reply.comment_up_votes)
    //                             update_comment_down_votes(reply.comment_down_votes)
    //                             break;
    //                         }
    //                     }
    //                 } else {
    //                     // if comment rendered is a surface level comment, we
    //                     // update up and down votes like this
    //                     if (post.post_comments[n].comment_id === props.comment.comment_id) {
    //                         update_comment_up_votes(post.post_comments[n].comment_up_votes)
    //                         update_comment_down_votes(post.post_comments[n].comment_down_votes)
    //                         break;
    //                     }
    //                 }
    //             }
    //             break;
    //         }
    //     }
    // }

    // useEffect(() => {
    //     // executes on comment component load to initialise all votes for each comment
    //     initialise_comment_votes()
    // }, [])

    // const update_local_storage_comment_vote = (new_up_vote, new_down_vote) => {
    //     // finds the appropriate comment in localstorage, and
    //     // updates localstorage to contain each comments up and down votes

    //     let all_posts = get_item_local_storage("Available_Posts")
        

    //     for (const post of all_posts) {
    //         if (post.post_id === props.post_id) {
    //             for (let n=0; n < post.post_comments.length; n++) {

    //                 // must update different part of local storage if the comment rendered is a reply
    //                 // for up and down votes
    //                 if (props.indented) {
    //                     for (let r=0; r < post.post_comments[n].children_comments.length; r++) {
    //                         if (post.post_comments[n].children_comments[r].comment_id === props.comment.comment_id) {
    //                             post.post_comments[n].children_comments[r] = {
    //                                 ...post.post_comments[n].children_comments[r],
    //                                 comment_up_votes: new_up_vote,
    //                                 comment_down_votes: new_down_vote
    //                             }
    //                             break;
    //                         }
    //                     }
    //                 } else {
    //                     // updating surface level commments for up and down votes
    //                     if (post.post_comments[n].comment_id === props.comment.comment_id) {
    //                         post.post_comments[n] = {
    //                             ...post.post_comments[n],
    //                             comment_up_votes: new_up_vote,
    //                             comment_down_votes: new_down_vote
    //                         }
    //                         break;
    //                     }
    //                 }
    //             }
    //             break;
    //         }
    //     }

    //     set_item_local_storage("Available_Posts", all_posts)
    // }


    // const handle_comment_up_vote = () => {
    //     // updates the UI of up votes
    //     update_comment_up_votes(comment_up_votes + 1) 

    //     // updates the local storage of up votes
    //     update_local_storage_comment_vote(comment_up_votes + 1, comment_down_votes) 
    // }

    // const handle_comment_down_vote = () => {
    //     // updates the UI of down votes
    //     update_comment_down_votes(comment_down_votes - 1) 

    //     // updates the local storage of down votes
    //     update_local_storage_comment_vote(comment_up_votes, comment_down_votes - 1) 
    // }


    // const handle_add_comment_indented = (comment_content) => {

    //     // this is how we add replies to localstorage
    //     // with the relevant starter options for a reply
    //     // very similar to a comment, except no children comments object

    //     let all_posts = get_item_local_storage("Available_Posts")
        
    //     for (const post of all_posts) {
    //         if (post.post_id === props.post_id) {
    //             for (let n=0; n < post.post_comments.length; n++) {
    //                 if (post.post_comments[n].comment_id === props.comment.comment_id) {
    //                     post.post_comments[n].children_comments = [
    //                         ...post.post_comments[n].children_comments,
    //                         {
    //                             comment_id: uuid(),
    //                             parent_id: post.post_comments[n].comment_id,
    //                             // children_comments: [],
    //                             indented: true,
    //                             comment_date_time: new Date().getTime(),
    //                             comment_content: comment_content,
    //                             comment_author: get_item_local_storage("Current_User"), 
    //                             comment_up_votes: 0,
    //                             comment_down_votes: 0
    //                         }
    //                     ]
    //                     props.set_all_comments(post.post_comments)
    //                     break;
    //                 }
    //             }
    //             break;
    //         }
    //     }

    //     set_item_local_storage("Available_Posts", all_posts)
        
    //     set_show_reply_to_comment(false)
    //     set_show_replies(true)
    // }


    // const render_indented_comments = () => {

    //     // this function will render all the replies of a surface level comment

    //     let all_posts = get_item_local_storage("Available_Posts")

    //     for (const post of all_posts) {
    //         if (post.post_id === props.post_id) {
    //             for (let n=0; n < post.post_comments.length; n++) {
    //                 if (post.post_comments[n].comment_id === props.comment.comment_id) {
    //                     return (
    //                         post.post_comments[n].children_comments.map((reply) => {
    //                             return (
    //                                 <Comment2 
    //                                     post_id={props.post_id}
    //                                     comment={reply} 
    //                                     indented={true}
    //                                     key={reply.comment_id}
    //                                     set_all_comments={props.set_all_comments}
    //                                 />
    //                             )
    //                         })
    //                     )
    //                 }
    //             }
    //             break;
    //         }
    //     }


    // }
    
    // const handle_edit_comment_indented = (edited_comment) => {
    //     let all_posts = get_item_local_storage("Available_Posts");

    //     for (const post of all_posts) {
    //         if (post.post_id === props.post_id) {
    //             for (let n=0; n < post.post_comments.length; n++) {
    //                 if (post.post_comments[n].comment_id === props.comment.parent_id) {
    //                     for (let k=0; k < post.post_comments[n].children_comments.length; k++) {
    //                         if (post.post_comments[n].children_comments[k].comment_id === props.comment.comment_id) {
    //                             post.post_comments[n].children_comments[k].comment_content = edited_comment
    //                             post.post_comments[n].children_comments[k].edited = true
    //                             post.post_comments[n].children_comments[k].comment_date_time = new Date().getTime()
    //                             props.set_all_comments(post.post_comments)
    //                             break;
    //                         }
    //                     }
    //                     break;
    //                 }
    //             }
    //             break;
    //         }
    //     }

    //     set_item_local_storage("Available_Posts", all_posts)

    //     set_comment_edit_mode(false)
    // }

    // const handle_edit_comment = (edited_comment) => {
    //     let all_posts = get_item_local_storage("Available_Posts");

    //     for (const post of all_posts) {
    //         if (post.post_id === props.post_id) {
    //             for (let n=0; n < post.post_comments.length; n++) {
    //                 if (post.post_comments[n].comment_id === props.comment.comment_id) {
    //                     post.post_comments[n].comment_content = edited_comment
    //                     post.post_comments[n].edited = true
    //                     post.post_comments[n].comment_date_time = new Date().getTime()
    //                     props.set_all_comments(post.post_comments)
    //                     break;
    //                 }
    //             }
    //             break;
    //         }
    //     }

    //     set_item_local_storage("Available_Posts", all_posts)

    //     set_comment_edit_mode(false)
    // }

    // const handle_delete_comment = () => {
    //     let all_posts = get_item_local_storage("Available_Posts");

    //     for (const post of all_posts) {
    //         if (post.post_id === props.post_id) {
    //             for (let n=0; n < post.post_comments.length; n++) {
    //                 if (props.comment.indented) {
    //                     for (let k=0; k < post.post_comments[n].children_comments.length; k++) {
    //                         if (post.post_comments[n].children_comments[k].comment_id === props.comment.comment_id) {
    //                             post.post_comments[n].children_comments.splice(k, 1);
    //                             props.set_all_comments(post.post_comments)
    //                             break;
    //                         }
    //                     }
    //                 } else {
    //                     if (post.post_comments[n].comment_id === props.comment.comment_id) {
    //                         post.post_comments.splice(n, 1);
    //                         props.set_all_comments(post.post_comments)
    //                         break;
    //                     }
    //                 }
    //             }
    //             break;
    //         }
    //     }

    //     set_item_local_storage("Available_Posts", all_posts)
    // }



    return (
        <div className={"comment_or_reply " + (comment.is_reply ? "Reply" : "Comment")}>

            <div className="profile_picture">
                <ProfilePicture
                    profile_picture_url={comment.author_details.profile_pic}
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
                                    onClick={() => set_delete_btn_active(true)}
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
                                    is_reply={comment.is_reply}
                                    parent_id={comment.id}
                                    execute_after_add_comment={() => {
                                        set_comment_edit_mode(false)
                                    }}
                                    is_editing={true}
                                    initial_content={comment.text}
                                    show_profile_pic={false}
                                    btn_text="Save"
                                />
                            </div>
                        }
                        </>
                        :
                        <div 
                            className={"comment_content_text " + (allow_read_more_btn ? (read_more_content ? "" : "show_less") : "")}
                            ref={comment_content_ref}
                        >
                            {
                                delete_btn_active &&

                                <div className="delete_comment_pop_up_div">
                                    <PopUpMenu
                                        title="Delete Comment?"

                                        btn_1_txt="Cancel"
                                        btn_1_handler={() => set_delete_btn_active(false)}

                                        btn_2_txt="Delete"
                                        btn_2_handler={handle_delete_comment}
                                    >
                                        <p>
                                            Are you sure you want to delete your Comment?
                                            This action is not reversible.
                                        </p>
                                    </PopUpMenu>
                                </div>
                            }

                            {comment.text}
                        </div>
                    }

                </div>

                <div className="comment_btns">
                    <div className="votes_and_read_more_btns">
                        <Votes 
                            vote_type={comment.is_reply ? "reply" : "comment"}
                            comment_id={comment.id}
                        /> 

                        <div className="read_more_less_div">               
                            {
                                allow_read_more_btn &&

                                <AdjustableButton
                                    boolean_check={read_more_content}
                                    execute_onclick={() => set_read_more_content(!read_more_content)}
                                    original_class_name="read_more_less_btn"
                                    active_name="Read Less"
                                    inactive_name="Read More"
                                    btn_type_txt={true}
                                />

                            }
                        </div>
                    </div>


                    <div className="reply_btns">

                        {
                            comment.is_reply === false

                            &&
                            <div className="reply_btns">
                                <AdjustableButton
                                    boolean_check={show_reply_to_comment}
                                    execute_onclick={() => set_show_reply_to_comment(!show_reply_to_comment)}
                                    original_class_name="reply_btn"
                                    active_name="Cancel"
                                    inactive_name="Reply"
                                    btn_type_txt={true}
                                />

                                {
                                    all_replies.length > 0 
                                    &&
                                    <AdjustableButton
                                        boolean_check={show_replies}
                                        execute_onclick={() => set_show_replies(!show_replies)}
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
                            show_reply_to_comment 
                            && 
                            <AddComment 
                                is_reply={true}
                                parent_id={comment.id}
                                execute_after_add_comment={() => {
                                    set_show_reply_to_comment(false)
                                    set_show_replies(true)
                                }}
                                placeholder="Add Reply"
                                btn_text="Reply"
                            />
                        }
                    </div>

                    {
                        comment.is_reply === false 
                        &&
                        <div className="comment_replies">
                            {
                                show_replies 
                                &&
                                <>
                                {
                                    all_replies.map((reply) => {
                                        return (
                                            <Comment2 
                                                comment={reply} 
                                                key={reply.id}
                                                set_all_comments={set_all_replies}
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

export default Comment2