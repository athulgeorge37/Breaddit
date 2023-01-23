import axios from "axios";
// import {
//     get_item_session_storage,
//     set_item_local_storage,
// } from "../helper/local_storage";
// import query_string_generator from "../helper/query_string_generator";

const CUSTOM_ENDPOINT = `${process.env.REACT_APP_REST_API_URL}/api/email`;

const send_verification_code_email = async (email, username) => {
    const response = await axios.post(
        `${CUSTOM_ENDPOINT}/send_verification_code`,
        {
            email,
            username,
        }
    );

    return response.data;
};

export { send_verification_code_email };
