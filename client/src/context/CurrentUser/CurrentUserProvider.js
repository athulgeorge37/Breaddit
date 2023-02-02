import { createContext, useContext, useState } from "react";
import { remove_item_session_storage } from "../../helper/local_storage";
import { is_valid_web_token } from "../../api/UserRequests";

import { useQuery } from "@tanstack/react-query";

const CurrentUserContext = createContext();

const DEFAULT_CURR_USER_STATE = {
    username: "",
    profile_pic: null,
    role: null,
    authenticated: false,
};

export default function CurrentUserProvider({ children }) {
    // this component simply allows all children components
    // to have access to the below methods
    // it will aslo initialise the current user
    // when it is mounted

    const [current_user, set_current_user] = useState(DEFAULT_CURR_USER_STATE);

    // allows us to only make one request when component mounts
    useQuery(["is_valid_web_token"], is_valid_web_token, {
        onSuccess: (data) => {
            // data is the web token
            set_current_user_in_app(data);
        },
        onError: (data) => {
            // console.log(data);
        },
    });

    const set_current_user_in_app = (valid_web_token) => {
        if (valid_web_token.error) {
            // console.log("user is invalid");
            set_current_user(DEFAULT_CURR_USER_STATE);
        } else {
            // console.log({
            //     msg: `SignedIn as ${valid_web_token.username}`,
            //     role: valid_web_token.role,
            // });

            set_current_user({
                username: valid_web_token.username,
                profile_pic: valid_web_token.profile_pic,
                role: valid_web_token.role,
                authenticated: true,
            });
        }
    };

    const initialise_curr_user = async () => {
        // console.log("initialising curr user");
        const response = await is_valid_web_token();

        // response here is the web token
        set_current_user_in_app(response);

        return {
            username: response.username,
            role: response.role,
        };
    };

    const update_current_user_username = (new_username) => {
        set_current_user({
            ...current_user,
            username: new_username,
        });
    };

    const update_current_user_profile_pic = (new_profile_pic) => {
        set_current_user({
            ...current_user,
            profile_pic: new_profile_pic,
        });
    };

    const remove_current_user = () => {
        remove_item_session_storage("web_access_token");
        set_current_user(DEFAULT_CURR_USER_STATE);

        // prefferably add notifcation here
        // console.log("curr user has been removed");
    };

    return (
        <CurrentUserContext.Provider
            value={{
                current_user,
                remove_current_user,
                initialise_curr_user,
                update_current_user_profile_pic,
                update_current_user_username,
            }}
        >
            {children}
        </CurrentUserContext.Provider>
    );
}

export const useCurrentUser = () => {
    // this is a custom hook that provides
    // access to the below methods

    const {
        current_user,
        remove_current_user,
        initialise_curr_user,
        update_current_user_profile_pic,
        update_current_user_username,
    } = useContext(CurrentUserContext);

    return {
        current_user,
        remove_current_user,
        initialise_curr_user,
        update_current_user_profile_pic,
        update_current_user_username,
    };
};
