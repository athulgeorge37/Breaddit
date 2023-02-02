// styles
import "./DynamicPostCard.scss";

// hooks
import { useState, useEffect } from "react";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ResizablePanel, {
    useResizablePanel,
} from "../../components/ui/ResizablePanel";
import { useModal } from "../../components/ui/Modal";

// api
import { delete_post_request } from "../../api/PostRequests";
import { get_post_by_id } from "../../api/PostRequests";

// ui
import Loading from "../../components/ui/Loading";
import ToolTip from "../../components/ui/ToolTip";

// components
import ProfilePicture from "../../features/profile/profile_picture/ProfilePicture";
import EditPost from "./EditPost";
import Votes from "../../features/vote/Votes";
import PostContent from "../../features/post/PostContent";
import Modal from "../../components/ui/Modal";

// helper
import { calculate_time_passed } from "../../helper/time";

function DynamicPostCard({ post_id, location }) {
    const navigate = useNavigate();
    const add_notification = useNotification();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();
    const queryClient = useQueryClient();

    const { open_modal, close_modal, show_modal } = useModal();

    const [post_details, set_post_details] = useState(null);
    const [edit_btn_active, set_edit_btn_active] = useState(false);

    const { loading: post_details_loading } = useQuery(
        ["post_content", { post_id }],
        () => {
            return get_post_by_id(post_id);
        },
        {
            onSuccess: (data) => {
                set_post_details(data.post_details);
            },
        }
    );

    const { mutate: delete_post } = useMutation(
        () => delete_post_request(post_id),
        {
            onSuccess: (data) => {
                // removing post on client side when deleted from db

                if (data.error) {
                    // console.log(data);
                    add_notification("Cannot delete post", "ERROR");
                    return;
                }

                queryClient.invalidateQueries(["posts"]);
                navigate("/");
                add_notification(data.msg, data.deleted ? "SUCCESS" : "ERROR");
            },
        }
    );

    useEffect(() => {
        // opening modal if the last page that routed here required it
        if (location.state?.open_modal === true) {
            open_modal();
        } else if (location.state?.edit_post === true) {
            set_edit_btn_active(true);
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
            <Modal show_modal={show_modal} close_modal={close_modal}>
                <div className="delete_post_modal">
                    <h2>Delete Post?</h2>
                    <p>
                        Are you sure you want to delete this Post? This action
                        is not reversible.
                    </p>
                    <div className="btns">
                        <button className="cancel_btn" onClick={close_modal}>
                            Cancel
                        </button>
                        <button
                            className="delete_btn"
                            onClick={() => {
                                delete_post();
                                // modal_ref.current.close_modal();
                                close_modal();
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
                                `/user/${post_details.author_details.username}/profile`
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
                            {calculate_time_passed(post_details.edited_time)}{" "}
                            ago
                        </div>
                    </div>
                </div>

                <div className="btns">
                    {post_details.author_details.username ===
                    current_user.username ? (
                        <>
                            <ToolTip
                                text={
                                    edit_btn_active
                                        ? "Cancel Edit"
                                        : "Edit Post"
                                }
                            >
                                <button
                                    className="edit_btn"
                                    type="button"
                                    onClick={() =>
                                        set_edit_btn_active(!edit_btn_active)
                                    }
                                >
                                    {edit_btn_active ? (
                                        <svg
                                            fill="none"
                                            className="cancel_icon"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="edit_icon"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </ToolTip>

                            <ToolTip text="Delete Post">
                                <button
                                    type="button"
                                    className="delete_btn"
                                    onClick={open_modal}
                                >
                                    <svg
                                        className="delete_icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
                            </ToolTip>
                        </>
                    ) : null}
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
