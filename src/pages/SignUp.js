// styles import
import './SignUp.scss';

// hook imports
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// component imports
import PasswordInput from './PasswordInput';
import UsernameInput from './UsernameInput';
import EmailInput from './EmailInput';

// function imports
import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';
import { get_current_date } from "../helper_functions/time";
import { v4 as uuid } from 'uuid';



function SignUp() {

	const navigate = useNavigate();

	const [signed_up, set_signed_up] = useState(false);

	const [email_info, set_email_info] = useState({ email: "", valid: false });
	const [username_info, set_username_info] = useState({ username: "", valid: false });
	const [password_info, set_password_info] = useState({ password: "", valid: false });


	useEffect(() => {
		// preventing errors when localstorage is not set
		if (get_item_local_storage("All_Users") === null) {
			set_item_local_storage("All_Users", [])
		}
	}, [])


	const submit_sign_up = (e) => {
		// prevents default form submission actions
		e.preventDefault();

		for(const sign_up_input of [email_info, username_info, password_info]) {
			if (sign_up_input.valid === false) {
				return
			}
		}

		// visual cue for sign up
		set_signed_up(true)

		const login_details = {
			user_id: uuid(),
			username: username_info.username,
			email: email_info.email,
			password: password_info.password,
			date_joined: get_current_date()
		}

		// setting user_details to localstorage
		let all_users = get_item_local_storage("All_Users")

		all_users = [...all_users, login_details]

		// adding the user to a list of all users
		set_item_local_storage("All_Users", all_users)

		// setting the current user
		set_item_local_storage("Current_User", login_details.user_id)

		// navigating to profile page after short delay
		setTimeout(() => navigate("/profile"), 1500)
	}


	return (
		<div className='Sign_Up_Page'>
			
			<h2>Sign Up To Breaddit</h2>

			<form onSubmit={submit_sign_up}>

				<EmailInput set_email_info={set_email_info}/>

				<UsernameInput set_username_info={set_username_info}/>

				<PasswordInput set_password_info={set_password_info}/>

				<input 
					type="submit" 
					value={signed_up ? "...Signing Up" : "Sign Up"}
					className="submit_btn"
				/>

			</form>

		</div>
	)
}

export default SignUp