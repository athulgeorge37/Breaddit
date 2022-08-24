import React from 'react';
import './LoginInput.scss';

function LoginInput(props) {
	return (
		<div className="login_input">
			<label htmlFor={props.htmlFor}>
				{ props.label_name ? props.label_name : props.input_type.charAt(0).toUpperCase() + props.input_type.slice(1)}:
			</label>

			<input 
				autoFocus={props.autoFocus ? true : false}
				type={props.input_type}
				id={props.htmlFor} 
				value={props.value}
				onChange={(e) => props.update_on_change(e.target.value)}
			/>
			
			<div className="error_msg">
				{props.boolean_check ? "" : props.children}
			</div>
		</div>
	)
}

export default LoginInput