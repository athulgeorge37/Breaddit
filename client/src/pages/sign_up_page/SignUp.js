// styles import
import './SignUp.scss';

// hook imports
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// component imports
import PasswordInput from './components/PasswordInput';
import UsernameInput from './components/UsernameInput';
import EmailInput from './components/EmailInput';

// function imports
import { get_item_local_storage, set_item_local_storage } from '../../helper_functions/local_storage';
import { get_current_date } from "../../helper_functions/time";
import { v4 as uuid } from 'uuid';

// email js import for code verification
import emailjs from "emailjs-com";

import Axios from "axios";
import { create_user } from '../../rest_api_requests/UserRequests';
import { VALID_USER_CONTEXT } from '../../App';

const SERVICE_ID = "Breaddit_Service_69420"
const TEMPLATE_ID = "template_9wj4cqc"
const PUBLIC_KEY = "VHjgLz-ZTg3h0Y_xh" // aka User ID

// verification code for authentication.
const generate_random_code = () => {
	return Math.floor(100000 + Math.random() * 900000)
}

function SignUp() {

	const { initialise_curr_user } = useContext(VALID_USER_CONTEXT);

	const navigate = useNavigate();

	const [signed_up, set_signed_up] = useState(false);

	const [email_info, set_email_info] = useState({ email: "", valid: false });
	const [username_info, set_username_info] = useState({ username: "", valid: false });
	const [password_info, set_password_info] = useState({ password: "", valid: false });

	const [initial_verification_code, set_initial_verification_code] = useState(generate_random_code())

	const [verification_code, set_verification_code] = useState(""); 	// what the user types in here






	const submit_sign_up_2 = async () => {
		// this version uses axios requests

		// checking if all signup fields are valid
		for(const sign_up_input of [email_info, username_info, password_info]) {
			if (sign_up_input.valid === false) {
				return
			}
		}

		// verify verification_code here
		if (verification_code !== initial_verification_code.toString()) {
			return
		}


		// creating the user in the db
		const response = await create_user(email_info.email, username_info.username, password_info.password)

		if (response.error) {
			console.log(response.error)
			return
		}
		
		initialise_curr_user({
			username: response.username,
			profile_pic: response.profile_pic,
			authenticated: true
		})

		// visual cue for sign up
		set_signed_up(true)




		// navigating to profile page after short delay
		setTimeout(() => navigate("/profile"), 1500)
	}



	const handle_submit_form = (e) => {
		// prevents default form submission actions
		e.preventDefault();

		// emailjs.sendForm('service_7y225ea', 'template_bwf9ien', e.target, 'Dem37imrKFPE7e_et')
		// 	.then((result) => {
        //   		console.log(result.text);
      	// 	}, (error) => {
        //   		console.log(error.text);
      	// 	});

		for(const sign_up_input of [email_info, username_info, password_info]) {
			if (sign_up_input.valid === false) {
				return
			}
		}
		// send an email out using emailjs that will based on the details entered by the user. 
		emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, e.target, PUBLIC_KEY)
		.then((result) => {
			console.log("MFA:", result.text);
		}, (error) => {
			console.log(error.text);
		});


	}





	return (
		<div className='Sign_Up_Page'>
			
			<h2>Sign Up</h2>

			<div className="sign_up_card">
				<form onSubmit={handle_submit_form}>

					<EmailInput set_email_info={set_email_info}/>

					<UsernameInput set_username_info={set_username_info}/>

					<PasswordInput 
						set_password_info={set_password_info}
						label_name="Password"
					/>

					<input 
						id="verification_code"
						type="text"
						name="verification_code"
						className="verification_code_input"
						hidden={true}
						value={initial_verification_code}
						onChange={((e) => {})}
					/>

					
					<input 
						type="submit" 
						value="Send Email Verification Code"
						className={(email_info.valid && username_info.valid && password_info.valid) ? "verify_btn_green" : "verify_btn_red"}
					/>
					<div className="verfication_error">
						{
							(email_info.valid && username_info.valid && password_info.valid) 
							?
							""
							:
							"Please ensure all sign up fields are valid!"
						}
					</div>

				</form>

				{/* <input 
					type="submit" 
					value={signed_up ? "...Signing Up" : "Sign Up"}
					className="submit_btn"
				/> */}

				<input 
					className="verify_input"
					type="text"
					placeholder='enter your verification code'
					onChange={(e) => set_verification_code(e.target.value)}
				/>

				{/* <button onClick={submit_sign_up} className="submit_btn">
					{signed_up ? "...Signing Up" : "Sign Up"}
				</button> */}

				<button onClick={submit_sign_up_2} className="submit_btn">
					{signed_up ? "...Signing Up" : "Sign Up"}
				</button>
				

			</div>


		</div>
	)
}

export default SignUp