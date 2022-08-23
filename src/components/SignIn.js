import React, { useState } from 'react';
import LoginInput from './LoginInput';
import './SignIn.scss';

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  var signup_details = JSON.parse(window.localStorage.getItem("Login_Details"));


  const [valid_signup_details, set_valid_signup_details] = useState(
    {
      email_validity: true,
      password_validity: true
    }
  );
  
  const [sign_in_btn, set_sign_in_btn] = useState("Sign In");

  const submitSignIn = (e) => {
    e.preventDefault();

    // let signup_mail = localStorage.getItem(("Login_Details").email)

    let all_field_entered = true
		for (const field of [email, password]) {
			if (field === "") {
				all_field_entered = false
			}
		}

    
    if (all_field_entered){

      let valid_email = true
      if (email !== signup_details.email) {
        valid_email = false
      }
    
      let valid_password = true
      if (password !== signup_details.password) {
        valid_password = false
      }

      set_valid_signup_details({
        email_validity: valid_email,
        password_validity: valid_password
      })


      if (valid_email && valid_password){
        set_sign_in_btn("Signing In...")
      }
    }

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
          The email address you entered isn't connected to an account.
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
    </div>
  )
}

export default SignIn