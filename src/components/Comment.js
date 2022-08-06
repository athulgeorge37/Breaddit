import React, { useState, useEffect } from 'react';
import './Comment.scss';

import { calculate_time_passed } from '../helper_functions/calculate_time_passed';

import { v4 as uuid } from 'uuid';

import AddComment from './AddComment';



function Comment(props) {

    // the comment component renders both surface level comments and
    // replies of those comments, therfore this component actually serves
    // 2 purposes and behaves slightly differently depending on if 
    // it is a comment or a reply

    const [comment_up_votes, update_comment_up_votes] = useState();
    const [comment_down_votes, update_comment_down_votes] = useState();

    const [show_reply_to_comment, set_show_reply_to_comment] = useState(false);
    const [show_replies, set_show_replies] = useState(false);

    const initialise_comment_votes = () => {
        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {

                    // if comment rendered is a reply, we must acces different part of
                    // localstorage to intialise the up and down votes
                    if (props.indented) {
                        for (const reply of post.post_comments[n].children_comments) {
                            if (reply.comment_id === props.comment.comment_id) {
                                update_comment_up_votes(reply.comment_up_votes)
                                update_comment_down_votes(reply.comment_down_votes)
                                break;
                            }
                        }
                        break;
                    } else {
                        // if comment rendered is a surface level comment, we
                        // update up and down votes like this
                        if (post.post_comments[n].comment_id === props.comment.comment_id) {
                            update_comment_up_votes(post.post_comments[n].comment_up_votes)
                            update_comment_down_votes(post.post_comments[n].comment_down_votes)
                            break;
                        }
                    }
                }
                break;
            }
        }
    }

    useEffect(() => {
        // executes on comment component load to initialise all votes for each comment
        initialise_comment_votes()
    }, [])

    const update_local_storage_comment_vote = (new_up_vote, new_down_vote) => {
        // finds the appropriate comment in localstorage, and
        // updates localstorage to contain each comments up and down votes

        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {

                    // must update different part of local storage if the comment rendered is a reply
                    // for up and down votes
                    if (props.indented) {
                        for (let r=0; r < post.post_comments[n].children_comments.length; r++) {
                            if (post.post_comments[n].children_comments[r].comment_id === props.comment.comment_id) {
                                post.post_comments[n].children_comments[r] = {
                                    ...post.post_comments[n].children_comments[r],
                                    comment_up_votes: new_up_vote,
                                    comment_down_votes: new_down_vote
                                }
                                break;
                            }
                        }
                        break;
                    } else {
                        // updating surface level commments for up and down votes
                        if (post.post_comments[n].comment_id === props.comment.comment_id) {
                            post.post_comments[n] = {
                                ...post.post_comments[n],
                                comment_up_votes: new_up_vote,
                                comment_down_votes: new_down_vote
                            }
                            break;
                        }
                    }
                }
                break;
            }
        }

        localStorage.setItem("Available_Posts", JSON.stringify(all_posts))
    }


    const handle_comment_up_vote = () => {
        // updates the UI of up votes
        update_comment_up_votes(comment_up_votes + 1) 

        // updates the local storage of up votes
        update_local_storage_comment_vote(comment_up_votes + 1, comment_down_votes) 
    }

    const handle_comment_down_vote = () => {
        // updates the UI of down votes
        update_comment_down_votes(comment_down_votes - 1) 

        // updates the local storage of down votes
        update_local_storage_comment_vote(comment_up_votes, comment_down_votes - 1) 
    }


    const handle_add_comment_indented = (comment_content) => {

        // this is how we add replies to localstorage
        // with the relevant starter options for a reply
        // very similar to a comment, except no children comments object

        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {
                    if (post.post_comments[n].comment_id === props.comment.comment_id) {
                        post.post_comments[n].children_comments = [
                            ...post.post_comments[n].children_comments,
                            {
                                comment_id: uuid(),
                                parent_id: post.post_comments[n].comment_id,
                                // children_comments: [],
                                indented: true,
                                comment_date_time: new Date().getTime(),
                                comment_content: comment_content,
                                comment_author: "commenter",  // need to change to current user logged in
                                comment_up_votes: 0,
                                comment_down_votes: 0
                            }
                        ]
                        break;
                    }
                }
                break;
            }
        }

        localStorage.setItem("Available_Posts", JSON.stringify(all_posts))

        set_show_reply_to_comment(false)
        set_show_replies(true)
    }


    const render_indented_comments = () => {

        // this function will render all the replies of a surface level comment

        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {
                    if (post.post_comments[n].comment_id === props.comment.comment_id) {
                        return (
                            post.post_comments[n].children_comments.map((reply, map_id) => {
                                return (
                                    <Comment 
                                        post_id={props.post_id}
                                        comment={reply} 
                                        indented={true}
                                        key={map_id}
                                    />
                                )
                            })
                        )
                    }
                }
                break;
            }
        }


    }
    

    return (
        <div className="Comment">

            <div className="profile_picture">
                <div className="default_profile_pic_div">
                    <img 
                        src="./images/default_user.png" 
                        alt="profile_pic" 
                        className="default_profile_pic"
                    />
                </div>
            </div>

            <div className="comment_content_and_votes">

                <div className="comment_content">
                    <div className="comment_author">
                        <b>{props.comment.comment_author} • </b>{calculate_time_passed(props.comment.comment_date_time)} ago
                    </div>
                    <div className="comment_content_text">{props.comment.comment_content}</div>

                    {
                        props.indented === false

                        &&

                        <div className="reply_btns">
                            <button 
                                className="reply"
                                onClick={() => set_show_reply_to_comment(!show_reply_to_comment)}
                            >
                                {show_reply_to_comment ? "Cancel" : "Reply"}
                            </button>

                            <button 
                                className="view_replies"
                                onClick={() => set_show_replies(!show_replies)}
                            >
                                {show_replies ? "hide replies" : "show replies"}
                            </button>
                        </div>
                    }

                    {
                        show_reply_to_comment 

                        && 

                        <AddComment 
                            handle_add_comment={handle_add_comment_indented}
                        />
                    }

                    {
                        show_replies 
                        
                        &&
                        
                        render_indented_comments()
                    }
                </div>

                <div className="votes">

                    <div className="up_votes">
                        
                        <button 
                            className="up_arrow"
                            onClick={handle_comment_up_vote}
                        >
                            <img 
                                src="./images/up_arrow_v2.png" 
                                alt="up_vote" 
                                className="vote_img up_vote"
                            />
                        </button>

                        {comment_up_votes}
                    </div>

                    <div className="down_votes">

                        <button 
                            className="down_arrow"
                            onClick={handle_comment_down_vote}
                        >
                            <img 
                                src="./images/up_arrow_v2.png" 
                                alt="down_vote" 
                                className="vote_img down down_vote"
                            />
                        </button>

                        {comment_down_votes}
                    </div>

                </div>

            </div>
            
        </div>
    )
}

export default Comment