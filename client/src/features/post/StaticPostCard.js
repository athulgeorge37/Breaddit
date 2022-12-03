// style import
import "./StaticPostCard.scss";

// hook imports
import { useState } from "react";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

// rest api request imports
import { check_if_comments_or_replies_exist } from "../../rest_api_requests/CommentRequests";

// ui component imports
import Button from "../../components/ui/Button";
// import useMeasure from "react-use-measure";
import ResizablePanel, {
    useResizablePanel,
} from "../../components/ui/ResizablePanel";

// feature  component imports
import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import Votes from "../vote/Votes";
import { calculate_time_passed } from "../../helper/time";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PostContent from "./PostContent";

function StaticPostCard({ post_details }) {
    const navigate = useNavigate();
    const { current_user } = useCurrentUser();
    const resizable_panel_states = useResizablePanel();

    const [allow_comments_section_btn, set_allow_comments_section_btn] =
        useState(false);

    // const [posted_content_ref, { height }] = useMeasure();

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
                        <PostContent
                            post_image={post_details.image}
                            post_text={post_details.text}
                            post_title={post_details.title}
                        />
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

                <div className="both_comments_btns">
                    <Button
                        handle_btn_click={navigate_to_post_page}
                        type="add_comment"
                        span_text="Add Comment"
                        span_class_name="add_comment_span"
                        img_name="add_comment"
                        margin_right={true}
                        active={false}
                    />

                    {allow_comments_section_btn === true && (
                        <Button
                            handle_btn_click={navigate_to_post_page}
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
