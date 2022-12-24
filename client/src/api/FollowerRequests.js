import axios from "axios";
import { get_item_local_storage } from "../helper/local_storage";

const CUSTOM_ENDPOINT = `${process.env.REACT_APP_REST_API_URL}/api/follower`;

const follow_or_unfollow_account = async (account_id) => {
    const response = await axios.post(
        `${CUSTOM_ENDPOINT}/follow_or_unfollow_account`,
        {
            account_id: account_id,
        },
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const follow_account = async (username) => {
    const response = await axios.post(
        `${CUSTOM_ENDPOINT}/follow_account`,
        {
            account_to_follow: username,
        },
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const unfollow_account = async (username) => {
    const response = await axios.delete(
        `${CUSTOM_ENDPOINT}/unfollow_account/by_username/${username}`,
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_accounts_of_type_by_username = async (type, username) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_all/accounts/of_type/${type}/username/${username}`
    );

    return response.data;
};

const get_count_of_type_by_username = async (type, username) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_count_of/accounts/of_type/${type}/username/${username}`
    );

    return response.data;
};

const check_is_following_username = async (username) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/check_is_following/by_username/${username}`,
        {
            headers: {
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

export {
    follow_or_unfollow_account,
    follow_account,
    unfollow_account,
    get_accounts_of_type_by_username,
    get_count_of_type_by_username,
    check_is_following_username,
};
