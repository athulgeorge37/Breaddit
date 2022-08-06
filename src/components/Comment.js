import React, { useState } from 'react';
import './Comment.scss';

import { calculate_time_passed } from '../helper_functions/calculate_time_passed';
import { useEffect } from 'react';

function Comment(props) {

    const [comment_up_votes, update_comment_up_votes] = useState();
    const [comment_down_votes, update_comment_down_votes] = useState();

    const initialise_comment_votes = () => {
        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (let n=0; n < post.post_comments.length; n++) {
                    if (post.post_comments[n].comment_id === props.comment.comment_id) {
                        update_comment_up_votes(post.post_comments[n].comment_up_votes)
                        update_comment_down_votes(post.post_comments[n].comment_down_votes)
                        break;
                    }
                }
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
                                alt="up_vote" 
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