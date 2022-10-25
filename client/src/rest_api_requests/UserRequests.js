import axios from 'axios';
import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';

const BACKEND_ROUTE = "http://localhost:3001";
const CUSTOM_ENDPOINT = `${BACKEND_ROUTE}/api/user`;


const is_valid_web_token = async () => {
    const response = await axios.get(`${CUSTOM_ENDPOINT}/check_is_valid_web_token`, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })

    return response.data
}

const create_user = async (email, username, password) => {
    const response = await axios.post(`${CUSTOM_ENDPOINT}/create_user`, {
        email: email,
        username: username,
        password: password,
        profile_pic: null,
        bio: null
    })

    // settting web_access_token to localstorage
    set_item_local_storage("web_access_token", response.data.web_access_token)

    return response.data
}


const sign_in = async (email, password) => {
    const response = await axios.post(`${CUSTOM_ENDPOINT}/sign_in`, {
        email: email,
        password: password
    })

    if (response.data.web_access_token) {
        // settting web_access_token to localstorage
        set_item_local_storage("web_access_token", response.data.web_access_token)
    }

    return response.data
}

const sign_out = async () => {
    const response = await axios.put(`${CUSTOM_ENDPOINT}/sign_out`, {
        // put requests need a body, sending empty one
    }, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })

    return response.data
}

const delete_user = async () => {
    const response = await axios.delete(`${CUSTOM_ENDPOINT}/delete_user`, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })
    
    return response.data
}

const edit_user_details = async (email, username, profile_pic, bio) => {
    const response = await axios.put(`${CUSTOM_ENDPOINT}/edit_user_details`, {
        email: email,
        username: username,
        profile_pic: profile_pic,
        bio: bio
    }, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })
    
    return response.data
}

const get_curr_user_details = async () => {
    const response = await axios.get(`${CUSTOM_ENDPOINT}/get_curr_user_details`, {
        headers: {
            web_access_token: get_item_local_storage("web_access_token")
        }
    })

    // returns an object with a property called user_details
    // user_details is also an object that contains 
    // {
    //     username,
    //     email,
    //     role,
    //     bio,
    //     createAt,
    //     password,
    //     profile_pic
    // }
    return response.data
}

const get_user_profile_details = async (username) => {
    const response = await axios.get(`${CUSTOM_ENDPOINT}/get_user_profile_details/by_username/${username}`)

    return response.data
}

const is_unique_email = async (new_email) => {
    const response = await axios.get(`${CUSTOM_ENDPOINT}/check_is_unique_email/${new_email}`)

    return response.data
}

const is_unique_username = async (new_username) => {
    const response = await axios.get(`${CUSTOM_ENDPOINT}/check_is_unique_username/${new_username}`)

    return response.data
}





export {
    is_valid_web_token,
    create_user,
    sign_in, 
    sign_out,
    delete_user,
    edit_user_details,
    get_curr_user_details,
    get_user_profile_details,
    is_unique_email,
    is_unique_username,
}