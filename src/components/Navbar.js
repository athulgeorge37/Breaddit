import React from 'react';
import './Navbar.scss';

function Navbar({ curr_page, set_curr_page, available_pages }) {
	return (
		<nav>
			<div className='logo'>Logo</div>

			<div className="links">
				{available_pages.map((page) => {
					return (
						<div 
							key={page}
							onClick={() => set_curr_page(page)}
							className={"page_link " + (page === curr_page ? "active" : "")}
						>
							{page}
						</div>
					)
				})}
			</div>

		</nav>
	)
}

export default Navbar