import React, { useState } from 'react';
import './Comment.scss';

import { calculate_time_passed } from '../helper_functions/calculate_time_passed';

function Comment(props) {

    const [up_votes, set_up_votes] = useState(0);
    const [down_votes, set_down_votes] = useState(0);

    const handle_up_vote = () => {

        set_up_votes(up_votes + 1)

        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                for (const each_comment of post.post_comments) {
                    if (each_comment.comment_id === props.comment.comment_id) {
                        each_comment = {
                            ...each_comment,
                            comment_up_votes: up_votes
                        }
                    }
                }
            }
        }

        localStorage.setItem("Available_Posts", JSON.stringify(all_posts))
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
                        <b>{props.comment.comment_author}:</b> {calculate_time_passed(props.comment.comment_date_time)} ago
                    </div>
                    <div className="comment_content_text">{props.comment.comment_content}</div>

                </div>

                <div className="votes">

                    <div className="up_votes">
                        
                        <button 
                            className="up_arrow"
                            onClick={handle_up_vote}
                        >
                            <img src="./images/up_arrow_v2.png" alt="up_vote" className="vote_img up_vote"/>
                        </button>

                        {up_votes}
                    </div>

                    <div className="down_votes">

                        <button 
                            className="down_arrow"
                            onClick={() => set_down_votes(down_votes - 1)}
                        >
                            <img src="./images/up_arrow_v2.png" alt="up_vote" className="vote_img down down_vote"/>
                        </button>

                        {down_votes}
                    </div>

                </div>

            </div>
            
        </div>
    )
}

export default Comment