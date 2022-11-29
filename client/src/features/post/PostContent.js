// style import
import "./Post.scss";

// hook imports
import { useEffect, useRef, useState, forwardRef } from "react";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

// rest api request imports
import { delete_post, edit_post } from "../../rest_api_requests/PostRequests";
import { get_all_comments_by_post_id } from "../../rest_api_requests/CommentRequests";
import { check_if_comments_or_replies_exist } from "../../rest_api_requests/CommentRequests";

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
import { useNavigate } from "react-router-dom";

function Post({ post_details }) {
    const navigate = useNavigate();
    const add_notification = useNotification();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();

    // required for read_more/less button
    // const posted_content_ref = useRef();
    const modal_ref = useRef();

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

    const navigate_to_post_page = () => {
        navigate(`/post/${post_details.id}`);
    };

    // to get all_comments of post_id
    useEffect(() => {
        initialse_allow_show_comment_section();
    }, []);

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
                            <Button
                                handle_btn_click={navigate_to_post_page}
                                type="edit"
                                span_text="Edit"
                                img_name="edit"
                                margin_right={true}
                            />

                            <Button
                                handle_btn_click={navigate_to_post_page}
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
                    <resizable_panel_states.ShowMoreBtn />
                </div>

                <div className="text_content" onClick={navigate_to_post_page}>
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
                    <Button
                        // handle_btn_click={() =>
                        //     set_show_add_comment(!show_add_comment)
                        // }
                        handle_btn_click={navigate_to_post_page}
                        type="add_comment"
                        span_text={
                            show_add_comment ? "Cancel Comment" : "Add Comment"
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

                    {allow_comments_section_btn === true && (
                        <Button
                            // handle_btn_click={() => {
                            //     set_show_comments_section(
                            //         !show_comments_section
                            //     );
                            //     // when show_comments_section is true, we initialise all comments
                            //     // however when we first click show_comments_section
                            //     // will still be false even after setting state
                            //     if (show_comments_section === false) {
                            //         initialse_all_comments();
                            //     }
                            // }}
                            handle_btn_click={navigate_to_post_page}
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

            {/* <div className="expanded_add_comment">
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
            </div> */}

            {/* <div className="expanded_comments_section">
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
            </div> */}
        </div>
    );

    // return ref ? (
    //     <div ref={ref} className="ref">
    //         {post_content}
    //     </div>
    // ) : (
    //     <div>{post_content}</div>
    // );

    return <div>{post_content}</div>;
}

export default Post;
