import React, { useState } from 'react';
import './SignUp.scss';

import { v4 as uuid } from 'uuid';

import LoginInput from './LoginInput';

function SignUp() {

	const [username, set_username] = useState("");
	const [email, set_email] = useState("");
	const [password_1, set_password_1] = useState("");
	const [password_2, set_password_2] = useState("");

	const [valid_login_details, set_valid_login_details] = useState(
		{
			username_validity: true,
			email_validity: true,
			matching_password_validity: true,
			password_validity: true
		}
	);

	const [sign_up_btn, set_sign_up_btn] = useState("Sign Up");


	const getCurrentDate = () => {

		const newDate = new Date()
		const date = newDate.getDate();
		const month = newDate.getMonth() + 1;
		const year = newDate.getFullYear();
		
		return `${date}/${month}/${year}`
	}

	const submit_sign_up = (e) => {
		// prevents default form submission actions
		e.preventDefault();

		// checks if all fields have been entered
		let all_field_entered = true
		for (const field of [username, email, password_1, password_2]) {
			if (field === "") {
				all_field_entered = false
			}
		}

		// checks if username is of correct length
		let valid_username = false
		if (username.length >= 1 && username.length <= 30) {
			valid_username = true
		}

		let valid_email = false
		if (email.includes("@") && email.includes(".")) {
			valid_email = true
		}

		// checks if password 1 and 2 are the same	
		let matching_passwords = false
		if (password_1 === password_2) {
			matching_passwords = true		
		}

		// and if password has atleast 1 uppercase, 1 lowercase, 1 number, 1 special character
		// and is atleast 8 characters or more in length
		let valid_password = false
		const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
		if (regex.test(password_1)) {
			valid_password = true
		}

		// checks if all values are true, if so, it will be added to local storage
		if (all_field_entered && valid_username && valid_email && matching_passwords && valid_password) {

			set_sign_up_btn("... Signing Up")

			const login_details = {
				user_id: uuid(),
				username: username,
				email: email,
				password: password_1,
				date_joined: getCurrentDate()
			}

			let all_users = JSON.parse(localStorage.getItem("All_Users"))

			if (all_users === null) {
				all_users = []
			}

			all_users = [...all_users, login_details]

			// adding the user to a list of all users
			localStorage.setItem("All_Users", JSON.stringify(all_users))

			// setting the current user
			localStorage.setItem("Current_User", JSON.stringify(login_details.user_id))

		} else {
			set_sign_up_btn("Sign Up")
		}

		// required to get apropriate error messages
		set_valid_login_details({
			username_validity: valid_username,
			email_validity: valid_email,
			matching_password_validity: matching_passwords,
			password_validity: valid_password
		})
	}


	return (
		<div className='Sign_Up_Page'>

			<form onSubmit={submit_sign_up}>

				<h2>Sign Up</h2>

				<LoginInput 
					htmlFor="username" 
					input_type="text" 
					label_name="Username"
					update_on_change={set_username} 
					boolean_check={valid_login_details.username_validity}
				>
					Username must be between 3 and 12 characters long
				</LoginInput>

				<LoginInput 
					htmlFor="email" 
					input_type="email" 
					update_on_change={set_email} 
					boolean_check={valid_login_details.email_validity}
				>
					Email must contain an "@" and "." characters
				</LoginInput>

				<LoginInput 
					htmlFor="password_1" 
					input_type="password" 
					update_on_change={set_password_1} 
					boolean_check={valid_login_details.password_validity}
				>
					<span>Password must contain atleast:</span>
					<ul>
						<li>1 Uppercase letter</li>
						<li>1 Lowercase letter</li>
						<li>1 Special Character</li>
						<li>1 Number</li>
						<li>8 Characters</li>
					</ul>
				</LoginInput>

				<LoginInput 
					htmlFor="password_2" 
					input_type="password"
					label_name="Confirm Password" 
					update_on_change={set_password_2} 
					boolean_check={valid_login_details.matching_password_validity}
				>
					Passwords do not match
				</LoginInput>

				<input 
					type="submit" 
					value={sign_up_btn}
					className="submit_btn"
				/>

			</form>

		</div>
	)
}

export default SignUp