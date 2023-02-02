import axios from "axios";
import { get_item_session_storage } from "../helper/local_storage";
import query_string_generator from "../helper/query_string_generator";

const CUSTOM_ENDPOINT = `${process.env.REACT_APP_REST_API_URL}/api/post`;

const create_post = async (title, text, image, thread_id) => {
    const response = await axios.post(
        `${CUSTOM_ENDPOINT}/create_post`,
        {
            title: title,
            text: text,
            image: image,
            thread_id: thread_id,
            edited: false,
        },
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const delete_post_request = async (post_id) => {
    const response = await axios.delete(
        `${CUSTOM_ENDPOINT}/delete_post/post_id/${post_id}`,
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const edit_post_request = async (
    post_id,
    post_title,
    post_text,
    post_image
) => {
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
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_all_posts = async (
    limit,
    page_num,
    filter_by,
    search_input,
    thread_title
) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all_posts?${query_string_generator({
            limit,
            page_num,
            filter_by,
            search_input,
            thread_title,
        })}`
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
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_all_posts_by_username = async ({
    limit,
    page_num,
    filter_by,
    search_input,
    username,
}) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all_posts_by_username/?${query_string_generator(
            {
                limit,
                page_num,
                filter_by,
                search_input,
                username,
            }
        )}`
    );

    return response.data;
};

export {
    create_post,
    delete_post_request,
    edit_post_request,
    get_all_posts,
    get_post_by_id,
    get_all_posts_by_curr_user,
    get_all_posts_by_username,
};
