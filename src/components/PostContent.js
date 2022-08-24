import React, { useEffect, useRef, useState } from 'react';
import './PostContent.scss';

import parse from 'html-react-parser';
import { v4 as uuid } from 'uuid';
import { get_user_details } from '../helper_functions/get_user_details';
import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';

import AddComment from './AddComment';
import CommentSection from './CommentSection';

import { calculate_time_passed } from '../helper_functions/calculate_time_passed';
import ProfilePicture from './ProfilePicture';
import AdjustableButton from './AdjustableButton';
import EditPost from './EditPost';


import { useEditPost } from './useEditPost';
import { get_post_by_post_id } from '../helper_functions/get_post_by_post_id';

function PostContent({ post_details }) {

    const [post_up_votes, update_post_up_votes] = useState(0);
    const [post_down_votes, update_post_down_votes] = useState(0);

    const [show_add_comment, set_show_add_comment] = useState(false);
    const [show_comments_section, set_show_comments_section] = useState(false);

    const [allow_show_more_btn, set_allow_show_more_btn] = useState(false);
    const [show_more_content, set_show_more_content] = useState(false);

    const [add_comment_error_msg, show_add_comment_error_msg] =useState(false);


    const [edit_btn_active, set_edit_btn_active] = useState(false);

    // const [post_text, set_post_text] = useState(post_details.post_text);

    // required for read_more/less button
    const posted_content_ref = useRef();


    const {
        post_title, 
        post_text, 
        valid_title,
        set_post_title,
        set_valid_title,
        set_post_text,
        handle_add_post    // need to create and use an handle_edit_post
    } = useEditPost(post_details.post_title, post_details.post_text); 



    useEffect(() => {
        const post_content_height = posted_content_ref.current.clientHeight

        // only allowing component to render show more/less btn
        // if the content of the post takes up more than 200px

        //  if you want to change this value, u must also change in the css
        // where the classname is .show_less
        if (post_content_height > 200) {
            set_allow_show_more_btn(true)
        }
    }, [])



    const initialise_post_votes = () => {
        let all_posts = get_item_local_storage("Available_Posts")

        for (const post of all_posts) {
            if (post.post_id === post_details.post_id) {
                update_post_up_votes(post.post_up_votes)
                update_post_down_votes(post.post_down_votes)
                break;
            }
        }
    }

    useEffect(() => {
        // executes on postcontent component load to initialise all votes for each post
        initialise_post_votes()
    }, [])


    const update_local_storage_post_vote = (new_up_vote, new_down_vote) => {
        // finds the appropriate post in localstorage, and
        // updates localstorage to contain each post's up and down votes

        let all_posts = get_item_local_storage("Available_Posts")

        for (const post of all_posts) {
            if (post.post_id === post_details.post_id) {

                post.post_up_votes = new_up_vote
                post.post_down_votes = new_down_vote
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)
    }

    const handle_post_up_vote = () => {
        // updates the UI of up votes
        update_post_up_votes(post_up_votes + 1) 

        // updates the local storage of up votes
        update_local_storage_post_vote(post_up_votes + 1, post_down_votes) 
    }

    const handle_post_down_vote = () => {
        // updates the UI of down votes
        update_post_down_votes(post_down_votes - 1) 

        // updates the local storage of down votes
        update_local_storage_post_vote(post_up_votes, post_down_votes - 1) 
    }

    const handle_add_comment_surface_level = (comment_content) => {

        let all_posts = get_item_local_storage("Available_Posts")

        if (comment_content.trim().length === 0) {
            show_add_comment_error_msg(true)
            return
        }

        const new_comment = {
            comment_id: uuid(),
            parent_id: "none",
            children_comments: [],
            indented: false,
            comment_date_time: new Date().getTime(),
            comment_content: comment_content,
            comment_author: get_item_local_storage("Current_User"),
            comment_up_votes: 0,
            comment_down_votes: 0
        }

        for (const post of all_posts) {
            if (post.post_id === post_details.post_id) {
                post.post_comments = [...post.post_comments,
                    new_comment
                ]
            }
        }

        set_item_local_storage("Available_Posts", all_posts)

        show_add_comment_error_msg(false)
        set_show_add_comment(false)
        set_show_comments_section(true)
    }


    const handle_edit_post = () => {
        // must execute when user clicks save

        let all_posts = get_item_local_storage("Available_Posts")

        for (const post of all_posts) {
            if (post.post_id === post_details.post_id) {
                post.post_text = post_text
                post.edited = true
                post.post_date_time = new Date().getTime()
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)

        set_edit_btn_active(false)

    }


    return (
        <div className="PostContent">

            <div className="post_user_and_awards">
                <div className="post_user">
                    <ProfilePicture/>

                    <div className="posted_by_user">
                        <b>{get_user_details(post_details.post_author).username} • </b>
                        {get_post_by_post_id(post_details.post_id).edited === true && "(edited) • "}
                        {calculate_time_passed(get_post_by_post_id( post_details.post_id).post_date_time)} ago
                    </div>
                    
                </div>

                <div className="btns">

                    {
                        edit_btn_active &&

                        <button 
                            className="save_btn"
                            onClick={handle_edit_post}
                        >
                            Save
                        </button>
                    }


                    {
                        post_details.post_author === get_item_local_storage("Current_User") 
                        &&
                        <AdjustableButton
                            boolean_check={edit_btn_active}
                            execute_onclick={() => set_edit_btn_active(!edit_btn_active)}
                            original_class_name="edit_btn"
                            active_name="Cancel"
                            inactive_name="Edit"
                        />
                    }

                    <button className="awards">
                        Give Award
                    </button>

                </div>
            </div>


            <div className="main_content_and_votes">

                <div className="text_content">
                    {
                        edit_btn_active 

                        ?

                        <EditPost
                            post_title={post_title}
                            set_post_title={set_post_title}
                            post_text={post_text}
                            set_post_text={set_post_text}
                            valid_title={valid_title}
                            
                        />

                        :

                        <div 
                            className={
                                "display_text " + 
                                (allow_show_more_btn ? (show_more_content ? "" : "show_less") : "")
                            }
                            ref={posted_content_ref}
                        >
                            <h1 className="Title">{post_title}</h1>
                            <div className="parsed_text">
                                {parse(post_text)}
                            </div>
                        </div>
                    }
                </div>

                <div className="votes">

                    <div className="up_votes">
                        {post_up_votes}
                    </div>
                    <button 
                        className="up_arrow"
                        onClick={handle_post_up_vote}
                    >
                        <img 
                            src="./images/up_arrow_v2.png" 
                            alt="up_vote" 
                            className="vote_img up_vote"
                        />
                    </button>

                    <button 
                        className="down_arrow"
                        onClick={handle_post_down_vote}
                    >
                        <img 
                            src="./images/up_arrow_v2.png" 
                            alt="up_vote" 
                            className="vote_img down down_vote"
                        />
                    </button>
                    <div className="down_votes">
                        {post_down_votes}
                    </div>

                </div>
            </div>

            <div className="post_btns">

                <div>               
                    {
                        allow_show_more_btn &&

                        <AdjustableButton
                            boolean_check={show_more_content}
                            execute_onclick={() => set_show_more_content(!show_more_content)}
                            original_class_name="show_more_less_btn"
                            active_name="Read Less"
                            inactive_name="Read More"
                        />

                    }
                </div>

                <div className="both_comments_btns">
                    <AdjustableButton
                        boolean_check={show_add_comment}
                        execute_onclick={() => {
                            set_show_add_comment(!show_add_comment)
                            show_add_comment_error_msg(false)
                        }}
                        active_name="Cancel"
                        inactive_name="Add Comment"
                    />
                    <AdjustableButton
                        boolean_check={show_comments_section}
                        execute_onclick={() => set_show_comments_section(!show_comments_section)}
                        original_class_name="comments_btn"
                        active_name="Hide Comments"
                        inactive_name="Show Comments"
                    />
                </div>
                
            </div>

            <div className="expanded_add_comment">
                {
                    show_add_comment &&

                    <AddComment 
                        handle_add_comment={handle_add_comment_surface_level}
                        placeholder="Add Comment"
                        btn_text="Comment"
                        show_errors={add_comment_error_msg}
                    />
                }

                {
                    add_comment_error_msg &&
                    <div className="add_comment_error_msg">
                        Comment cannot be empty!
                    </div>
                }
            </div>

            <div className="expanded_comments_section">
                {
                    show_comments_section &&

                    <CommentSection
                        post_id={post_details.post_id}
                    />

                }
            </div>

        </div>
    )
}

export default PostContent