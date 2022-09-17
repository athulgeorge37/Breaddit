import { useState, useRef } from "react";
import './PasswordCheck.scss';

function PasswordCheck({ label_name, set_password }) {

    const [show_password, set_show_password] = useState(false);

    const input_ref = useRef(null);


    return (
        <div className="Password_Check">
            <label htmlFor="password">{label_name}:</label>
            <div className="password_input">
                <input 
                    id="password"
                    type={show_password ? "text" : "password"}
                    onChange={(e) => set_password(e.target.value)} 
                    ref={input_ref}
                />
                <img 
                    src={show_password ? "./images/visible.png" : "./images/not_visible.png"} 
                    alt={show_password ? "show password" : "show password"}
                    onClick={() => {
                        set_show_password(!show_password)
                        input_ref.current.focus()
                    }}
                />
            </div>
        </div>
    )
}

export default PasswordCheck