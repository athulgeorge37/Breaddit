import axios from "axios";
import { get_item_session_storage } from "../helper/local_storage";
import query_string_generator from "../helper/query_string_generator";

const CUSTOM_ENDPOINT = `${process.env.REACT_APP_REST_API_URL}/api/vote`;

const make_vote = async (vote_id, vote_type, up_vote) => {
    const response = await axios.post(
        `${CUSTOM_ENDPOINT}/make_vote`,
        {
            vote_id: vote_id,
            vote_type: vote_type,
            up_vote: up_vote,
        },
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_curr_user_vote = async (parent_id, parent_type) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_curr_user_vote/by_parent_id/${parent_id}/parent_type/${parent_type}`,
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_all_profile_who_voted = async (
    parent_type,
    parent_id,
    up_vote,
    limit,
    page_num
) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all_voters?${query_string_generator({
            parent_type,
            parent_id,
            up_vote,
            limit,
            page_num,
        })}`,
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

export { make_vote, get_curr_user_vote, get_all_profile_who_voted };
