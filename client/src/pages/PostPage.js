// style import
import "./PostPage.scss";

// hook imports
import { useRef, useState } from "react";
import { useNotification } from "../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

// rest api request imports
import { delete_post, edit_post } from "../rest_api_requests/PostRequests";
import { get_all_comments_by_post_id } from "../rest_api_requests/CommentRequests";
import { check_if_comments_or_replies_exist } from "../rest_api_requests/CommentRequests";

// ui component imports
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Loading from "../components/ui/Loading";
import ParsedText from "../components/form/ParsedText";
import CloudinaryImage from "../components/CloudinaryImage";

import ResizablePanel, {
    ResizableComponent,
    useResizablePanel,
} from "../components/ui/ResizablePanel";

// feature  component imports
import AddComment from "../features/comment/AddComment";
import ProfilePicture from "../features/profile/profile_picture/ProfilePicture";
import EditPost from "../features/post/EditPost";
import Votes from "../features/vote/Votes";
import Comment from "../features/comment/Comment";

import { calculate_time_passed } from "../helper/time";
import DOMPurify from "dompurify";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { get_post_by_id } from "../rest_api_requests/PostRequests";
import CommentSectionInfiniteScroll from "../features/comment/CommentSectionInfiniteScroll";

function PostPage() {
    const { post_id_route } = useParams();
    const navigate = useNavigate();

    // use the params or the post_details to get the actual post details
    // render out the post and the comments horizontally

    const [post_details, set_post_details] = useState(null);

    const add_notification = useNotification();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();

    // required for read_more/less button
    // const posted_content_ref = useRef();
    const modal_ref = useRef();

    const [valid_title, set_valid_title] = useState(true);
    const [post_title, set_post_title] = useState("");
    const [post_text, set_post_text] = useState("");
    const [image_url, set_image_url] = useState("");

    const [show_add_comment, set_show_add_comment] = useState(false);
    const [allow_comments_section_btn, set_allow_comments_section_btn] =
        useState(false);
    const [show_comments_section, set_show_comments_section] = useState(false);
    const [loading_comments, set_loading_comments] = useState(false);
    const [edit_btn_active, set_edit_btn_active] = useState(false);
    const [all_comments, set_all_comments] = useState([]);
    // const [posted_content_ref, { height }] = useMeasure();

    const { loading: post_details_loading } = useQuery(
        ["post_content", post_id_route],
        () => {
            return get_post_by_id(post_id_route);
        },
        {
            onSuccess: (data) => {
                const post_details_data = data.post_details;

                set_post_details(post_details_data);

                set_post_title(post_details_data.title);
                set_post_text(post_details_data.text);
                set_image_url(post_details_data.image);
            },
        }
    );

    useQuery(
        ["post_has_comments", post_id_route],
        () => {
            return check_if_comments_or_replies_exist("comment", post_id_route);
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    console.log({ error: data.error });
                    return;
                }
                set_allow_comments_section_btn(data.is_any);
            },
        }
    );

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
        const response = await delete_post(post_id_route);

        if (response.error) {
            console.log(response);
            return;
        }

        // removing post on client side when deleted from db
        // remove_post_from_list(post_details.id);

        add_notification("Succesfully Deleted Post");
    };

    if (post_details_loading === true || post_details === null) {
        return <Loading />;
    }

    const post_content = (
        <div className="PostContent">
            <Modal ref={modal_ref} btn_color="red" width="300">
                <h2>Delete Post?</h2>
                <p>
                    Are you sure you want to delete this Post? This action is
                    not reversible.
                </p>

                <button
                    className="delete_post_btn"
                    onClick={() => {
                        handle_delete_post();
                        modal_ref.current.close_modal();
                    }}
                >
                    Delete Post
                </button>
            </Modal>

            <div className="post_user_and_awards">
                <div className="post_user">
                    <ProfilePicture
                        profile_picture_url={
                            post_details.author_details.profile_pic
                        }
                        username={post_details.author_details.username}
                    />

                    <div
                        className="posted_by_user"
                        onClick={() =>
                            navigate(
                                `/profile/${post_details.author_details.username}`
                            )
                        }
                    >
                        <b className="username">
                            {post_details.author_details.username}
                        </b>
                        <b> • </b>
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
                                handle_btn_click={() =>
                                    modal_ref.current.open_modal()
                                }
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
            </div>
        </div>
    );

    return (
        <div className="PostPage">
            {post_content}

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

            <CommentSectionInfiniteScroll post_id={parseInt(post_id_route)} />
        </div>
    );
}

export default PostPage;
