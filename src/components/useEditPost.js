import { useState, useContext } from "react";
// importing the All_Posts_Context from posts.js
import { All_Posts_Context } from '../pages/Posts';

import { v4 as uuid } from 'uuid';
import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';

export const useEditPost = (initial_post_title, initial_post_text) => {

    const { set_all_posts } = useContext(All_Posts_Context);

    const [post_title, set_post_title] = useState(initial_post_title !== undefined ? initial_post_title : "");
    const [valid_title, set_valid_title] = useState(true);
    const [post_text, set_post_text] = useState(initial_post_text !== undefined ? initial_post_text : "");
    
    const handle_add_post = () => {

        // collates all the details of the post we are trying to post
        // we get all the previous post details
        // we add it to local storage, and update the state of all_posts
        // causes re-render showing the new post on the screen     


        const user_who_posted = get_item_local_storage("Current_User")

        const new_post_details = {
            post_author: user_who_posted,
            post_id: uuid(),
            post_title: post_title,
            post_text: post_text,
            post_date_time: new Date().getTime(),
            post_up_votes: 0,
            post_down_votes: 0,
            post_comments: [],
            edited: false
        }

        // previous_posts is an array of objects, each object containing info on a post
        let previous_posts = get_item_local_storage("Available_Posts")
        if (previous_posts !== null) {
            const updated_post_list = [new_post_details, ...previous_posts]

            set_item_local_storage("Available_Posts", updated_post_list)

            // using the context to acces set_all_posts function, without having to prop drill
            set_all_posts(updated_post_list)
        }

        set_valid_title(true)
        set_post_title("")
        set_post_text("")
    }


    const handle_edit_post = () => {
        // to implement
    }

    const handle_delete_post = () => {
        // to implement
    }

    return {
        post_title, 
        post_text, 
        valid_title,
        set_post_title,
        set_valid_title,
        set_post_text,
        handle_add_post
    }
}