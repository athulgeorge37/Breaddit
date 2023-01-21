import "./EditEmail.scss";

// hooks
import { useState, useEffect } from "react";
import useDebounce from "../../hooks/useDebounce";

// api
import { is_unique_email_request } from "../../api/UserRequests";

function EditEmail() {
    return <div className="EditEmail">Hola</div>;
}

const useDebouncedIsUniqueEmail = (email, orginal_email = null) => {
    const [is_unique_email, set_is_unique_email] = useState(true);
    const debounced_search = useDebounce(email, 500);
    // const [is_loading, set_is_loading] = useState(false);

    const [is_valid_email, set_is_valid_email] = useState(true);

    useEffect(() => {
        // searching the api for thread names
        const check_is_unique_email = async () => {
            // set_is_loading(true);

            if (email === "") {
                set_is_unique_email(false);
                return;
            }

            if (orginal_email !== null) {
                if (email === orginal_email) {
                    // when user is searching their own name, no need to make a request
                    // and should be true since they already have registered that username
                    set_is_unique_email(true);
                    return;
                }
            }

            let valid_email = false;
            if (/\S+@\S+\.\S+/.test(email)) {
                valid_email = true;
            }

            set_is_valid_email(valid_email);

            if (valid_email === false) {
                // not making a request until they have met the following conditions
                return;
            }

            const data = await is_unique_email_request(debounced_search);
            if (data.error) {
                console.log({ data });
                return;
            }
            set_is_unique_email(data.is_unique);

            // set_is_loading(false);
        };

        if (debounced_search) {
            // will only check if username is unqiue when 500ms
            // has passed, after typing
            check_is_unique_email();
        }
    }, [debounced_search]);

    return {
        // is_loading,
        is_unique_email,
        is_valid_email,
    };
};

export { useDebouncedIsUniqueEmail };

export default EditEmail;
