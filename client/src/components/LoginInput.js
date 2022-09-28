import { useState, useRef } from 'react';
import './LoginInput.scss';

function LoginInput(props) {

	const input_ref = useRef(null);
	const [show_password, set_show_password] = useState(false);

	return (
		<div className="login_input">
			<label htmlFor={props.htmlFor}>
				{ props.label_name ? props.label_name : props.input_type.charAt(0).toUpperCase() + props.input_type.slice(1)}:
			</label>

			{	
				props.input_type === "password"
				?
				<div className="password_input">
					<input 
						id="password"
						type={show_password ? "text" : "password"}
						onChange={(e) => props.update_on_change(e.target.value)} 
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
				:
				<input 
					autoFocus={props.autoFocus ? true : false}
					type={props.input_type}
					id={props.htmlFor} 
					value={props.value}
					onChange={(e) => props.update_on_change(e.target.value)}
				/>
			}
			
			{
				props.boolean_check === false 
				&& 
				<div className="error_msg">
					{props.children}
				</div>
			}
			
		</div>
	)
}

export default LoginInput