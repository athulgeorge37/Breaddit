// styles
import "./Comment.scss";

// hooks
import { useState } from "react";
import { useModal } from "../../components/ui/Modal";
import { useResizablePanel } from "../../components/ui/ResizablePanel";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

// components
import AddComment from "./AddComment";
import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import Votes from "../vote/Votes";
import ResizablePanel from "../../components/ui/ResizablePanel";
import ReplySectionInfiniteScroll from "./ReplySectionInfiniteScroll";

// ui
import Modal from "../../components/ui/Modal";
import ToolTip from "../../components/ui/ToolTip";

// api
import {
    check_if_comments_or_replies_exist,
    delete_comment_or_reply,
} from "../../api/CommentRequests";

// helper
import { calculate_time_passed } from "../../helper/time";
import DOMPurify from "dompurify";

function Comment({ comment, post_id, sort_by, parent_comment_id = null }) {
    // the comment component renders both surface level comments and
    // replies of those comments, therfore this component actually serves
    // 2 purposes and behaves slightly differently depending on if
    // it is a comment or a reply

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();
    const add_notification = useNotification();
    const { open_modal, close_modal, show_modal } = useModal();

    const [show_replies_section, set_show_replies_section] = useState(false);
    const [show_add_reply, set_show_add_reply] = useState(false);
    const [comment_edit_mode, set_comment_edit_mode] = useState(false);
    const [allow_replies_section_btn, set_allow_replies_section_btn] =
        useState(false);

    useQuery(
        ["comment_has_replies", { comment_id: comment.id }],
        () => {
            return check_if_comments_or_replies_exist("reply", comment.id);
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    console.log({ error: data.error });
                    return;
                }
                set_allow_replies_section_btn(data.is_any);
            },
        }
    );

    const delete_comment = useMutation(
        (type) => delete_comment_or_reply(type, comment.id),
        {
            onSuccess: () => {
                if (comment.is_reply) {
                    if (parent_comment_id !== null) {
                        queryClient.invalidateQueries([
                            "replies_section",
                            { comment_id: parent_comment_id, post_id },
                        ]);
                    }
                } else {
                    queryClient.invalidateQueries([
                        "comments_section",
                        { post_id },
                    ]);
                }
                add_notification(
                    `Succesfully deleted ${
                        comment.is_reply ? "Reply" : "Comment"
                    }`
                );
            },
        }
    );

    return (
        <div
            className={
                "comment_or_reply " + (comment.is_reply ? "Reply" : "Comment")
            }
        >
            <Modal show_modal={show_modal} close_modal={close_modal}>
                <div className="delete_comment_modal">
                    <h2>Delete {comment.is_reply ? "Reply" : "Comment"}?</h2>
                    <p>
                        Are you sure you want to delete your{" "}
                        {comment.is_reply ? "Reply" : "Comment"}? This action is
                        not reversible.
                    </p>
                    <div className="btns">
                        <button className="cancel_btn" onClick={close_modal}>
                            Cancel
                        </button>
                        <button
                            className="delete_btn"
                            onClick={() => {
                                const type = comment.is_reply
                                    ? "reply"
                                    : "comment";

                                delete_comment.mutate(type);
                                close_modal();
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="profile_picture">
                <ProfilePicture
                    profile_picture_url={comment.author_details.profile_pic}
                    username={comment.author_details.username}
                />
            </div>

            <div className="comment_content_container">
                <div className="comment_content">
                    <div className="comment_author_and_edit_delete_btns">
                        <div
                            className="comment_author"
                            onClick={() =>
                                navigate(
                                    `/profile/${comment.author_details.username}`
                                )
                            }
                        >
                            <b className="username">
                                {comment.author_details.username}
                            </b>
                            <div className="updated_at_time">
                                <b>•</b>
                                {comment.edited && (
                                    <>
                                        <span>edited</span>
                                        <b>•</b>
                                    </>
                                )}
                                {calculate_time_passed(comment.edited_time)} ago
                            </div>
                        </div>

                        {comment.author_details.username ===
                            current_user.username && (
                            <div className="edit_and_delete_btns">
                                <ToolTip
                                    text={
                                        comment_edit_mode
                                            ? "Cancel Edit"
                                            : `Edit ${
                                                  comment.is_reply
                                                      ? "Reply"
                                                      : "Comment"
                                              }`
                                    }
                                    spacing={5}
                                >
                                    <button
                                        onClick={() =>
                                            set_comment_edit_mode(
                                                !comment_edit_mode
                                            )
                                        }
                                        className="edit_btn"
                                    >
                                        {comment_edit_mode ? (
                                            <svg
                                                className="cancel_icon"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
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

                                <ToolTip
                                    text={`Delete ${
                                        comment.is_reply ? "Reply" : "Comment"
                                    }`}
                                    spacing={5}
                                >
                                    <button
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
                            </div>
                        )}
                    </div>
                    {comment_edit_mode ? (
                        <>
                            {comment.author_details.username ===
                                current_user.username && (
                                <div className="edit_comment">
                                    <AddComment
                                        parent_comment_id={parent_comment_id}
                                        comment_id={comment.id}
                                        execute_after_add_comment={() => {
                                            set_comment_edit_mode(false);
                                        }}
                                        post_id={post_id}
                                        is_editing={true}
                                        initial_content={comment.text}
                                        show_profile_pic={false}
                                        comment_type={
                                            comment.is_reply
                                                ? "reply"
                                                : "comment"
                                        }
                                        btn_text="Save"
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <ResizablePanel
                            min_height={120}
                            {...resizable_panel_states}
                        >
                            <div className="comment_content_text">
                                <div
                                    className="comment_text"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            comment.text
                                        ),
                                    }}
                                />
                            </div>
                        </ResizablePanel>
                    )}
                </div>

                <div className="comment_btns">
                    <div className="votes_and_read_more_btns">
                        <Votes
                            vote_type={comment.is_reply ? "reply" : "comment"}
                            vote_id={comment.id}
                            up_votes={comment.up_votes}
                            down_votes={comment.down_votes}
                        />

                        {comment_edit_mode === false && (
                            <div className="show_more_btn">
                                <resizable_panel_states.ShowMoreBtn />
                            </div>
                        )}
                    </div>

                    <>
                        {comment.is_reply === false && (
                            <div className="reply_btns">
                                {allow_replies_section_btn === true && (
                                    <ToolTip text="Replies" spacing={5}>
                                        <button
                                            className="comment_btn"
                                            type="button"
                                            onClick={() => {
                                                set_show_replies_section(
                                                    !show_replies_section
                                                );
                                            }}
                                        >
                                            <svg
                                                className="comment_icon"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                                />
                                            </svg>
                                        </button>
                                    </ToolTip>
                                )}

                                {current_user.role !== "admin" && (
                                    <ToolTip
                                        text={
                                            show_add_reply
                                                ? "Cancel"
                                                : "Add Reply"
                                        }
                                        spacing={5}
                                    >
                                        <button
                                            className="add_comment_btn"
                                            onClick={() => {
                                                set_show_add_reply(
                                                    !show_add_reply
                                                );
                                            }}
                                        >
                                            {show_add_reply ? (
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
                                                    className="add_comment_icon"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </ToolTip>
                                )}
                            </div>
                        )}
                    </>
                </div>

                <div className="add_comments_and_show_replies">
                    <div className="add_comments">
                        {show_add_reply && (
                            <AddComment
                                execute_after_add_comment={() => {
                                    set_show_add_reply(false);
                                    set_show_replies_section(true);

                                    if (allow_replies_section_btn === false) {
                                        set_allow_replies_section_btn(true);
                                    }
                                }}
                                placeholder="Add Reply"
                                btn_text="Reply"
                                comment_type="reply"
                                post_id={post_id}
                                parent_comment_id={comment.id}
                            />
                        )}
                    </div>

                    {comment.is_reply === false && show_replies_section && (
                        <ReplySectionInfiniteScroll
                            comment_id={comment.id}
                            post_id={post_id}
                            sort_by={sort_by}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Comment;
