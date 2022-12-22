// This component is not currently being used

// style import
import "./Post.scss";

// hook imports
import { useEffect, useRef, useState, forwardRef } from "react";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

// rest api request imports
import { delete_post, edit_post } from "../../api/PostRequests";
import { get_all_comments_by_post_id } from "../../api/CommentRequests";
import { check_if_comments_or_replies_exist } from "../../api/CommentRequests";

// ui component imports
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Loading from "../../components/ui/Loading";
import ParsedText from "../../components/form/ParsedText";
import CloudinaryImage from "../../components/CloudinaryImage";
// import useMeasure from "react-use-measure";
import ResizablePanel, {
    ResizableComponent,
    useResizablePanel,
} from "../../components/ui/ResizablePanel";

// feature  component imports
import AddComment from "../comment/AddComment";
import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import EditPost from "./EditPost";
import Votes from "../vote/Votes";
import Comment from "../comment/Comment";

import { calculate_time_passed } from "../../helper/time";
import DOMPurify from "dompurify";
import { useQuery } from "@tanstack/react-query";

function Post({ post_details, remove_post_from_list }, ref) {
    const add_notification = useNotification();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();

    const [valid_title, set_valid_title] = useState(true);
    const [post_title, set_post_title] = useState(post_details.title);
    const [post_text, set_post_text] = useState(post_details.text);
    const [image_url, set_image_url] = useState(post_details.image);

    const [show_add_comment, set_show_add_comment] = useState(false);
    const [allow_comments_section_btn, set_allow_comments_section_btn] =
        useState(false);
    const [show_comments_section, set_show_comments_section] = useState(false);
    const [loading_comments, set_loading_comments] = useState(false);
    const [edit_btn_active, set_edit_btn_active] = useState(false);
    const [all_comments, set_all_comments] = useState([]);

    // const [posted_content_ref, { height }] = useMeasure();

    const add_comment_to_list = (new_comment_details) => {
        // when adding new_post_details, ensure that
        // it has all the post details including updatedAt and
        // author_details = { username, profile_pic }

        set_all_comments([...all_comments, new_comment_details]);
    };

    const remove_comment_from_list = (comment_to_remove_id) => {
        const new_comment_list = all_comments.filter((my_comment) => {
            return my_comment.id !== comment_to_remove_id;
        });

        set_all_comments(new_comment_list);

        add_notification("Succesfully removed Comment");
    };

    // to get all_comments of post_id
    useEffect(() => {
        initialse_allow_show_comment_section();
    }, []);

    const initialse_all_comments = async () => {
        if (allow_comments_section_btn === false) {
            return;
        }

        set_loading_comments(true);
        const response = await get_all_comments_by_post_id(post_details.id);

        // console.log("initialising all comments")
        if (response.error) {
            console.log(response);
            return;
        }

        set_loading_comments(false);

        set_all_comments(response.all_comments);
    };

    const initialse_allow_show_comment_section = async () => {
        const response = await check_if_comments_or_replies_exist(
            "comment",
            post_details.id
        );

        if (response.error) {
            console.log(response);
            return;
        }

        set_allow_comments_section_btn(response.is_any);
    };

    const handle_edit_post_save = async () => {
        // only handling post if post title is not empty
        if (post_title.trim().length === 0) {
            set_valid_title(false);
            return;
        }

        // editing post in db
        const response = await edit_post(
            post_details.id,
            post_title,
            post_text,
            image_url
        );

        if (response.error) {
            console.log(response);
            return;
        }

        set_edit_btn_active(false);
        add_notification("Succesfully Edited Post");
    };

    const handle_edit_post_cancel = () => {
        set_post_title(post_details.title);
        set_post_text(post_details.text);
        set_image_url(post_details.image);
        set_edit_btn_active(false);
    };

    const handle_delete_post = async () => {
        // removing post in db
        const response = await delete_post(post_details.id);

        if (response.error) {
            console.log(response);
            return;
        }

        // removing post on client side when deleted from db
        remove_post_from_list(post_details.id);

        add_notification("Succesfully Deleted Post");
    };

    const post_content = (
        <div className="PostContent">
            <div className="post_user_and_awards">
                <div className="post_user">
                    <ProfilePicture
                        profile_picture_url={
                            post_details.author_details.profile_pic
                        }
                        username={post_details.author_details.username}
                    />

                    <div className="posted_by_user">
                        <b>{post_details.author_details.username} • </b>
                        {post_details.edited && "(edited) • "}
                        {calculate_time_passed(post_details.updatedAt)} ago
                    </div>
                </div>

                <div className="btns">
                    {post_details.author_details.username ===
                    current_user.username ? (
                        <>
                            {edit_btn_active ? (
                                <>
                                    <Button
                                        handle_btn_click={handle_edit_post_save}
                                        type="save"
                                        span_text="Save"
                                        img_name="confirm"
                                        margin_right={true}
                                    />
                                    <Button
                                        handle_btn_click={
                                            handle_edit_post_cancel
                                        }
                                        type="cancel"
                                        span_text="Cancel"
                                        img_name="cancel"
                                        margin_right={true}
                                    />
                                </>
                            ) : (
                                <Button
                                    handle_btn_click={() =>
                                        set_edit_btn_active(true)
                                    }
                                    type="edit"
                                    span_text="Edit"
                                    img_name="edit"
                                    margin_right={true}
                                />
                            )}

                            <Button
                                // handle_btn_click={}
                                type="delete"
                                span_text="Delete"
                                img_name="delete"
                                margin_right={true}
                            />
                        </>
                    ) : (
                        <Button
                            // might need to include on click
                            // handle_btn_click={() => set_delete_btn_active(true)}
                            type="award"
                            span_text="Award"
                            img_name="award"
                            margin_right={true}
                        />
                    )}
                </div>
            </div>

            <div className="main_content_and_votes">
                <div className="show_more_btn">
                    {edit_btn_active === false && (
                        <resizable_panel_states.ShowMoreBtn />
                    )}
                </div>

                <div className="text_content">
                    {edit_btn_active ? (
                        <EditPost
                            image_url={image_url}
                            set_image_url={set_image_url}
                            post_title={post_title}
                            set_post_title={set_post_title}
                            post_text={post_text}
                            set_post_text={set_post_text}
                            valid_title={valid_title}
                        />
                    ) : (
                        <ResizablePanel
                            min_height={500}
                            {...resizable_panel_states}
                        >
                            <div className="display_text">
                                <h1
                                    className="Title"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(post_title),
                                    }}
                                />
                                {image_url !== null && (
                                    <div className="image_display">
                                        <CloudinaryImage
                                            image_url={image_url}
                                            alt="post_image"
                                        />
                                    </div>
                                )}
                                <ParsedText>{post_text}</ParsedText>
                            </div>
                        </ResizablePanel>
                    )}
                </div>
            </div>

            <div className="post_btns">
                <Votes vote_type="post" post_id={post_details.id} />

                {post_details.is_inappropriate === true && (
                    <div className="is_inappropriate_error">
                        This post has been deemed inappropriate by Breaddit
                        Moderators
                    </div>
                )}

                <div className="both_comments_btns">
                    {current_user.role !== "admin" && (
                        <Button
                            handle_btn_click={() =>
                                set_show_add_comment(!show_add_comment)
                            }
                            type="add_comment"
                            span_text={
                                show_add_comment
                                    ? "Cancel Comment"
                                    : "Add Comment"
                            }
                            span_class_name={
                                show_add_comment
                                    ? "cancel_comment_span"
                                    : "add_comment_span"
                            }
                            img_name="add_comment"
                            margin_right={true}
                            active={show_add_comment}
                        />
                    )}

                    {allow_comments_section_btn === true && (
                        <Button
                            handle_btn_click={() => {
                                set_show_comments_section(
                                    !show_comments_section
                                );
                                // when show_comments_section is true, we initialise all comments
                                // however when we first click show_comments_section
                                // will still be false even after setting state
                                if (show_comments_section === false) {
                                    initialse_all_comments();
                                }
                            }}
                            type="comments_section"
                            span_text={
                                show_comments_section
                                    ? "Hide Comments"
                                    : "Show Comments"
                            }
                            img_name="comments"
                            margin_right={true}
                            active={show_comments_section}
                        />
                    )}
                </div>
            </div>

            <div className="expanded_add_comment">
                <ResizableComponent>
                    {show_add_comment ? (
                        <AddComment
                            execute_after_add_comment={() => {
                                set_show_add_comment(false);
                                set_show_comments_section(true);

                                if (all_comments.length === 0) {
                                    set_allow_comments_section_btn(true);
                                }
                            }}
                            placeholder="Add Comment"
                            btn_text="Comment"
                            comment_type="comment"
                            post_id={post_details.id}
                            add_comment_or_reply_to_list={add_comment_to_list}
                        />
                    ) : null}
                </ResizableComponent>
            </div>

            <div className="expanded_comments_section">
                <ResizableComponent>
                    {show_comments_section ? (
                        <>
                            {loading_comments ? (
                                <Loading />
                            ) : (
                                <div className="Comment_Section">
                                    {all_comments.map((comment) => {
                                        return (
                                            <Comment
                                                key={comment.id}
                                                comment={comment}
                                                remove_comment_or_reply_from_list={
                                                    remove_comment_from_list
                                                }
                                                post_id={post_details.id}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : null}
                </ResizableComponent>
            </div>
        </div>
    );

    return ref ? (
        <div ref={ref} className="ref">
            {post_content}
        </div>
    ) : (
        <div>{post_content}</div>
    );
}

export default forwardRef(Post);
