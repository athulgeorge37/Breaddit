import axios from 'axios';
import { get_item_local_storage } from '../helper_functions/local_storage';

const BACKEND_ROUTE = "http://localhost:3001";
const CUSTOM_ENDPOINT = `${BACKEND_ROUTE}/api/comment`;

const create_comment = async (parent_id, text, is_reply) => {
    const response = await axios.post(`${CUSTOM_ENDPOINT}/create_comment`, {
        parent_id: parent_id,
        text: text,
        is_reply: is_reply,
        edited: false
    }, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })

    return response.data
}

const delete_comment = async (comment_id) => {
    const response = await axios.delete(`${CUSTOM_ENDPOINT}/delete_comment/by_id/${comment_id}`, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })

    return response.data
}

const edit_comment = async (comment_id, comment_text) => {
    const response = await axios.put(`${CUSTOM_ENDPOINT}/edit_comment`, {
        comment_id: comment_id,
        comment_text: comment_text
    }, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })

    return response.data
}

const get_all_comments_by_parent_id = async (parent_id, is_reply) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all/by_parent_id/${parent_id}/is_reply/${is_reply}`
    );
    
    return response.data
}


export {
    create_comment,
    delete_comment,
    edit_comment,
    get_all_comments_by_parent_id
}