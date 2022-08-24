import React from 'react';
import './Navbar.scss';

import { NavLink } from 'react-router-dom';

function Navbar() {

	const determine_active_page = ({isActive}) => {
		return "page_link " + (isActive ? "active" : "")
	}

	return (
		<nav>
			<div className='logo'>Logo</div>

			<div className="links">
				<NavLink 
					to="/" 
					className={determine_active_page}
				>
					Home
				</NavLink>

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

				<NavLink 
					to="/profile" 
					className={determine_active_page}
				>
					Profile
				</NavLink>

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