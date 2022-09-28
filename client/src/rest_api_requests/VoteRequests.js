import axios from 'axios';
import { get_item_local_storage } from '../helper_functions/local_storage';

const BACKEND_ROUTE = "http://localhost:3001";
const CUSTOM_ENDPOINT = `${BACKEND_ROUTE}/api/vote`;

const make_vote = async (post_id, comment_id, parent_type, up_vote) => {
    const response = await axios.post(`${CUSTOM_ENDPOINT}/make_vote`, {
        post_id: post_id,
        comment_id: comment_id,
        parent_type: parent_type,
        up_vote: up_vote
    }, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })

    return response.data
}


const get_vote_count = async (parent_id, parent_type, up_vote) => {
    // up_vote parameter is a boolean

    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all/by_parent_id/${parent_id}/parent_type/${parent_type}/up_vote/${up_vote}`
    );
    
    return response.data
}


const get_curr_user_vote = async (parent_id, parent_type) => {

    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_curr_user_vote/by_parent_id/${parent_id}/parent_type/${parent_type}`
    , {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    });
    
    return response.data
}


export {
    make_vote,
    get_vote_count,
    get_curr_user_vote
}