import axios from "axios";
import { get_item_local_storage } from "../helper/local_storage";
import query_string_generator from "../helper/query_string_generator";

const CUSTOM_ENDPOINT = `${process.env.REACT_APP_REST_API_URL}/api/comment`;

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

const get_all_comments = async (post_id, limit, page_num, filter_by) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all_comments?${query_string_generator({
            post_id,
            filter_by,
            page_num,
            limit,
        })}`
    );

    return response.data;
};

const get_all_replies = async (comment_id, limit, page_num, filter_by) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all_replies?${query_string_generator({
            comment_id,
            filter_by,
            page_num,
            limit,
        })}`
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
    get_all_comments,
    get_all_replies,
    check_if_comments_or_replies_exist,
};
