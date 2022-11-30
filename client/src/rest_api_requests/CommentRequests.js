import axios from "axios";
import { get_item_local_storage } from "../helper/local_storage";

const BACKEND_ROUTE = "http://localhost:3001";
const CUSTOM_ENDPOINT = `${BACKEND_ROUTE}/api/comment`;

const create_comment_or_reply = async (
    post_id,
    text,
    type,
    parent_comment_id = null
) => {
    // parent_comment_id is not required when making comments,
    // only required for replies

    const response = await axios.post(
        `${CUSTOM_ENDPOINT}/create/of_type/${type}`,
        {
            post_id: post_id,
            text: text,
            parent_comment_id: parent_comment_id,
        },
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const delete_comment_or_reply = async (type, id) => {
    const response = await axios.delete(
        `${CUSTOM_ENDPOINT}/delete/of_type/${type}/by_id/${id}`,
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const edit_comment_or_reply = async (comment_id, updated_text) => {
    const response = await axios.put(
        `${CUSTOM_ENDPOINT}/edit_comment_or_reply`,
        {
            comment_id: comment_id,
            updated_text: updated_text,
        },
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

// const get_all_comments_by_post_id = async (post_id) => {
//     const response = await axios.get(
//         `${CUSTOM_ENDPOINT}/get_all_comments/by_post_id/${post_id}`
//     );

//     // returns an object with a property called all_comments: list of comment objects
//     return response.data;
// };

const get_all_comments_by_post_id = async (post_id, limit, page_num) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all_comments/by_post_id/${post_id}/limit/${limit}/page_num/${page_num}`
    );

    return response.data;
};

const get_all_replies_by_comment_id = async (comment_id, limit, page_num) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all_replies/by_comment_id/${comment_id}/limit/${limit}/page_num/${page_num}`
    );

    // returns an object with a property called all_replies: list of comment objects
    return response.data;
};

const check_if_comments_or_replies_exist = async (type, parent_id) => {
    // if type === comment, parent_id should be of post_id
    // if type === reply, parent_id should be of comment_id

    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/is_any/of_type/${type}/for_parent_id/${parent_id}`
    );

    // returns an object with a property called is_any: boolean
    return response.data;
};

export {
    create_comment_or_reply,
    delete_comment_or_reply,
    edit_comment_or_reply,
    get_all_comments_by_post_id,
    get_all_replies_by_comment_id,
    check_if_comments_or_replies_exist,
};
