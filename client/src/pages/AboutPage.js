import "./AboutPage.scss";
import { useNavigate } from "react-router-dom";

function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className="AboutPage">
            <h2>About Page</h2>
            <p>Stop slacking and finish making this page boii</p>
            <div>
                <button onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
        </div>
    );
}

export default AboutPage;
