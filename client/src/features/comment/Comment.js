import "./Comment.scss";
import { useState, useRef } from "react";

import { calculate_time_passed } from "../../helper/time";

import DOMPurify from "dompurify";

import AddComment from "./AddComment";
import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import Votes from "../vote/Votes";
import Modal from "../../components/ui/Modal";

import AdjustableButton from "../../components/ui/AdjustableButton";
import ResizablePanel, {
    useResizablePanel,
} from "../../components/ui/ResizablePanel";
import {
    check_if_comments_or_replies_exist,
    delete_comment_or_reply,
} from "../../rest_api_requests/CommentRequests";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useNavigate } from "react-router-dom";
import ReplySectionInfiniteScroll from "./ReplySectionInfiniteScroll";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

function Comment({ comment, post_id, parent_comment_id = null }) {
    // the comment component renders both surface level comments and
    // replies of those comments, therfore this component actually serves
    // 2 purposes and behaves slightly differently depending on if
    // it is a comment or a reply

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();
    const add_notification = useNotification();

    const modal_ref = useRef();
    // still need to implement infinite scroll for comments and replies

    const [show_replies_section, set_show_replies_section] = useState(false);
    const [show_add_reply, set_show_add_reply] = useState(false);
    const [comment_edit_mode, set_comment_edit_mode] = useState(false);
    const [allow_replies_section_btn, set_allow_replies_section_btn] =
        useState(false);

    useQuery(
        ["comment_has_replies", comment.id],
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
                            "replies_of_comment_id_and_post_id",
                            parent_comment_id,
                            post_id,
                        ]);
                    }
                } else {
                    queryClient.invalidateQueries([
                        "comments_of_post_id",
                        post_id,
                    ]);
                }
            },
        }
    );

    const handle_delete_comment = () => {
        // const response = await delete_comment(comment.id);
        const type = comment.is_reply ? "reply" : "comment";

        delete_comment.mutate(type);

        add_notification(`Succesfully deleted ${type}`);
    };

    return (
        <div
            className={
                "comment_or_reply " + (comment.is_reply ? "Reply" : "Comment")
            }
        >
            <Modal ref={modal_ref} btn_color="red" width="300">
                <h2>Delete {comment.is_reply ? "Reply" : "Comment"}?</h2>
                <p>
                    Are you sure you want to delete your{" "}
                    {comment.is_reply ? "Reply" : "Comment"}? This action is not
                    reversible.
                </p>

                <button
                    className="delete_post_btn"
                    onClick={() => {
                        handle_delete_comment();
                        modal_ref.current.close_modal();
                    }}
                >
                    Delete {comment.is_reply ? "Reply" : "Comment"}
                </button>
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
                            <b> • </b>
                            {comment.edited && "(edited) • "}
                            {calculate_time_passed(comment.updatedAt)} ago
                        </div>
                        {comment.author_details.username ===
                            current_user.username && (
                            <div className="edit_and_delete_btns">
                                <AdjustableButton
                                    boolean_check={comment_edit_mode}
                                    execute_onclick={() =>
                                        set_comment_edit_mode(
                                            !comment_edit_mode
                                        )
                                    }
                                    original_class_name="edit_cancel_btn"
                                    active_name="Cancel"
                                    inactive_name="Edit"
                                    btn_type_txt={true}
                                />

                                <button
                                    className="delete_comment_btn"
                                    onClick={() =>
                                        modal_ref.current.open_modal()
                                    }
                                >
                                    Delete
                                </button>
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
                        />

                        {comment_edit_mode === false && (
                            <div className="show_more_btn">
                                <resizable_panel_states.ShowMoreBtn />
                            </div>
                        )}
                    </div>

                    <div className="reply_btns">
                        {comment.is_reply === false && (
                            <div className="reply_btns">
                                {current_user.role !== "admin" && (
                                    <AdjustableButton
                                        boolean_check={show_add_reply}
                                        execute_onclick={() =>
                                            set_show_add_reply(!show_add_reply)
                                        }
                                        original_class_name="reply_btn"
                                        active_name="Cancel"
                                        inactive_name="Reply"
                                        btn_type_txt={true}
                                    />
                                )}

                                {allow_replies_section_btn === true && (
                                    <AdjustableButton
                                        // boolean_check={show_replies}
                                        boolean_check={show_replies_section}
                                        execute_onclick={() => {
                                            // set_show_replies(!show_replies)
                                            set_show_replies_section(
                                                !show_replies_section
                                            );
                                        }}
                                        original_class_name="view_replies_btn"
                                        active_name="Hide Replies"
                                        inactive_name="Show Replies"
                                        btn_type_txt={true}
                                    />
                                )}
                            </div>
                        )}
                    </div>
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
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Comment;
