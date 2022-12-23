import "./Comment.scss";
import { useState } from "react";

import { calculate_time_passed } from "../../helper/time";

import DOMPurify from "dompurify";

import AddComment from "./AddComment";
import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import Votes from "../vote/Votes";
import { useModal } from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

import ResizablePanel, {
    useResizablePanel,
} from "../../components/ui/ResizablePanel";
import {
    check_if_comments_or_replies_exist,
    delete_comment_or_reply,
} from "../../api/CommentRequests";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useNavigate } from "react-router-dom";
import ReplySectionInfiniteScroll from "./ReplySectionInfiniteScroll";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import Modal from "../../components/ui/Modal";

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
                                {calculate_time_passed(comment.updatedAt)} ago
                            </div>
                        </div>
                        {comment.author_details.username ===
                            current_user.username && (
                            <div className="edit_and_delete_btns">
                                {comment_edit_mode ? (
                                    <Button
                                        onClick={() =>
                                            set_comment_edit_mode(false)
                                        }
                                        type="cancel"
                                        img_name="cancel"
                                        size="small"
                                    />
                                ) : (
                                    <Button
                                        onClick={() =>
                                            set_comment_edit_mode(true)
                                        }
                                        type="edit"
                                        img_name="edit"
                                        size="small"
                                    />
                                )}

                                <Button
                                    onClick={open_modal}
                                    type="delete"
                                    img_name="delete"
                                    size="small"
                                />
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

                    <div className="reply_btns">
                        {comment.is_reply === false && (
                            <div className="reply_btns">
                                {current_user.role !== "admin" && (
                                    <Button
                                        onClick={() => {
                                            set_show_add_reply(!show_add_reply);
                                        }}
                                        type="add_comment"
                                        img_name="add_comment"
                                        active={show_add_reply}
                                        img_path="../.."
                                        size="small"
                                    />
                                )}

                                {allow_replies_section_btn === true && (
                                    <Button
                                        onClick={() => {
                                            set_show_replies_section(
                                                !show_replies_section
                                            );
                                        }}
                                        type="comments_section"
                                        img_name="comments"
                                        active={show_replies_section}
                                        img_path="../.."
                                        size="small"
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
                            sort_by={sort_by}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default Comment;
