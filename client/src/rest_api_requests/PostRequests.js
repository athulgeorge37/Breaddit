import axios from "axios";
import { get_item_local_storage } from "../helper/local_storage";

const BACKEND_ROUTE = "http://localhost:3001";
const CUSTOM_ENDPOINT = `${BACKEND_ROUTE}/api/post`;

const create_post = async (title, text, image) => {
    const response = await axios.post(
        `${CUSTOM_ENDPOINT}/create_post`,
        {
            title: title,
            text: text,
            image: image,
            edited: false,
        },
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const delete_post = async (post_id) => {
    const response = await axios.delete(
        `${CUSTOM_ENDPOINT}/delete_post/by_id/${post_id}`,
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const edit_post = async (post_id, post_title, post_text, post_image) => {
    const response = await axios.put(
        `${CUSTOM_ENDPOINT}/edit_post`,
        {
            post_id: post_id,
            post_title: post_title,
            post_text: post_text,
            post_image: post_image,
        },
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_all_posts = async (limit, page_num) => {
    // const response = await axios.get(
    //     `${CUSTOM_ENDPOINT}/get_all/limit/${limit}/offset/${offset}`
    // );
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all/limit/${limit}/page_num/${page_num}`
    );

    return response.data;
};

const get_post_by_id = async (post_id) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_by_post_id/${post_id}`
    );

    return response.data;
};

const get_all_posts_by_curr_user = async () => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all/by_curr_user`,
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_all_posts_by_username = async (username) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all/by_username/${username}`
    );

    return response.data;
};

export {
    create_post,
    delete_post,
    edit_post,
    get_all_posts,
    get_post_by_id,
    get_all_posts_by_curr_user,
    get_all_posts_by_username,
};
