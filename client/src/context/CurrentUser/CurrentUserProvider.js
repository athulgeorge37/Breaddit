import { createContext, useContext, useState, useEffect } from "react";
import { remove_item_local_storage } from "../../helper/local_storage";
import { is_valid_web_token } from "../../rest_api_requests/UserRequests";

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

    useEffect(() => {
        // checks if user is logged in based on the web token and
        // allows us to condtionnaly render UI
        // console.log("validating user...")
        initialise_curr_user();
    }, []);

    const initialise_curr_user = async () => {
        const response = await is_valid_web_token();

        if (response.error) {
            set_current_user(DEFAULT_CURR_USER_STATE);
            console.log("user is invalid");
        } else {
            console.log({
                msg: `SignedIn as ${response.username}`,
                role: response.role,
            });

            set_current_user({
                username: response.username,
                profile_pic: response.profile_pic,
                authenticated: true,
                role: response.role,
            });
            // console.log("user validated")
            return {
                username: response.username,
                role: response.role,
            };
        }
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
