// styles
import "./StaticPostCard.scss";

// hooks
import { useState } from "react";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useResizablePanel } from "../../components/ui/ResizablePanel";

// api
import { check_if_comments_or_replies_exist } from "../../api/CommentRequests";

// ui
import Button from "../../components/ui/Button";
import ResizablePanel from "../../components/ui/ResizablePanel";

// components
import PostContent from "./PostContent";
import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import Votes from "../vote/Votes";

// helper
import { calculate_time_passed } from "../../helper/time";
import ToolTip from "../../components/ui/ToolTip";

function StaticPostCard({ post_details }) {
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();

    const [allow_comments_section_btn, set_allow_comments_section_btn] =
        useState(false);

    const navigate_to_post_page = () => {
        navigate(`/post/${post_details.id}`);
    };

    useQuery(
        [
            "post_has_comments",
            {
                post_id: post_details.id,
            },
        ],
        () => {
            return check_if_comments_or_replies_exist(
                "comment",
                post_details.id
            );
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

    return (
        <div className="StaticPostCard">
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
                            {calculate_time_passed(post_details.edited_time)}{" "}
                            ago
                        </div>
                    </div>
                </div>

                <div className="btns">
                    {post_details.author_details.username ===
                    current_user.username ? (
                        <>
                            <ToolTip text="Edit Post">
                                <button
                                    className="edit_btn"
                                    type="button"
                                    onClick={() => {
                                        navigate(`/post/${post_details.id}`, {
                                            state: {
                                                edit_post: true,
                                            },
                                        });
                                    }}
                                >
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
                                </button>
                            </ToolTip>

                            <button
                                type="button"
                                className="delete_btn"
                                onClick={() => {
                                    navigate(`/post/${post_details.id}`, {
                                        state: {
                                            open_modal: true,
                                        },
                                    });
                                }}
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
                    <resizable_panel_states.ShowMoreBtn />
                </div>

                <div className="text_content" onClick={navigate_to_post_page}>
                    <ResizablePanel
                        min_height={500}
                        {...resizable_panel_states}
                    >
                        <PostContent post_details={post_details} />
                    </ResizablePanel>
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

                <div className="both_comments_btns">
                    {/* <Button
                        onClick={navigate_to_post_page}
                        type="add_comment"
                        span_text="Add Comment"
                        span_class_name="add_comment_span"
                        img_name="add_comment"
                        margin_right={true}
                        active={false}
                    /> */}
                    <button
                        className="add_comment_btn"
                        type="button"
                        onClick={navigate_to_post_page}
                    >
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
                    </button>

                    {allow_comments_section_btn === true && (
                        <button
                            className="comment_btn"
                            type="button"
                            onClick={navigate_to_post_page}
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default StaticPostCard;
