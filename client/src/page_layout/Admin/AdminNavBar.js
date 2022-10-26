import React from 'react';
import { NavLink } from 'react-router-dom';

import './AdminNavBar.scss';

function AdminNavBar() {

    const determine_active_page = ({isActive}) => {
		return "page_link " + (isActive ? "active" : "")
	}

    return (
        <div className="NavBarLinks">
            <div className='links'>
                <NavLink 
                    to="/admin_dashboard/summary" 
                    className={determine_active_page}
                >
                    Summary
                </NavLink>

                <NavLink 
                    to="/admin_dashboard/all_users" 
                    className={determine_active_page}
                >
                    All Users
                </NavLink>
                
            </div>
        </div>
    )
}

export default AdminNavBar