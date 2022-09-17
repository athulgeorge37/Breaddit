import { useState } from "react";


import { v4 as uuid } from 'uuid';
import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';

import Axios from 'axios';

const UPLOAD_PRESET = "yqbnco9l"
const CLOUD_NAME = "dhnxodaho";

export const useEditPost = (set_all_posts, initial_post_details) => {


    const [post_title, set_post_title] = useState(initial_post_details === undefined ? "" : initial_post_details.post_title);
    const [post_text, set_post_text] = useState(initial_post_details === undefined ? "" : initial_post_details.post_text);


    const [valid_title, set_valid_title] = useState(true);

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


    const handle_cancel_edit_post = () => {
        set_post_title(initial_post_details.post_title)
        set_post_text(initial_post_details.post_text)
        set_image_url(initial_post_details.post_img_url)
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

        handle_add_post,
        handle_edit_post,
        handle_delete_post,
        handle_cancel_edit_post
    }
}