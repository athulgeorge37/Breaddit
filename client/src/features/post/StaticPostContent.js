// style import
import "./StaticPostContent.scss";

// hook imports
import { useEffect, useRef, useState } from "react";

// rest api request imports
import { get_all_comments_by_post_id } from "../../rest_api_requests/CommentRequests";

// component imports
import ProfilePicture from "../../features/profile/profile_picture/ProfilePicture";
import AdjustableButton from "../../components/ui/AdjustableButton";
import Button from "../../components/ui/Button";
import ParsedText from "../../components/form/ParsedText";
import CloudinaryImage from "../../components/CloudinaryImage";
import StaticComment from "../comment/StaticComment";
import StaticVotes from "../vote/StaticVotes";

import { calculate_time_passed } from "../../helper/time";

import DOMPurify from "dompurify";

import { UPDATE_IS_INAPPROPRIATE_STATUS } from "../../graphql/PostQueries";
import { useMutation } from "@apollo/client";

function StaticPostContent({ post_details }) {
    // required for read_more/less button
    const posted_content_ref = useRef();

    const [show_comments_section, set_show_comments_section] = useState(false);

    const [allow_show_more_btn, set_allow_show_more_btn] = useState(false);
    const [show_more_content, set_show_more_content] = useState(false);

    const [all_comments, set_all_comments] = useState([]);

    const [is_inappropriate, set_is_inappropriate] = useState(
        post_details.is_inappropriate
    );
    const [update_is_inappropriate] = useMutation(
        UPDATE_IS_INAPPROPRIATE_STATUS
    );

    const handle_update_is_inappropriate = () => {
        // sending graphQL mutation to update ban status of this user
        update_is_inappropriate({
            variables: {
                post_id: post_details.id,
                new_is_inappropriate_status: !is_inappropriate,
            },
        });

        // updating ban status in the UI
        set_is_inappropriate(!is_inappropriate);
    };

    const initialse_all_comments = async () => {
        if (post_details.post_data.total_comments === 0) {
            return;
        }

        const response = await get_all_comments_by_post_id(post_details.id);

        // console.log("initialising all comments")
        if (response.error) {
            console.log(response);
            return;
        }

        set_all_comments(response.all_comments);
    };

    useEffect(() => {
        set_show_comments_section(false);
        set_allow_show_more_btn(false);
        set_show_more_content(false);
        set_is_inappropriate(post_details.is_inappropriate);
    }, [post_details]);

    // for show more btn
    useEffect(() => {
        // only allowing component to render show more/less btn
        // if the content of the post takes up more than 500px
        const post_content_height = posted_content_ref.current.clientHeight;

        // if you want to change this value, u must also change in the css
        // where the classname is .show_less in this component for it to work
        if (post_content_height > 500) {
            set_allow_show_more_btn(true);
        }
        // runs useEffect every rerender,
        // but only runs code when not in edit mode

        // console.log(post_text)
    });

    return (
        <div className="PostContent">
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

                <div className="awards">
                    <button
                        className={`${is_inappropriate ? "inappropriate" : ""}`}
                        onClick={handle_update_is_inappropriate}
                    >
                        {is_inappropriate ? "inappropriate" : "appropriate"}
                    </button>
                </div>
            </div>

            <div className="main_content_and_votes">
                {allow_show_more_btn && (
                    <div className="show_more_btn">
                        <AdjustableButton
                            boolean_check={show_more_content}
                            execute_onclick={() =>
                                set_show_more_content(!show_more_content)
                            }
                            original_class_name="show_more_less_btn"
                            active_name="Read Less"
                            inactive_name="Read More"
                            btn_type_txt={true}
                        />
                    </div>
                )}

                <div className="text_content">
                    <div
                        ref={posted_content_ref}
                        className={
                            "display_text " +
                            (allow_show_more_btn
                                ? show_more_content
                                    ? ""
                                    : "show_less"
                                : "")
                        }
                    >
                        <h1
                            className="Title"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(post_details.title),
                            }}
                        >
                            {/* {post_title} */}
                        </h1>
                        {post_details.image !== null && (
                            <div className="image_display">
                                <CloudinaryImage
                                    image_url={post_details.image}
                                />
                            </div>
                        )}
                        <ParsedText>{post_details.text}</ParsedText>
                    </div>
                </div>
            </div>

            <div className="post_btns">
                <StaticVotes
                    vote_type="post"
                    up_vote_count={post_details.post_data.up_votes}
                    down_vote_count={post_details.post_data.down_votes}
                />

                <div className="both_comments_btns">
                    {post_details.post_data.total_comments > 0 && (
                        <Button
                            handle_btn_click={() => {
                                set_show_comments_section(
                                    !show_comments_section
                                );
                                // when show_comments_section is true, we initialise all comments
                                // however when we first click show_comments_section
                                // will still be false even after setting state
                                if (show_comments_section === false) {
                                    initialse_all_comments();
                                }
                            }}
                            type="comments_section"
                            span_text={
                                show_comments_section
                                    ? "Hide Comments"
                                    : "Show Comments"
                            }
                            img_name="comments"
                            margin_right={true}
                            active={show_comments_section}
                            img_path="../.."
                        />
                    )}
                </div>
            </div>

            <div className="expanded_comments_section">
                {show_comments_section && (
                    <div className="Comment_Section">
                        {all_comments.map((comment) => {
                            return (
                                <StaticComment
                                    key={comment.id}
                                    comment={comment}
                                    post_id={post_details.id}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StaticPostContent;
