import React from 'react';
import './LoginInput.scss';

function LoginInput(props) {


	// to use LoginInput in your jsx, use this as a template

	// <LoginInput 
	// 	htmlFor="email" 
	// 	input_type="email" 
	// 	update_on_change={set_email} 		
	//  this is the field that updates the state that hold the email, not the validity
	// 	boolean_check={valid_login_details.email_validity}
	// >
	// 	Email must contain an "@" and "." characters
	// </LoginInput>

	return (
		<div className="login_input">
			<label htmlFor={props.htmlFor}>
				{ props.label_name ? props.label_name : props.input_type.charAt(0).toUpperCase() + props.input_type.slice(1)}:
			</label>

			<input 
				type={props.input_type}
				id={props.htmlFor} 
				value={props.input_fill}
				onChange={(e) => props.update_on_change(e.target.value)}
			/>
			
			<div className="error_msg">
				{props.boolean_check ? "" : props.children}
			</div>
		</div>
	)
}

export default LoginInput