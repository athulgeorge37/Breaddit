import React, { useState, useEffect } from 'react';
import './Posts.scss';

import { v4 as uuid } from 'uuid';

import CreatePost from './CreatePost';
import PostContent from './PostContent';

function Posts() {

    // all_posts is passed to AvailablePosts component to render
    // all of them with the appropriate
    const [all_posts, set_all_posts] = useState([]);

    useEffect(() => {
        // called on initial Post Page load
        // we check if there are any posts in local storage and set it to that
        // otherwise just a list
        const available_posts = localStorage.getItem("Available_Posts")

        if (available_posts) {
            set_all_posts(JSON.parse(available_posts))
        } else {
            localStorage.setItem("Available_Posts", "[]")
            set_all_posts([])
        }

    }, [])

    const handle_post = (post_title, post_text) => {

        // collates all the details of the post we are trying to post
        // we get all the previous post details
        // we add it to local storage, and update the state of all_posts
        // causes re-render showing the new post on the screen

        // this function is called in the CreatePost component

        const user_who_posted = JSON.parse(localStorage.getItem("Login_Details"))

        const new_post_details = {
            post_author: user_who_posted,
            post_id: uuid(),
            post_title: post_title,
            post_text: post_text,
            post_date_time: new Date().getTime(),
            post_comments: []
        }

        // previous_posts is of type array
        let previous_posts = localStorage.getItem("Available_Posts")
        if (previous_posts) {
            previous_posts = JSON.parse(previous_posts)
            const updated_post_list = [...previous_posts, new_post_details]

            localStorage.setItem("Available_Posts", JSON.stringify(updated_post_list))
            set_all_posts(updated_post_list)
        }
    }

  return (
    <div className="Posts_Page">
        <CreatePost update_all_posts={handle_post}/>

        <div className="All_Posts">
            {all_posts.map((post_details, key) => {
                return (
                    <PostContent 
                        post_details={post_details}
                        key={key}
                    />
                )
            })}
        </div>
        
    </div>
  )
}

export default Posts