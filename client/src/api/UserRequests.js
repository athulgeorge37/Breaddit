import axios from "axios";
import {
    get_item_session_storage,
    set_item_session_storage,
} from "../helper/local_storage";
import query_string_generator from "../helper/query_string_generator";

const CUSTOM_ENDPOINT = `${process.env.REACT_APP_REST_API_URL}/api/user`;

const is_valid_web_token = async () => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/check_is_valid_web_token`,
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const create_user = async (email, username, password) => {
    const response = await axios.post(`${CUSTOM_ENDPOINT}/create_user`, {
        email: email,
        username: username,
        password: password,
        profile_pic: null,
        bio: null,
    });

    // settting web_access_token to localstorage
    set_item_session_storage(
        "web_access_token",
        response.data.web_access_token
    );

    return response.data;
};

const sign_in_request = async (email, password, as_guest = false) => {
    const response = await axios.post(`${CUSTOM_ENDPOINT}/sign_in`, {
        email: email,
        password: password,
        as_guest: as_guest,
    });

    if (response.data.web_access_token) {
        // settting web_access_token to localstorage
        set_item_session_storage(
            "web_access_token",
            response.data.web_access_token
        );
    }

    return response.data;
};

const sign_out = async () => {
    const response = await axios.put(
        `${CUSTOM_ENDPOINT}/sign_out`,
        {
            // put requests need a body, sending empty one
        },
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const delete_user = async () => {
    const response = await axios.delete(`${CUSTOM_ENDPOINT}/delete_user`, {
        headers: {
            web_access_token: get_item_session_storage("web_access_token"),
        },
    });

    return response.data;
};

const edit_user_details = async ({
    email = null,
    username = null,
    profile_pic = null,
    bio = null,
}) => {
    const response = await axios.put(
        `${CUSTOM_ENDPOINT}/edit_user_details`,
        {
            email: email,
            username: username,
            profile_pic: profile_pic,
            bio: bio,
        },
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const edit_user_password = async ({ current_password, new_password }) => {
    const response = await axios.put(
        `${CUSTOM_ENDPOINT}/change_password`,
        {
            current_password: current_password,
            new_password: new_password,
        },
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const get_user_details = async (username) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_user_details?${query_string_generator({
            username: username,
        })}`
    );

    return response.data;
};

const get_editable_user_details = async () => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/get_editable_user_details`,
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

const is_unique_email_request = async (new_email) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/check_is_unique_email/${new_email}`
    );

    return response.data;
};

const is_unique_username_request = async (new_username) => {
    const response = await axios.get(
        `${CUSTOM_ENDPOINT}/check_is_unique_username?${query_string_generator({
            username: new_username,
        })}`
    );

    return response.data;
};

export {
    is_valid_web_token,
    create_user,
    sign_in_request,
    sign_out,
    delete_user,
    edit_user_details,
    get_user_details,
    get_editable_user_details,
    edit_user_password,
    is_unique_email_request,
    is_unique_username_request,
};
