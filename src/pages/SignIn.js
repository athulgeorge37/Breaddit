import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginInput from '../components/LoginInput';
import './SignIn.scss';

import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';

function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const  all_users = get_item_local_storage("All_Users");

	const navigate = useNavigate();


	const [valid_signup_details, set_valid_signup_details] = useState({
		email_validity: true,   
		password_validity: true,
		format_validity: true
	});

	const [sign_in_btn, set_sign_in_btn] = useState("Sign In");

	// Alert function
	const blankError = (error) => {
		alert(error)
	  }

	const errorMessage = () => {
		if (valid_signup_details.format_validity){
			return "The email address you entered isn't connected to an account."
		}
		else {
			return "The email format is invalid. Email must contain an \"@\" and \".\" characters"
		}
	}

	const submitSignIn = (e) => {
		e.preventDefault();


		let all_field_entered = true
		for (const field of [email, password]) {
			if (field === "") {
				all_field_entered = false
			}
		}


		if (all_field_entered) {

			let valid_email = false
			let valid_password = false
			let valid_format = false

			// Check the if the entered email and password is valid
			for (let i =0; i < all_users.length; ++i) {

				if (email === all_users[i].email) {
					valid_email = true
					if (password === all_users[i].password) {
						valid_password = true
						set_item_local_storage("Current_User", all_users[i].user_id)
						break;
					}
				}
			}

			if (email.includes("@") && email.includes(".")){
				valid_format = true
			}

			set_valid_signup_details({
				email_validity: valid_email,
				password_validity: valid_password,
				format_validity: valid_format
			})


			if (valid_email && valid_password){
				set_sign_in_btn("Signing In...")
			}
		}
		// Alert the user everytime they submit the form without filling in password or email.
		else {
			if (email !== ""){
				blankError("Please enter your password")
			}
			else if (password !== ""){
				blankError("Please enter your email")
			}
			else{
				blankError("Please fill in your details")
			}
		}

		setTimeout(() => navigate("/profile"), 1500)
	}

return (
	<div className="Sign_In_Page">
		<h2>Sign In</h2>
		<p>By continuing, you agree to our User Agreement and Privacy Policy.</p>
		<hr />

		<form onSubmit={submitSignIn}>
			<LoginInput
				htmlFor="email"
				input_type="email"
				update_on_change={setEmail}
				boolean_check={valid_signup_details.email_validity}
			>
				{errorMessage()}
			</LoginInput>

			<LoginInput
				htmlFor="password"
				input_type="password"
				update_on_change={setPassword}
				boolean_check={valid_signup_details.password_validity}
			>
				The password that you've entered is incorrect.
			</LoginInput>

			<input 
				type="submit" 
				value={sign_in_btn}
				className="submit_btn"
			/>

		</form>

		<div>
			Dont Have an Account?
			<button onClick={() => navigate("/signup")}>Sign Up</button>
		</div>
	</div>
)
}

export default SignIn