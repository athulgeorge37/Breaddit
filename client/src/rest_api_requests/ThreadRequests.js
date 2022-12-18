import axios from "axios";
import { get_item_local_storage } from "../helper/local_storage";

const CUSTOM_ENDPOINT = `${process.env.REACT_APP_REST_API_URL}/api/thread`;

const create_thread = async (
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
                web_access_token: get_item_local_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_thread_details = async (thread_title) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_thread_details/by_thread_title/${thread_title}`
    );

    return response.data;
};

const get_thread_names = async (search_input) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_thread_names?search_input=${search_input}`
    );

    return response.data;
};

export { create_thread, get_thread_details, get_thread_names };
