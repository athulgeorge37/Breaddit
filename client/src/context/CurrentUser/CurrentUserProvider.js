import { createContext, useContext, useState, useEffect } from "react";
import { remove_item_local_storage } from "../../helper/local_storage";
import { is_valid_web_token } from "../../rest_api_requests/UserRequests";

import { useQuery } from "@tanstack/react-query";

const CurrentUserContext = createContext();

const DEFAULT_CURR_USER_STATE = {
    username: "",
    profile_pic: null,
    authenticated: false,
    role: null,
};

export default function CurrentUserProvider({ children }) {
    // this component simply allows all children components
    // to have access to the below methods
    // it will aslo initialise the current user
    // when it is mounted

    const [current_user, set_current_user] = useState(DEFAULT_CURR_USER_STATE);

    // allows us to only make one request when component mounts
    const { data: valid_web_token } = useQuery(
        ["valid_web_token"],
        is_valid_web_token
    );

    useEffect(() => {
        // only updates current user state, when there is data
        if (valid_web_token) {
            console.log("data", valid_web_token);
            set_current_user_in_app(valid_web_token);
        }
    }, [valid_web_token]);

    const set_current_user_in_app = (valid_web_token) => {
        if (valid_web_token.error) {
            console.log("user is invalid");
            set_current_user(DEFAULT_CURR_USER_STATE);
        } else {
            console.log({
                msg: `SignedIn as ${valid_web_token.username}`,
                role: valid_web_token.role,
            });

            set_current_user({
                username: valid_web_token.username,
                profile_pic: valid_web_token.profile_pic,
                role: valid_web_token.role,
                authenticated: true,
            });
        }
    };

    const initialise_curr_user = async () => {
        console.log("initialising curr user");
        const response = await is_valid_web_token();

        set_current_user_in_app(response);

        return {
            username: response.username,
            role: response.role,
        };
    };

    const update_current_user = (new_username, new_profile_pic) => {
        set_current_user({
            ...current_user,
            username: new_username,
            profile_pic: new_profile_pic,
        });
    };

    const remove_current_user = () => {
        remove_item_local_storage("web_access_token");
        set_current_user(DEFAULT_CURR_USER_STATE);
        console.log("curr user has been removed");
    };

    return (
        <CurrentUserContext.Provider
            value={{
                current_user,
                remove_current_user,
                initialise_curr_user,
                update_current_user,
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
        update_current_user,
    } = useContext(CurrentUserContext);

    return {
        current_user,
        remove_current_user,
        initialise_curr_user,
        update_current_user,
    };
};
