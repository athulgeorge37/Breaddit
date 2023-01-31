import axios from "axios";
import { get_item_session_storage } from "../helper/local_storage";

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

const report_issue_request = async (topic, description) => {
    const response = await axios.post(
        `${CUSTOM_ENDPOINT}/report_issue_request`,
        {
            topic,
            description,
        },
        {
            headers: {
                web_access_token: get_item_session_storage("web_access_token"),
            },
        }
    );

    return response.data;
};

export { send_verification_code_email, report_issue_request };
