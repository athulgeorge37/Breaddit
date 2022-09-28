// style import
import './PostContent.scss';

// hook imports
import { useEffect, useRef, useState, useContext } from 'react';
import { VALID_USER_CONTEXT } from '../App';

// rest api request imports
import { delete_post, edit_post } from '../rest_api_requests/PostRequests';
import { get_all_comments_by_parent_id } from '../rest_api_requests/CommentRequests';

// component imports
import AddComment from './AddComment';
import PopUpMenu from './PopUpMenu';
import ProfilePicture from './ProfilePicture';
import AdjustableButton from './AdjustableButton';
import EditPost from './EditPost';
import Button from './Button';
import Votes from './Votes';
import ParsedText from './ParsedText';
import CloudinaryImage from './CloudinaryImage';

import Comment2 from './Comment2';
import Comment from './Comment';
import { calculate_time_passed } from '../helper_functions/time';


function PostContent2({ post_details, remove_post_from_list }) {

    const { current_user } = useContext(VALID_USER_CONTEXT);

    // required for read_more/less button
    const posted_content_ref = useRef();

    const [show_add_comment, set_show_add_comment] = useState(false);
    const [show_comments_section, set_show_comments_section] = useState(false);

    const [allow_show_more_btn, set_allow_show_more_btn] = useState(false);
    const [show_more_content, set_show_more_content] = useState(false);

    const [edit_btn_active, set_edit_btn_active] = useState(false);
    const [delete_btn_active, set_delete_btn_active] = useState(false);

    
    const [valid_title, set_valid_title] = useState(true);
    const [post_title, set_post_title] = useState(post_details.title);
    const [post_text, set_post_text] = useState(post_details.text);
    const [image_url, set_image_url] = useState(post_details.image)


    const [all_comments, set_all_comments] = useState([]);


    // to get all_comments of post_id
    useEffect(() => {
        get_all_comments_by_parent_id(post_details.id, false).then((response) => {
            if (response.error) {
                console.log(response.error)
            } else {
                // console.log(response.msg)
                // console.log(response.all_comments)
                set_all_comments(response.all_comments)
            }
        })

    }, [])


    // for show more btn
    useEffect(() => {
        // only allowing component to render show more/less btn
        // if the content of the post takes up more than 500px
        if (edit_btn_active === false) {
            const post_content_height = posted_content_ref.current.clientHeight

            // if you want to change this value, u must also change in the css
            // where the classname is .show_less in this component for it to work
            if (post_content_height > 500) {
                set_allow_show_more_btn(true)
            }
        }
        // runs useEffect every rerender, 
        // but only runs code when not in edit mode

        // console.log(post_text)
    })
    

    const handle_edit_post_save = async () => {
        // only handling post if post title is not empty
        if (post_title.trim().length === 0) {
            set_valid_title(false)
            return
        }
        
        // editing post in db
        const response = await edit_post(post_details.id, post_title, post_text, image_url);

        if (response.error) {
            console.log(response)
            return
        }

        

        set_edit_btn_active(false)

    }

    const handle_edit_post_cancel = () => {
        set_post_title(post_details.title)
        set_post_text(post_details.text)
        set_image_url(post_details.image)
        set_edit_btn_active(false)
    }


    const handle_delete_post = async () => {

        // removing post in db
        const response = await delete_post(post_details.id);

        if (response.error) {
            console.log(response)
            return
        }

        // removing post on client side when deleted from db
        remove_post_from_list(post_details.id)

        set_delete_btn_active(false)

    }


    return (
        <div className="PostContent">

            <div className="post_user_and_awards">
                <div className="post_user">
                    <ProfilePicture
                        profile_picture_url={post_details.author_details.profile_pic}
                    />

                    <div className="posted_by_user">
                        <b>{post_details.author_details.username} • </b>
                        {post_details.edited && "(edited) • "}
                        {calculate_time_passed(post_details.updatedAt)} ago
                    </div>
                </div>

                <div className="btns">
                    {
                        post_details.author_details.username === current_user.username
                        ?
                        <>
                            {
                                edit_btn_active 
                                ?
                                <>
                                    <Button 
                                        handle_btn_click={handle_edit_post_save}
                                        type="save"
                                        span_text="Save"
                                        img_name="confirm"
                                        margin_right={true}
                                    />
                                    <Button 
                                        handle_btn_click={handle_edit_post_cancel}
                                        type="cancel"
                                        span_text="Cancel"
                                        img_name="cancel"
                                        margin_right={true}
                                    />
                                </>
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
                        :
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
                    (allow_show_more_btn && (edit_btn_active === false)) 
                    &&
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
                            image_url={image_url}
                            set_image_url={set_image_url}

                            post_title={post_title}
                            set_post_title={set_post_title}

                            post_text={post_text}
                            set_post_text={set_post_text}

                            valid_title={valid_title}
                        />
                        :
                        <div 
                            ref={posted_content_ref}
                            className={
                                "display_text " + 
                                (allow_show_more_btn ? (show_more_content ? "" : "show_less") : "")
                            }
                        >
                            <h1 className="Title">{post_title}</h1>
                            {
                                image_url !== null
                                &&
                                <div className="image_display">
                                    <CloudinaryImage image_url={image_url}/>
                                </div>
                            }
                            <ParsedText>
                                {post_text}
                            </ParsedText>
                        </div>
                    }

                    {
                        delete_btn_active 
                        &&
                        <div className="delete_post_pop_up_div">
                            <PopUpMenu
                                title="Delete Post?"

                                btn_1_txt="Cancel"
                                btn_1_handler={() => set_delete_btn_active(false)}

                                btn_2_txt="Delete"
                                btn_2_handler={handle_delete_post}
                            >
                                <p>
                                    Are you sure you want to delete this Post?
                                    This action is not reversible.
                                </p>
                            </PopUpMenu>
                        </div>
                    }
                </div>

            </div>

            <div className="post_btns">
                <Votes 
                    vote_type="post"
                    post_id={post_details.id}
                /> 

                <div className="both_comments_btns">
                    
                    <Button 
                        handle_btn_click={() => set_show_add_comment(!show_add_comment)}
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
                        is_reply={false}
                        parent_id={post_details.id}
                        execute_after_add_comment={() => {
                            set_show_add_comment(false)
                            set_show_comments_section(true)
                        }}
                        placeholder="Add Comment"
                        btn_text="Comment"
                    />
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
                                    <Comment2 
                                        comment={comment} 
                                        key={comment.id}
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

export default PostContent2