import { useState, useContext } from "react";
// importing the All_Posts_Context from app.js
import { ALL_POSTS_CONTEXT } from '../App';

import { v4 as uuid } from 'uuid';
import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';

import Axios from 'axios';

const UPLOAD_PRESET = "yqbnco9l"
const CLOUD_NAME = "dhnxodaho";

export const useEditPost = (initial_post_details) => {

    const { set_all_posts } = useContext(ALL_POSTS_CONTEXT);

    const [post_title, set_post_title] = useState(initial_post_details === undefined ? "" : initial_post_details.post_title);
    const [post_text, set_post_text] = useState(initial_post_details === undefined ? "" : initial_post_details.post_text);

    const [post_up_votes, update_post_up_votes] = useState(initial_post_details === undefined ? 0 : initial_post_details.post_up_votes);
    const [post_down_votes, update_post_down_votes] = useState(initial_post_details === undefined ? 0 : initial_post_details.post_down_votes);

    const [valid_title, set_valid_title] = useState(true);

    // const [selected_image, set_selected_image] = useState("");
    const [image_url, set_image_url] = useState(initial_post_details === undefined ? "" : initial_post_details.post_img_url)

    const [loading_img, set_loading_img] = useState(false);

    const upload_img = (new_img) => {

        const formData = new FormData()

        formData.append("file", new_img)
        formData.append("upload_preset", UPLOAD_PRESET)

        set_loading_img(true)

        Axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData
        ).then((response) => {

            const new_image_url = response.data.secure_url
            set_image_url(new_image_url)
            set_loading_img(false)
        })
    }

    
    const handle_add_post = (new_post_title, new_post_text, new_image_url) => {

        // collates all the details of the post we are trying to post
        // we get all the previous post details
        // we add it to local storage, and update the state of all_posts
        // causes re-render showing the new post on the screen     

        const user_who_posted = get_item_local_storage("Current_User")

        // if (user_who_posted === null) {
        //     return
        // }

        const new_post_details = {
            post_author: user_who_posted,
            post_id: uuid(),
            post_img_url: new_image_url,
            post_title: new_post_title,
            post_text: new_post_text,
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

            // using the context to acces set_all_posts function, without having to prop drill
            set_all_posts(updated_post_list)


            set_item_local_storage("Available_Posts", updated_post_list)
        }

    }


    const handle_edit_post = (post_id) => {
        // to implement

        let all_posts = get_item_local_storage("Available_Posts")

        for (const post of all_posts) {
            if (post.post_id === post_id) {
                post.post_title = post_title
                post.post_text = post_text
                post.post_img_url = image_url
                post.edited = true
                post.post_date_time = new Date().getTime()
                break;
            }
        }

        // updating local storage
        set_item_local_storage("Available_Posts", all_posts)

        // updating the UI for post_id specific post only
        set_post_text(post_text)

    }

    const handle_delete_post = (my_post_id) => {
        let all_posts = get_item_local_storage("Available_Posts")

        for (let n=0; n < all_posts.length; n++) {
            if (all_posts[n].post_id === my_post_id) {
                all_posts.splice(n, 1);
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)

        set_all_posts(all_posts)
    }

    const handle_post_votes = (new_up_vote, new_down_vote) => {
        // finds the appropriate post in localstorage, and
        // updates localstorage to contain each post's up and down votes

        let all_posts = get_item_local_storage("Available_Posts")

        for (const post of all_posts) {
            if (post.post_id === initial_post_details.post_id) {

                post.post_up_votes = new_up_vote
                post.post_down_votes = new_down_vote
                break;
            }
        }

        set_item_local_storage("Available_Posts", all_posts)
    }

    const handle_post_up_vote = () => {
        // updates the UI of up votes
        update_post_up_votes(post_up_votes + 1) 

        // updates the local storage of up votes
        handle_post_votes(post_up_votes + 1, post_down_votes) 
    }

    const handle_post_down_vote = () => {
        // updates the UI of down votes
        update_post_down_votes(post_down_votes - 1) 

        // updates the local storage of down votes
        handle_post_votes(post_up_votes, post_down_votes - 1) 
    }

    return {
        post_title, 
        set_post_title,

        post_text, 
        set_post_text,

        valid_title,
        set_valid_title,

        image_stuff: {
            set_image_url,
            image_url,
            upload_img,
            CLOUD_NAME,
            loading_img
        },

       
        post_up_votes,
        handle_post_up_vote,

        post_down_votes,
        handle_post_down_vote,

        handle_add_post,
        handle_edit_post,
        handle_delete_post
    }
}