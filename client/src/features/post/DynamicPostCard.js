import "./DynamicPostCard.scss";

// hook imports
import { useRef, useState } from "react";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

// rest api request imports
import { delete_post, edit_post } from "../../rest_api_requests/PostRequests";

// ui component imports
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Loading from "../../components/ui/Loading";

import ResizablePanel, {
    useResizablePanel,
} from "../../components/ui/ResizablePanel";

// feature  component imports
import ProfilePicture from "../../features/profile/profile_picture/ProfilePicture";
import EditPost from "../../features/post/EditPost";
import Votes from "../../features/vote/Votes";

import { calculate_time_passed } from "../../helper/time";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { get_post_by_id } from "../../rest_api_requests/PostRequests";
import PostContent from "../../features/post/PostContent";

function DynamicPostCard({ post_id }) {
    const navigate = useNavigate();
    const add_notification = useNotification();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();
    const queryClient = useQueryClient();

    const modal_ref = useRef();
    const [post_details, set_post_details] = useState(null);
    const [edit_btn_active, set_edit_btn_active] = useState(false);

    const [valid_title, set_valid_title] = useState(true);
    const [post_title, set_post_title] = useState("");
    const [post_text, set_post_text] = useState("");
    const [image_url, set_image_url] = useState(null);

    const { loading: post_details_loading } = useQuery(
        ["post_content", post_id],
        () => {
            return get_post_by_id(post_id);
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

    const handle_edit_post_save = async (post_title, post_text) => {
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
        const response = await delete_post(post_id);

        if (response.error) {
            console.log(response);
            return;
        }

        // removing post on client side when deleted from db
        // remove_post_from_list(post_details.id);
        queryClient.invalidateQueries(["posts"]);

        add_notification("Succesfully Deleted Post");
    };

    if (post_details_loading === true || post_details === null) {
        return <Loading />;
    }

    return (
        <div className="DynamicPostCard">
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
                    <ResizablePanel
                        min_height={500}
                        {...resizable_panel_states}
                    >
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
                            <PostContent
                                post_title={post_title}
                                post_image={image_url}
                                post_text={post_text}
                            />
                        )}
                    </ResizablePanel>
                </div>
            </div>

            <div className="post_btns">
                <Votes vote_type="post" vote_id={post_details.id} />

                {post_details.is_inappropriate === true && (
                    <div className="is_inappropriate_error">
                        This post has been deemed inappropriate by Breaddit
                        Moderators
                    </div>
                )}
            </div>
        </div>
    );
}

export default DynamicPostCard;
