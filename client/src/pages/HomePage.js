import React from "react";
import "./HomePage.scss";
import { useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="Home_Page">
            Home page
            <p>
                This website is a basic front end implementation of a reddit
                clone "Breaddit" that we created for the Further web programming
                assignment 1. This is the landing page with a basic intorduction
                of what this website is about and how it functions. The user can
                go to the sign in page and log in to the website to view, create
                or delete a post or to comment on a post. If the user does not
                have an account they will be sent to the sign up page to set up
                a profile where we incorparated a multi factor authentication
                feature to add extra security. Then there's the profile page
                which contains all the posts made by the logged in user and also
                allows the user to edit their details. The user can also delete
                their profile which would delete all the posts, comments and
                replies made by the user and also it will delete them from the
                system.
            </p>
            <div>
                <button onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
        </div>
    );
}

export default HomePage;
