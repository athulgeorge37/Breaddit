import axios from 'axios';
import { get_item_local_storage } from '../helper_functions/local_storage';

const BACKEND_ROUTE = "http://localhost:3001";
const CUSTOM_ENDPOINT = `${BACKEND_ROUTE}/api/profile_visits`;

export const make_profile_visit = async (last_minute, curr_time, profile_username) => {
    const response = await axios.post(`${CUSTOM_ENDPOINT}/make_profile_visit`, {
        // passing empty body for post request
        last_minute: last_minute,
        curr_time: curr_time,
        profile_username: profile_username
    }, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })


    return response.data
}
