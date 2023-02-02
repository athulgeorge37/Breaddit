// hooks
import { useEffect, useState } from "react";
import useDebounce from "./useDebounce";

// api
import { is_unique_username_request } from "../api/UserRequests";

const useUsername = (username, original_username = null) => {
    const [is_unique_username, set_is_unique_username] = useState(true);
    const debounced_search = useDebounce(username, 500);
    // const [is_loading, set_is_loading] = useState(false);
    const [min_three_char, set_min_three_char] = useState(true);
    const [max_fifteen_char, set_max_fifteen_char] = useState(true);
    const [contains_space, set_contains_space] = useState(false);
    const [is_valid_username, set_is_valid_username] = useState(false);

    useEffect(() => {
        // searching the api for thread names
        const validate_username = async () => {
            // set_is_loading(true);

            if (username === "") {
                set_is_unique_username(false);
                return;
            }

            if (original_username !== null) {
                if (username === original_username) {
                    // when user is searching their own name, no need to make a request
                    // and should be true since they already have registered that username
                    set_is_unique_username(true);
                    return;
                }
            }

            let has_min_three_char = true;
            if (username.length < 3) {
                has_min_three_char = false;
            }

            let has_max_fifteen_char = true;
            if (username.length > 15) {
                has_max_fifteen_char = false;
            }

            let has_space_character = false;
            if (username.includes(" ")) {
                has_space_character = true;
            }

            set_max_fifteen_char(has_max_fifteen_char);
            set_min_three_char(has_min_three_char);
            set_contains_space(has_space_character);

            if (!has_min_three_char || !has_max_fifteen_char) {
                // not making a request until they have met the following conditions
                return;
            }

            const data = await is_unique_username_request(debounced_search);
            if (data.error) {
                //console.log({ data });
                return;
            }
            set_is_unique_username(data.is_unique);

            // set_is_loading(false);
        };

        if (debounced_search) {
            // will only check if username is unqiue when 500ms
            // has passed, after typing
            validate_username();
        }
    }, [debounced_search]);

    useEffect(() => {
        if (
            is_unique_username &&
            max_fifteen_char &&
            min_three_char &&
            !contains_space
        ) {
            set_is_valid_username(true);
        } else {
            set_is_valid_username(false);
        }
    }, [is_unique_username, max_fifteen_char, min_three_char, contains_space]);

    return {
        // is_loading,
        is_unique_username,
        max_fifteen_char,
        min_three_char,
        contains_space,
        is_valid_username,
    };
};

export default useUsername;
