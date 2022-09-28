import './Navbar.scss';

import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { VALID_USER_CONTEXT } from '../App';


function Navbar() {

	const { current_user } = useContext(VALID_USER_CONTEXT);

	const determine_active_page = ({isActive}) => {
		return "page_link " + (isActive ? "active" : "")
	}

	return (
		<nav>
			<div className='logo'>
				<img 
					src="./images/breaddit_logo.png" 
					alt="logo" 
					className="logo_img"
				/>
				Breaddit
			</div>

			<div className="links">
				<NavLink 
					to="/" 
					className={determine_active_page}
				>
					Home
				</NavLink>

				{
					current_user.authenticated
					?
					<NavLink 
						to="/profile" 
						className={determine_active_page}
					>
						Profile
					</NavLink>
					:
					<>
						<NavLink 
							to="/signup" 
							className={determine_active_page}
						>
							Sign Up
						</NavLink>

						<NavLink 
							to="/signin" 
							className={determine_active_page}
						>
							Sign In
						</NavLink>
					</>
				}
				
				

				<NavLink 
					to="/posts" 
					className={determine_active_page}
				>
					Posts
				</NavLink>

			</div>
		</nav>
	)
}

export default Navbar