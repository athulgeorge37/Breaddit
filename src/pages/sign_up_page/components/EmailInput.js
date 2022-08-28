import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get_item_local_storage } from '../../../helper_functions/local_storage';


import './EmailInput.scss';


function EmailInput({ set_email_info }) {

    const navigate = useNavigate();

    const [email_validity, set_email_validity] = useState({
        valid_email: false,
        unique_email: true
    });  

    const validate_email = (new_email) => {

        let valid_email = false
        if (/\S+@\S+\.\S+/.test(new_email)) {
            valid_email = true
        }
        
        let unique_email = true

        const all_users = get_item_local_storage("All_Users")
        for (const user of all_users) {
            if (user.email === new_email) {
                unique_email = false
                break;
            }
        }

        set_email_validity({
            valid_email: valid_email,
            unique_email: unique_email
        })

        set_email_info({
            email: new_email,
            valid: unique_email && valid_email
        })

    }


    return (
        <div className="EmailInput">
            <label htmlFor="email">Email:</label>
            <div className="email_input">
                <input 
                    id="email"
                    type="text"
                    onChange={(e) => validate_email(e.target.value)} 
                    name="email"
                />
            </div>

            <div className="errors">               
                    {
                        email_validity.unique_email  
                        ?
                        <ul>
                            <li 
                                className={email_validity.valid_email ? "valid" : "invalid"}
                            >
                                Valid Email
                            </li>
                        </ul>
                        :
                        <div className="link">
                            This email already has an account. 
                            <button 
                                onClick={() => setTimeout(() => navigate("/signin"), 1000)}
                            >
                                Sign In
                            </button>
                        </div>
                    }
            </div>
        </div>
    )
}

export default EmailInput