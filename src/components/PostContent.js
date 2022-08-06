import React, { useEffect, useRef, useState } from 'react';
import './PostContent.scss';

import parse from 'html-react-parser';

import AddComment from './AddComment';
import CommentSection from './CommentSection';

import { calculate_time_passed } from '../helper_functions/calculate_time_passed';

// import '.../public/images/up_arrow.png';

function PostContent({ post_details }) {

    const [post_up_votes, update_post_up_votes] = useState(0);
    const [post_down_votes, update_post_down_votes] = useState(0);

    const [show_add_comment, set_show_add_comment] = useState(false);
    const [show_comments_section, set_show_comments_section] = useState(false);

    const [allow_show_more_btn, set_allow_show_more_btn] = useState(false);
    const [show_more_content, set_show_more_content] = useState(false);

    

    // required for read_more/less button
    const posted_content_ref = useRef();

    useEffect(() => {
        const post_content_height = posted_content_ref.current.clientHeight

        // only allowing component to render show more/less btn
        // if the content of the post takes up more than 200px
        if (post_content_height > 200) {
            set_allow_show_more_btn(true)
        }
    }, [])

    const handle_show_more_less_btn = () => {
        // inverting show more/less btn
        set_show_more_content(!show_more_content)

        // scrolling user back to top of content when user
        // clicks the show less btn
        if (show_more_content) {
            posted_content_ref.current.scrollIntoView()
        }
    }


    const initialise_post_votes = () => {
        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        for (const post of all_posts) {
            if (post.post_id === post_details.post_id) {
                update_post_up_votes(post.post_up_votes)
                update_post_down_votes(post.post_down_votes)
                break;
            }
        }
    }

    useEffect(() => {
        // executes on postcontent component load to initialise all votes for each post
        initialise_post_votes()
    }, [])


    const update_local_storage_post_vote = (new_up_vote, new_down_vote) => {
        // finds the appropriate post in localstorage, and
        // updates localstorage to contain each post's up and down votes

        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        for (const post of all_posts) {
            if (post.post_id === post_details.post_id) {

                post.post_up_votes = new_up_vote
                post.post_down_votes = new_down_vote
                break;
            }
        }

        localStorage.setItem("Available_Posts", JSON.stringify(all_posts))
    }

    const handle_post_up_vote = () => {
        // updates the UI of up votes
        update_post_up_votes(post_up_votes + 1) 

        // updates the local storage of up votes
        update_local_storage_post_vote(post_up_votes + 1, post_down_votes) 
    }

    const handle_post_down_vote = () => {
        // updates the UI of down votes
        update_post_down_votes(post_down_votes - 1) 

        // updates the local storage of down votes
        update_local_storage_post_vote(post_up_votes, post_down_votes - 1) 
    }



    return (
        <div className="PostContent">

            <div className="post_user_and_awards">
                <div className="post_user">
                    <div className="default_profile_pic_div">
                        <img 
                            src="./images/default_user.png" 
                            alt="profile_picture" 
                            className="default_profile_pic"
                        />
                    </div>
                    <div className="posted_by_user">
                        <b>{post_details.post_author.username} • </b>{calculate_time_passed(post_details.post_date_time)} ago
                    </div>
                </div>
                <button className="awards">
                    Give Award
                </button>
            </div>


            <div className="main_content_and_votes">

                <div className="text_content">
                    <div 
                        className={"display_text " + (allow_show_more_btn ? (show_more_content ? "" : "show_less") : "")}
                        ref={posted_content_ref}
                    >
                        <h1 className="Title">{post_details.post_title}</h1>
                        <div className="parsed_text">
                            {parse(post_details.post_text)}
                        </div>
                    </div>
                </div>

                <div className="votes">

                    <div className="up_votes">
                        {post_up_votes}
                    </div>
                    <button 
                        className="up_arrow"
                        onClick={handle_post_up_vote}
                    >
                        <img 
                            src="./images/up_arrow_v2.png" 
                            alt="up_vote" 
                            className="vote_img up_vote"
                        />
                    </button>

                    <button 
                        className="down_arrow"
                        onClick={handle_post_down_vote}
                    >
                        <img 
                            src="./images/up_arrow_v2.png" 
                            alt="up_vote" 
                            className="vote_img down down_vote"
                        />
                    </button>
                    <div className="down_votes">
                        {post_down_votes}
                    </div>

                </div>
            </div>

            <div className="post_btns">

                <div>               
                    {
                        allow_show_more_btn ?

                        <button 
                            className="show_more_less_btn"
                            onClick={handle_show_more_less_btn}
                        >
                            {show_more_content ? "Read Less" : "Read More"}
                        </button> 

                        :

                        <></>
                    }
                </div>

                <div className="both_comments_btns">
                    <button 
                        className={show_add_comment ? "cancel_btn" : "add_comment_btn"}
                        onClick={() => set_show_add_comment(!show_add_comment)}
                    >
                        {show_add_comment ? "Cancel" : "Add Comment"}
                    </button>

                    <button 
                        className={"comments_btn " + (show_comments_section ? "hide_comments" : "show_comments")}
                        onClick={() => set_show_comments_section(!show_comments_section)}
                    >
                        {show_comments_section ? "Hide Comments" : "Show Comments"}
                    </button>
                </div>
                
            </div>

            <div className="expanded_add_comment">
                {
                    show_add_comment &&

                    <AddComment 
                        post_id={post_details.post_id}
                        set_show_add_comment={set_show_add_comment}
                        set_show_comments_section={set_show_comments_section}
                    />
                }
            </div>

            <div className="expanded_comments_section">
                {
                    show_comments_section &&

                    <CommentSection
                        post_id={post_details.post_id}
                    />

                }
            </div>

        </div>
    )
}

export default PostContent