import { useState } from 'react';
import './Votes.scss';

import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';


function Votes({ initial_up_votes, initial_down_votes, vote_type, prop_post_id, prop_indented=false, prop_comment_id="" }) {

    const [up_votes, update_up_votes] = useState(initial_up_votes);
    const [down_votes, update_down_votes] = useState(initial_down_votes);


    // through props we need access to x
    // post: post_id, 
    // comments: post_id, comment_id, indented, 

    const handle_post_votes = (new_up_vote, new_down_vote) => {
        // finds the appropriate post in localstorage, and
        // updates localstorage to contain each post's up and down votes

        let all_posts = get_item_local_storage("Available_Posts")

        for (const post of all_posts) {
            if (post.post_id === prop_post_id) {

                post.post_up_votes = new_up_vote
                post.post_down_votes = new_down_vote
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)
    }

    const handle_post_up_vote = () => {
        // updates the UI of up votes
        update_up_votes(up_votes + 1) 

        // updates the local storage of up votes
        handle_post_votes(up_votes + 1, down_votes) 
    }

    const handle_post_down_vote = () => {
        // updates the UI of down votes
        update_down_votes(down_votes + 1) 

        // updates the local storage of down votes
        handle_post_votes(up_votes, down_votes + 1) 
    }

    const handle_comment_votes = (new_up_vote, new_down_vote) => {
        // finds the appropriate comment in localstorage, and
        // updates localstorage to contain each comments up and down votes

        let all_posts = get_item_local_storage("Available_Posts")
        

        for (const post of all_posts) {
            if (post.post_id === prop_post_id) {
                for (let n=0; n < post.post_comments.length; n++) {

                    // must update different part of local storage if the comment rendered is a reply
                    // for up and down votes
                    if (prop_indented) {
                        for (let r=0; r < post.post_comments[n].children_comments.length; r++) {
                            if (post.post_comments[n].children_comments[r].comment_id === prop_comment_id) {
                                post.post_comments[n].children_comments[r] = {
                                    ...post.post_comments[n].children_comments[r],
                                    comment_up_votes: new_up_vote,
                                    comment_down_votes: new_down_vote
                                }
                                break;
                            }
                        }
                    } else {
                        // updating surface level commments for up and down votes
                        if (post.post_comments[n].comment_id === prop_comment_id) {
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

        set_item_local_storage("Available_Posts", all_posts)
    }

    const handle_comment_up_vote = () => {
        // updates the UI of up votes
        update_up_votes(up_votes + 1) 

        // updates the local storage of up votes
        handle_comment_votes(up_votes + 1, down_votes) 
    }

    const handle_comment_down_vote = () => {
        // updates the UI of down votes
        update_down_votes(down_votes + 1) 

        // updates the local storage of down votes
        handle_comment_votes(up_votes, down_votes + 1) 
    }

    const handle_up_vote = () => {
        if (vote_type === "post") {
            handle_post_up_vote()
        } else if (vote_type === "comment" || vote_type === "reply") {
            handle_comment_up_vote()
        }
    }

    const handle_down_vote = () => {
        if (vote_type === "post") {
            handle_post_down_vote()
        } else if (vote_type === "comment" || vote_type === "reply") {
            handle_comment_down_vote()
        }
    }

    return (
        <div className="votes">

            <div className="up_votes">
                {up_votes}
            </div>

            <button 
                className="up_arrow"
                onClick={handle_up_vote}
            >
                {vote_type === "post" && <span>Up Vote</span>}
                <img 
                    src="./images/up_arrow_v3.png" 
                    alt="up_vote" 
                    className="vote_img up_vote"
                />
            </button>

            <button 
                className="down_arrow"
                onClick={handle_down_vote}
            >
                {vote_type === "post" && <span>Down Vote</span>}
                <img 
                    src="./images/up_arrow_v3.png" 
                    alt="up_vote" 
                    className="vote_img down down_vote"
                />
            </button>

            <div className="down_votes">
                {down_votes}
            </div>

        </div>
    )
}

export default Votes