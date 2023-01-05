import React from "react";
import { NavLink } from "react-router-dom";

import "./AdminNavBar.scss";

function AdminNavBar() {
    return (
        <div className="NavBarLinks">
            <div className="links">
                <NavLink to="/admin_dashboard/summary">Summary</NavLink>

                <NavLink to="/admin_dashboard/all_users">All Users</NavLink>
            </div>
        </div>
    );
}

export default AdminNavBar;
