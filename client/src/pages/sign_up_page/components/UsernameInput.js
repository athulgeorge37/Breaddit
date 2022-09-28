import { useState, useEffect } from 'react';
import { get_item_local_storage } from '../../../helper_functions/local_storage';
import { is_unique_username } from '../../../rest_api_requests/UserRequests';

import './UsernameInput.scss';

const MIN_USERNAME_LENGTH = 3
const MAX_USERNAME_LENGTH = 15

function UsernameInput({ set_username_info, initial_username }) {

    const [characters_left, set_characters_left] = useState(0);
    const [usernname_validity, set_usernname_validity] = useState({
        correct_length: false,
        unique_name: false
    });


    const validate_username = async (new_username) => {

        set_characters_left(new_username.length)

        let correct_length = false
        // let unique_name = true

        if (new_username.length > MIN_USERNAME_LENGTH) {
            correct_length = true
        }

        // const all_users = get_item_local_storage("All_Users")
        // for (const user of all_users) {
        //     if (user.username === new_username) {
        //         unique_name = false
        //         break;
        //     }
        // }

        
        // this is very inneficient since it running every time on change
        // should call when submitting sign_up
        let unique_name = await is_unique_username(new_username);

        if ((initial_username !== undefined) && (new_username === initial_username)) {
            unique_name = true
        }
        

        set_usernname_validity({
            correct_length: correct_length,
            unique_name: unique_name
        })  

        set_username_info({
            username: new_username,
            valid: correct_length && unique_name
        })

    }

    useEffect(() => {
        // required for edit profile component
        // where we initialise the pasword
        if (initial_username !== undefined) {
            validate_username(initial_username)
        }
    }, [])

    return (
        <div className="UsernameInput">
            <label htmlFor="username">Username:</label>
            <div className="username_input">
                <input 
                    id="username"
                    type="text"
                    onChange={(e) => validate_username(e.target.value)} 
                    maxLength={MAX_USERNAME_LENGTH}
                    name="username"
                    defaultValue={initial_username}
                />
                <div className="characters_left">{characters_left}</div>
            </div>

            <div className="errors">
                <ul>
                    <li 
                        className={usernname_validity.unique_name ? "valid" : "invalid"}
                    >Unique Username</li>
                    <li 
                        className={usernname_validity.correct_length ? "valid" : "invalid"}
                    >{MIN_USERNAME_LENGTH} Characters</li>
                </ul>
            </div>
        </div>
    )
}

export default UsernameInput