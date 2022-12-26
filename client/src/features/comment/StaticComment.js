import "../../features/comment/Comment.scss";
import { useState, useEffect, useRef } from "react";

import { calculate_time_passed } from "../../helper/time";

// might need to npm uninstall from package.json
// import { v4 as uuid } from 'uuid';

import DOMPurify from "dompurify";
import ProfilePicture from "../profile/profile_picture/ProfilePicture";
import Votes from "../vote/Votes";

import AdjustableButton from "../../components/ui/AdjustableButton";

import {
    get_all_replies,
    check_if_comments_or_replies_exist,
} from "../../api/CommentRequests";

function StaticComment({ comment }) {
    // the comment component renders both surface level comments and
    // replies of those comments, therfore this component actually serves
    // 2 purposes and behaves slightly differently depending on if
    // it is a comment or a reply

    // still need to implement infinite scroll for comments and replies

    const [show_replies_section, set_show_replies_section] = useState(false);
    const [allow_replies_section_btn, set_allow_replies_section_btn] =
        useState(false);

    const [allow_read_more_btn, set_allow_read_more_btn] = useState(false);
    const [read_more_content, set_read_more_content] = useState(false);

    const [all_replies, set_all_replies] = useState([]);

    // required for read_more/less button
    const comment_content_ref = useRef();

    // for read more btn
    useEffect(() => {
        const comment_content_height = comment_content_ref.current.clientHeight;

        // only allowing component to render show more/less btn
        // if the content of the post takes up more than 100px

        //  if you want to change this value, u must also change in the css
        // where the classname is .show_less
        if (comment_content_height > 100) {
            set_allow_read_more_btn(true);
        }
    }, []);

    useEffect(() => {
        initialse_allow_show_replies_section();
    }, []);

    const initialse_allow_show_replies_section = async () => {
        // there is no need to check if there are replies
        // when the comment rendered already is a reply
        if (comment.is_reply === true) {
            // console.log("isreply is true, returning")
            return;
        }

        const response = await check_if_comments_or_replies_exist(
            "reply",
            comment.id
        );

        if (response.error) {
            console.log(response);
            return;
        }

        set_allow_replies_section_btn(response.is_any);
    };

    const initialise_all_replies = async () => {
        if (allow_replies_section_btn === false) {
            return;
        }

        const response = await get_all_replies(comment.id);

        // console.log("initialising all replies")
        if (response.error) {
            console.log(response);
            return;
        }

        // response.all_replies is slightly differnt structure to all_comments
        // actual comment content is in response.all_replies.reply_content
        set_all_replies(response.all_replies);
    };

    return (
        <div
            className={
                "comment_or_reply " + (comment.is_reply ? "Reply" : "Comment")
            }
        >
            <div className="profile_picture">
                <ProfilePicture
                    profile_picture_url={comment.author_details.profile_pic}
                    username={comment.author_details.username}
                />
            </div>

            <div className="comment_content_container">
                <div className="comment_content">
                    <div className="comment_author_and_edit_delete_btns">
                        <div className="comment_author">
                            <b>{comment.author_details.username} • </b>
                            {comment.edited && "(edited) • "}
                            {calculate_time_passed(comment.updatedAt)} ago
                        </div>
                    </div>
                    <div
                        className={
                            "comment_content_text " +
                            (allow_read_more_btn
                                ? read_more_content
                                    ? ""
                                    : "show_less"
                                : "")
                        }
                        ref={comment_content_ref}
                    >
                        <div
                            className="comment_text"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(comment.text),
                            }}
                        >
                            {/* actual comment text */}
                            {/* {comment.text} */}
                        </div>
                    </div>
                </div>

                <div className="comment_btns">
                    <div className="votes_and_read_more_btns">
                        <Votes
                            vote_type={comment.is_reply ? "reply" : "comment"}
                            comment_id={comment.id}
                            img_path={"../.."}
                        />

                        <div className="read_more_less_div">
                            {allow_read_more_btn && (
                                <AdjustableButton
                                    boolean_check={read_more_content}
                                    execute_onclick={() =>
                                        set_read_more_content(
                                            !read_more_content
                                        )
                                    }
                                    original_class_name="read_more_less_btn"
                                    active_name="Read Less"
                                    inactive_name="Read More"
                                    btn_type_txt={true}
                                />
                            )}
                        </div>
                    </div>

                    <div className="reply_btns">
                        {comment.is_reply === false && (
                            <div className="reply_btns">
                                {allow_replies_section_btn === true && (
                                    <AdjustableButton
                                        // boolean_check={show_replies}
                                        boolean_check={show_replies_section}
                                        execute_onclick={() => {
                                            // set_show_replies(!show_replies)
                                            set_show_replies_section(
                                                !show_replies_section
                                            );

                                            if (
                                                show_replies_section === false
                                            ) {
                                                initialise_all_replies();
                                            }
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
                    {comment.is_reply === false && (
                        <div className="comment_replies">
                            {show_replies_section && (
                                <>
                                    {all_replies.map((reply_object) => {
                                        const reply =
                                            reply_object.reply_content;
                                        return (
                                            <StaticComment
                                                comment={reply}
                                                key={reply.id}
                                            />
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StaticComment;
