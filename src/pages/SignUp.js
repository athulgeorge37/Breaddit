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

import emailjs from "emailjs-com";


const generate_random_code = () => {
	return Math.floor(100000 + Math.random() * 900000)
}

function SignUp() {

	const navigate = useNavigate();

	const [signed_up, set_signed_up] = useState(false);

	const [email_info, set_email_info] = useState({ email: "", valid: false });
	const [username_info, set_username_info] = useState({ username: "", valid: false });
	const [password_info, set_password_info] = useState({ password: "", valid: false });

	const initial_verification_code = generate_random_code(); // initial code generated, that is sent via email

	const [verification_code, set_verification_code] = useState(""); 	// what the user types in here


	useEffect(() => {
		// preventing errors when localstorage is not set
		if (get_item_local_storage("All_Users") === null) {
			set_item_local_storage("All_Users", [])
		}
	}, [])




	const submit_sign_up = () => {
		

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

		// verify verification_code here
		if (verification_code !== initial_verification_code) {
			return
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

	const handle_submit_form = (e) => {
		// prevents default form submission actions
		e.preventDefault();

		emailjs.sendForm('service_7y225ea', 'template_bwf9ien', e.target, 'Dem37imrKFPE7e_et')
			.then((result) => {
          		console.log(result.text);
      		}, (error) => {
          		console.log(error.text);
      		});


	}


	return (
		<div className='Sign_Up_Page'>
			
			<h2>Sign Up To Breaddit</h2>

			<form onSubmit={submit_sign_up}>

				<EmailInput set_email_info={set_email_info}/>

				<UsernameInput set_username_info={set_username_info}/>

				<PasswordInput set_password_info={set_password_info}/>

				<input 
					type="text"
					name="verification_code"
					value={initial_verification_code}
				/>

				
				<input 
					type="submit" 
					value={"Send Verification"}
					className="submit_btn"
				/>

			</form>

			{/* <input 
				type="submit" 
				value={signed_up ? "...Signing Up" : "Sign Up"}
				className="submit_btn"
			/> */}

			<input 
				type="text"
				placeholder='enter your verification code'
				onChange={(e) => set_verification_code(e.target.value)}
			/>

			<button onClick={submit_sign_up}>Sign Up</button>

		</div>
	)
}

export default SignUp