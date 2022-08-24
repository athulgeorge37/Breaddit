import React from 'react';
import './Navbar.scss';

import { NavLink } from 'react-router-dom';

function Navbar() {

	const determine_active_page = (isActive) => {return "page_link " + (isActive ? "active" : "")}

	return (
		<nav>
			<div className='logo'>Logo</div>

			<div className="links">
				<NavLink 
					to="/" 
					className={({isActive}) => determine_active_page(isActive)}
				>
					Home
				</NavLink>

				<NavLink 
					to="/signup" 
					className={({isActive}) => determine_active_page(isActive)}
				>
					Sign Up
				</NavLink>

				<NavLink 
					to="/signin" 
					className={({isActive}) => determine_active_page(isActive)}
				>
					Sign In
				</NavLink>

				<NavLink 
					to="/profile" 
					className={({isActive}) => determine_active_page(isActive)}
				>
					Profile
				</NavLink>

				<NavLink 
					to="/posts" 
					className={({isActive}) => determine_active_page(isActive)}
				>
					Posts
				</NavLink>

			</div>
		</nav>
	)
}

export default Navbar