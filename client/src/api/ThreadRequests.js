import axios from "axios";
import { get_item_session_storage } from "../helper/local_storage";
import query_string_generator from "../helper/query_string_generator";

const CUSTOM_ENDPOINT = `${process.env.REACT_APP_REST_API_URL}/api/thread`;

const create_thread_request = async (
    title,
    description,
    logo,
    theme,
    list_of_rules
) => {
    const response = await axios.post(
        `${CUSTOM_ENDPOINT}/create_thread`,
        {
            title,
            description,
            logo,
            theme,
            list_of_rules,
        },
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_thread_details = async (thread_title = null, post_id = null) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_thread_details?${query_string_generator({
            thread_title: thread_title,
            post_id: post_id,
        })}`
    );

    return response.data;
};

const get_thread_names = async (search_input) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_thread_names?search_input=${search_input}`
    );

    return response.data;
};

export { create_thread_request, get_thread_details, get_thread_names };
