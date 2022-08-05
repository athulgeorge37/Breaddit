import { useState } from 'react';
import './App.scss';

// component imports
import Navbar from './components/Navbar';
import Home from './components/Home';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Profile from './components/Profile';
import Posts from './components/Posts';


const AVAILABLE_PAGES = ["Home", "Sign Up", "Sign In", "Profile", "Posts"]
const PAGE_RELATED_COMPONENTS = [<Home/>, <SignUp/>, <SignIn/>, <Profile/>, <Posts/>]

function App() {

	const [curr_page, set_curr_page] = useState("Home");

	const body_page = () => {
		// returns the respective component based
		// on the currently active curr_page state

		for (let n=0; n < AVAILABLE_PAGES.length; n++) {
			if (curr_page === AVAILABLE_PAGES[n]) {
				return PAGE_RELATED_COMPONENTS[n]
			}
		}
		
	}

	return (
		<div className="App">

			<Navbar 
				curr_page={curr_page}
				set_curr_page={set_curr_page} 
				available_pages={AVAILABLE_PAGES}
			/>

			<section className="main_body">
				{body_page()}
			</section>

			<footer>
				Footer
			</footer>

		</div>
	);
}

export default App;
