import React, { useEffect, useRef, useState } from 'react';
import { useEditPost } from './useEditPost';
import './PostContent.scss';

import { v4 as uuid } from 'uuid';

import { get_user_details } from '../helper_functions/get_user_details';
import { get_post_by_post_id } from '../helper_functions/get_post_by_post_id';
import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';
import { calculate_time_passed } from '../helper_functions/time';

import AddComment from './AddComment';

import PopUpMenu from './PopUpMenu';
import ProfilePicture from './ProfilePicture';
import AdjustableButton from './AdjustableButton';
import EditPost from './EditPost';
import { Image } from 'cloudinary-react';
import Comment from './Comment';
import Button from './Button';
import Votes from './Votes';
import ParsedText from './ParsedText';


function PostContent({ post_details }) {

    const user_details = get_user_details(post_details.post_author)

    const [all_comments, set_all_comments] = useState(post_details.post_comments);

    const [show_add_comment, set_show_add_comment] = useState(false);
    const [show_comments_section, set_show_comments_section] = useState(false);

    const [allow_show_more_btn, set_allow_show_more_btn] = useState(false);
    const [show_more_content, set_show_more_content] = useState(false);

    const [add_comment_error_msg, show_add_comment_error_msg] =useState(false);

    const [edit_btn_active, set_edit_btn_active] = useState(false);
    const [delete_btn_active, set_delete_btn_active] = useState(false);

    // required for read_more/less button
    const posted_content_ref = useRef();


    const {
        post_title, 
        set_post_title,

        post_text, 
        set_post_text,

        valid_title,
       
        // post_up_votes,
        // handle_post_up_vote,

        // post_down_votes,
        // handle_post_down_vote,

        handle_edit_post,
        handle_delete_post,
        handle_cancel_edit_post,

        image_stuff
    } = useEditPost(post_details); 




    // for show more btn
    useEffect(() => {
        const post_content_height = posted_content_ref.current.clientHeight

        // only allowing component to render show more/less btn
        // if the content of the post takes up more than 200px

        //  if you want to change this value, u must also change in the css
        // where the classname is .show_less
        if (post_content_height > 500) {
            set_allow_show_more_btn(true)
        }
    }, [])
   

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
        set_all_comments([...all_comments, new_comment])
    }


    const submit_edit_post = () => {
        // must execute when user clicks save

        handle_edit_post(post_details.post_id)
        set_edit_btn_active(false)

    }

    const submit_cancel_edit_post = () => {
        handle_cancel_edit_post()
        set_edit_btn_active(false)
    }


    const submit_delete_post = () => {

        handle_delete_post(post_details.post_id)

        set_delete_btn_active(false)
    }

    const post_content_for_user = () => {

        const updated_post_info = get_post_by_post_id(post_details.post_id)

        return (
            <div className="posted_by_user">
                <b>{get_user_details(post_details.post_author).username} • </b>
                {updated_post_info.edited === true && "(edited) • "}
                {calculate_time_passed(updated_post_info.post_date_time)} ago
            </div>
        )
    }


    return (
        <div className="PostContent">

            {
                delete_btn_active &&

                <div className="delete_post_pop_up_div">
                    <PopUpMenu
                        title="Delete Post?"

                        btn_1_txt="Cancel"
                        btn_1_handler={() => set_delete_btn_active(false)}

                        btn_2_txt="Delete"
                        btn_2_handler={submit_delete_post}
                    >
                        <p>
                            Are you sure you want to delete this Post?
                            This action is not reversible.
                        </p>
                    </PopUpMenu>
                </div>
            }



            <div className="post_user_and_awards">
                <div className="post_user">
                    <ProfilePicture
                        profile_picture_url={user_details.profile_picture_url}
                    />

                    {post_content_for_user()}
                </div>

                <div className="btns">

                    {
                        edit_btn_active 
                        &&
                        <Button 
                            handle_btn_click={submit_edit_post}
                            type="save"
                            span_text="Save"
                            img_name="confirm"
                            margin_right={true}
                        />
                    }

                    {
                        post_details.post_author === get_item_local_storage("Current_User") 
                        &&
                        <>
                            {
                                edit_btn_active 
                                ?
                                <Button 
                                    handle_btn_click={submit_cancel_edit_post}
                                    type="cancel"
                                    span_text="Cancel"
                                    img_name="cancel"
                                    margin_right={true}
                                />
                                :
                                <Button 
                                    handle_btn_click={() => set_edit_btn_active(true)}
                                    type="edit"
                                    span_text="Edit"
                                    img_name="edit"
                                    margin_right={true}
                                />
                            }

                            <Button 
                                handle_btn_click={() => set_delete_btn_active(true)}
                                type="delete"
                                span_text="Delete"
                                img_name="delete"
                                margin_right={true}
                            />
                        </>
                    }

                    {
                        post_details.post_author !== get_item_local_storage("Current_User") 
                        &&
                        <Button 
                            // might need to include on click
                            // handle_btn_click={() => set_delete_btn_active(true)}
                            type="award"
                            span_text="Award"
                            img_name="award"
                            margin_right={true}
                        />
                    }
                </div>
            </div>


            <div className="main_content_and_votes">

                {
                    allow_show_more_btn &&
                    <div className="show_more_btn">
                        <AdjustableButton
                            boolean_check={show_more_content}
                            execute_onclick={() => set_show_more_content(!show_more_content)}
                            original_class_name="show_more_less_btn"
                            active_name="Read Less"
                            inactive_name="Read More"
                            btn_type_txt={true}
                        />
                    </div>
                }

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
                            image_stuff={image_stuff}
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
                            {
                                image_stuff.image_url !== ""
                                &&
                                <div className="image_display">
                                    <Image 
                                        cloudName={image_stuff.CLOUD_NAME}
                                        publicId={image_stuff.image_url}
                                    />
                                </div>
                            }
                            <ParsedText>
                                {post_text}
                            </ParsedText>
                        </div>
                    }
                </div>

            </div>

            <div className="post_btns">
                <Votes 
                    initial_up_votes={post_details.post_up_votes}
                    initial_down_votes={post_details.post_down_votes}
                    vote_type="post"
                    prop_post_id={post_details.post_id}
                /> 
                <div>       
                           
                </div>

                <div className="both_comments_btns">
                    
                    <Button 
                        handle_btn_click={() => {
                            set_show_add_comment(!show_add_comment)
                            show_add_comment_error_msg(false)
                        }}
                        type="add_comment"
                        span_text={show_add_comment ? "Cancel Comment" : "Add Comment"}
                        span_class_name={show_add_comment ? "cancel_comment_span" : "add_comment_span"}
                        img_name="add_comment"
                        margin_right={true}
                        active={show_add_comment}
                    />

                    {
                        all_comments.length > 0 
                        &&
                        <Button 
                            handle_btn_click={() => set_show_comments_section(!show_comments_section)}
                            type="comments_section"
                            span_text={show_comments_section ? "Hide Comments" : "Show Comments"}
                            img_name="comments"
                            margin_right={true}
                            active={show_comments_section}
                        />
                    }


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
                    show_comments_section
                    &&
                    <div className="Comment_Section">
                        {
                            all_comments.map((comment) => {
                                return (
                                    <Comment 
                                        post_id={post_details.post_id}
                                        comment={comment} 
                                        indented={false}
                                        key={comment.comment_id}
                                        set_all_comments={set_all_comments}
                                    />
                                )
                            })
                        }
                    </div>
                }
            </div>

        </div>
    )
}

export default PostContent