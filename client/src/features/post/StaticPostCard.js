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
        ["post_has_comments", post_details.id],
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
                            <Button
                                onClick={navigate_to_post_page}
                                type="edit"
                                span_text="Edit"
                                img_name="edit"
                                margin_right={true}
                            />

                            <Button
                                onClick={() => {
                                    navigate(`/post/${post_details.id}`, {
                                        state: {
                                            open_modal: true,
                                        },
                                    });
                                }}
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
                    <Button
                        onClick={navigate_to_post_page}
                        type="add_comment"
                        span_text="Add Comment"
                        span_class_name="add_comment_span"
                        img_name="add_comment"
                        margin_right={true}
                        active={false}
                    />

                    {allow_comments_section_btn === true && (
                        <Button
                            onClick={navigate_to_post_page}
                            type="comments_section"
                            span_text="Show Comments"
                            img_name="comments"
                            margin_right={true}
                            active={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default StaticPostCard;
