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

function Comment(props) {

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


    const initialise_comment_votes = () => {
        let all_posts = get_item_local_storage("Available_Posts")

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {

                    // if comment rendered is a reply, we must acces different part of
                    // localstorage to intialise the up and down votes
                    if (props.indented) {
                        for (const reply of post.post_comments[n].children_comments) {
                            if (reply.comment_id === props.comment.comment_id) {
                                update_comment_up_votes(reply.comment_up_votes)
                                update_comment_down_votes(reply.comment_down_votes)
                                break;
                            }
                        }
                    } else {
                        // if comment rendered is a surface level comment, we
                        // update up and down votes like this
                        if (post.post_comments[n].comment_id === props.comment.comment_id) {
                            update_comment_up_votes(post.post_comments[n].comment_up_votes)
                            update_comment_down_votes(post.post_comments[n].comment_down_votes)
                            break;
                        }
                    }
                }
                break;
            }
        }
    }

    useEffect(() => {
        // executes on comment component load to initialise all votes for each comment
        initialise_comment_votes()
    }, [])

    const update_local_storage_comment_vote = (new_up_vote, new_down_vote) => {
        // finds the appropriate comment in localstorage, and
        // updates localstorage to contain each comments up and down votes

        let all_posts = get_item_local_storage("Available_Posts")
        

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {

                    // must update different part of local storage if the comment rendered is a reply
                    // for up and down votes
                    if (props.indented) {
                        for (let r=0; r < post.post_comments[n].children_comments.length; r++) {
                            if (post.post_comments[n].children_comments[r].comment_id === props.comment.comment_id) {
                                post.post_comments[n].children_comments[r] = {
                                    ...post.post_comments[n].children_comments[r],
                                    comment_up_votes: new_up_vote,
                                    comment_down_votes: new_down_vote
                                }
                                break;
                            }
                        }
                    } else {
                        // updating surface level commments for up and down votes
                        if (post.post_comments[n].comment_id === props.comment.comment_id) {
                            post.post_comments[n] = {
                                ...post.post_comments[n],
                                comment_up_votes: new_up_vote,
                                comment_down_votes: new_down_vote
                            }
                            break;
                        }
                    }
                }
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)
    }


    const handle_comment_up_vote = () => {
        // updates the UI of up votes
        update_comment_up_votes(comment_up_votes + 1) 

        // updates the local storage of up votes
        update_local_storage_comment_vote(comment_up_votes + 1, comment_down_votes) 
    }

    const handle_comment_down_vote = () => {
        // updates the UI of down votes
        update_comment_down_votes(comment_down_votes - 1) 

        // updates the local storage of down votes
        update_local_storage_comment_vote(comment_up_votes, comment_down_votes - 1) 
    }


    const handle_add_comment_indented = (comment_content) => {

        // this is how we add replies to localstorage
        // with the relevant starter options for a reply
        // very similar to a comment, except no children comments object

        let all_posts = get_item_local_storage("Available_Posts")
        
        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {
                    if (post.post_comments[n].comment_id === props.comment.comment_id) {
                        post.post_comments[n].children_comments = [
                            ...post.post_comments[n].children_comments,
                            {
                                comment_id: uuid(),
                                parent_id: post.post_comments[n].comment_id,
                                // children_comments: [],
                                indented: true,
                                comment_date_time: new Date().getTime(),
                                comment_content: comment_content,
                                comment_author: get_item_local_storage("Current_User"), 
                                comment_up_votes: 0,
                                comment_down_votes: 0
                            }
                        ]
                        props.set_all_comments(post.post_comments)
                        break;
                    }
                }
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)
        
        set_show_reply_to_comment(false)
        set_show_replies(true)
    }


    const render_indented_comments = () => {

        // this function will render all the replies of a surface level comment

        let all_posts = get_item_local_storage("Available_Posts")

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {
                    if (post.post_comments[n].comment_id === props.comment.comment_id) {
                        return (
                            post.post_comments[n].children_comments.map((reply) => {
                                return (
                                    <Comment 
                                        post_id={props.post_id}
                                        comment={reply} 
                                        indented={true}
                                        key={reply.comment_id}
                                        set_all_comments={props.set_all_comments}
                                    />
                                )
                            })
                        )
                    }
                }
                break;
            }
        }


    }
    
    const handle_edit_comment_indented = (edited_comment) => {
        let all_posts = get_item_local_storage("Available_Posts");

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {
                    if (post.post_comments[n].comment_id === props.comment.parent_id) {
                        for (let k=0; k < post.post_comments[n].children_comments.length; k++) {
                            if (post.post_comments[n].children_comments[k].comment_id === props.comment.comment_id) {
                                post.post_comments[n].children_comments[k].comment_content = edited_comment
                                post.post_comments[n].children_comments[k].edited = true
                                post.post_comments[n].children_comments[k].comment_date_time = new Date().getTime()
                                props.set_all_comments(post.post_comments)
                                break;
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)

        set_comment_edit_mode(false)
    }

    const handle_edit_comment = (edited_comment) => {
        let all_posts = get_item_local_storage("Available_Posts");

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {
                    if (post.post_comments[n].comment_id === props.comment.comment_id) {
                        post.post_comments[n].comment_content = edited_comment
                        post.post_comments[n].edited = true
                        post.post_comments[n].comment_date_time = new Date().getTime()
                        props.set_all_comments(post.post_comments)
                        break;
                    }
                }
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)

        set_comment_edit_mode(false)
    }

    const handle_delete_comment = () => {
        let all_posts = get_item_local_storage("Available_Posts");

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {
                    if (props.comment.indented) {
                        for (let k=0; k < post.post_comments[n].children_comments.length; k++) {
                            if (post.post_comments[n].children_comments[k].comment_id === props.comment.comment_id) {
                                post.post_comments[n].children_comments.splice(k, 1);
                                props.set_all_comments(post.post_comments)
                                break;
                            }
                        }
                    } else {
                        if (post.post_comments[n].comment_id === props.comment.comment_id) {
                            post.post_comments.splice(n, 1);
                            props.set_all_comments(post.post_comments)
                            break;
                        }
                    }
                }
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)
    }



    return (
        <div className={"comment_or_reply " + (props.indented ? "Reply" : "Comment")}>

            <div className="profile_picture">
                <ProfilePicture
                    profile_picture_url={get_user_details(props.comment.comment_author).profile_picture_url}
                />
            </div>

            <div className="comment_content_container">

                <div className="comment_content">
                    <div className="comment_author_and_edit_delete_btns">
                        <div className="comment_author">
                            <b>{get_user_details(props.comment.comment_author).username} • </b>
                            {props.comment.edited && "(edited) • "}
                            {calculate_time_passed(props.comment.comment_date_time)} ago
                        </div>
                        {
                            props.comment.comment_author === get_item_local_storage("Current_User")
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
                            props.comment.comment_author === get_item_local_storage("Current_User")
                            &&
                            <div className='edit_comment'>
                                {
                                    props.indented
                                    ?
                                    <AddComment 
                                        handle_add_comment={handle_edit_comment_indented}
                                        initial_content={props.comment.comment_content}
                                        show_profile_pic={false}
                                        btn_text="Save"
                                    />
                                    :
                                    <AddComment 
                                        handle_add_comment={handle_edit_comment}
                                        show_profile_pic={false}
                                        initial_content={props.comment.comment_content}
                                        btn_text="Save"
                                    />
                                }
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

                            {props.comment.comment_content}
                        </div>
                    }

                </div>

                <div className="comment_btns">
                    <div className="votes_and_read_more_btns">
                        <Votes 
                            initial_up_votes={props.comment.comment_up_votes}
                            initial_down_votes={props.comment.comment_down_votes}
                            vote_type={props.indented ? "reply" : "comment"}
                            prop_indented={props.indented}
                            prop_post_id={props.post_id}
                            prop_comment_id={props.comment.comment_id}
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
                            props.indented === false

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
                                    props.comment.children_comments.length > 0 
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
                                handle_add_comment={handle_add_comment_indented}
                                placeholder="Add Reply"
                                btn_text="Reply"
                            />
                        }
                    </div>

                    {
                        props.indented === false &&

                        <div className="comment_replies">
                            {
                                show_replies 
                                &&
                                render_indented_comments()
                            }
                        </div>
                    } 
                </div>

            </div>
            
        </div>
    )
}

export default Comment