// styles
import "./DynamicPostCard.scss";

// hooks
import { useRef, useState, useEffect } from "react";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ResizablePanel, {
    useResizablePanel,
} from "../../components/ui/ResizablePanel";

// api
import { delete_post } from "../../api/PostRequests";
import { get_post_by_id } from "../../api/PostRequests";

// ui
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Loading from "../../components/ui/Loading";

// components
import ProfilePicture from "../../features/profile/profile_picture/ProfilePicture";
import EditPost from "./EditPost";
import Votes from "../../features/vote/Votes";
import PostContent from "../../features/post/PostContent";

// helper
import { calculate_time_passed } from "../../helper/time";

function DynamicPostCard({ post_id, location }) {
    const navigate = useNavigate();
    const add_notification = useNotification();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();
    const queryClient = useQueryClient();

    const modal_ref = useRef();
    const [post_details, set_post_details] = useState(null);
    const [edit_btn_active, set_edit_btn_active] = useState(false);

    const { loading: post_details_loading } = useQuery(
        ["post_content", post_id],
        () => {
            return get_post_by_id(post_id);
        },
        {
            onSuccess: (data) => {
                const post_details_data = data.post_details;

                set_post_details(post_details_data);
            },
        }
    );

    const post_deletion = useMutation(() => delete_post(post_id), {
        onSuccess: (data) => {
            // removing post on client side when deleted from db

            if (data.error) {
                console.log(data);
                return;
            }
            queryClient.invalidateQueries(["posts"]);
            navigate("/posts");
            add_notification("Succesfully Deleted Post");
        },
    });

    useEffect(() => {
        if (location.state?.open_modal === true) {
            // gotta timeout cus modal_ref isnt rendered yet to acces the method
            setTimeout(() => modal_ref.current.open_modal(), 200);
        }
    }, []);

    if (post_details_loading === true) {
        return <Loading />;
    }

    if (post_details === null) {
        return <div>This post does not exist</div>;
    }

    return (
        <div className="DynamicPostCard">
            <Modal ref={modal_ref} btn_color="red" width="300">
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <h2>Delete Post?</h2>
                    <p>
                        Are you sure you want to delete this Post? This action
                        is not reversible.
                    </p>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "10px",
                            marginTop: "10px",
                        }}
                    >
                        <button
                            onClick={() => {
                                modal_ref.current.close_modal();
                            }}
                            style={{
                                backgroundColor: "#21262d",
                                border: "none",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                post_deletion.mutate();
                                modal_ref.current.close_modal();
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
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
                        <div className="updated_at_time">
                            <b>•</b>
                            {post_details.edited && (
                                <>
                                    <span>edited</span>
                                    <b>•</b>
                                </>
                            )}
                            {calculate_time_passed(post_details.updatedAt)} ago
                        </div>
                    </div>
                </div>

                <div className="btns">
                    {post_details.author_details.username ===
                    current_user.username ? (
                        <>
                            {edit_btn_active ? (
                                <Button
                                    onClick={() => set_edit_btn_active(false)}
                                    type="cancel"
                                    span_text="Cancel"
                                    img_name="cancel"
                                    margin_right={true}
                                />
                            ) : (
                                <Button
                                    onClick={() => set_edit_btn_active(true)}
                                    type="edit"
                                    span_text="Edit"
                                    img_name="edit"
                                    margin_right={true}
                                />
                            )}

                            <Button
                                onClick={() => modal_ref.current.open_modal()}
                                type="delete"
                                span_text="Delete"
                                img_name="delete"
                                margin_right={true}
                            />
                        </>
                    ) : (
                        <Button
                            // might need to include on click
                            // onClick={() => set_delete_btn_active(true)}
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
                            post_details={post_details}
                            set_edit_btn_active={set_edit_btn_active}
                        />
                    ) : (
                        <ResizablePanel
                            min_height={500}
                            {...resizable_panel_states}
                        >
                            <PostContent post_details={post_details} />
                        </ResizablePanel>
                    )}
                </div>
            </div>

            <div className="post_btns">
                <Votes
                    vote_type="post"
                    vote_id={post_details.id}
                    up_votes={post_details.up_votes}
                    down_votes={post_details.down_votes}
                />

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
