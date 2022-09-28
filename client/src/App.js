import './App.scss';

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';


import Navbar from './components/Navbar';
import Footer from './components/Footer';

// page imports
import Home from './pages/Home';
import SignUp from './pages/sign_up_page/SignUp';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import Error from './pages/Error';


import { useState, useEffect, createContext } from 'react';
import { is_valid_web_token } from './rest_api_requests/UserRequests';

import { remove_item_local_storage } from './helper_functions/local_storage';

export const VALID_USER_CONTEXT = createContext();

const DEFAULT_CURR_USER_STATE = {
	username: "",
	profile_pic: null,
	authenticated: false
}

function App() {

	const [current_user, set_current_user] = useState(DEFAULT_CURR_USER_STATE);

	useEffect(() => {
		// checks if user is logged in based on the web token and
		// allows us to condtionnaly render UI
		// console.log("validating user...")
		initialise_curr_user()
	}, [])


	const remove_current_user = () => {
		remove_item_local_storage("web_access_token")
		set_current_user(DEFAULT_CURR_USER_STATE)
		console.log("curr user has been removed")
	}

	
	const initialise_curr_user = async () => {
		const response = await is_valid_web_token();

		if (response.error) {
			set_current_user(DEFAULT_CURR_USER_STATE)
			console.log("user is invalid")
		} else {
			set_current_user({
				username: response.username,
				profile_pic: response.profile_pic,
				authenticated: true
			})
			// console.log("user validated")
		}
	}

	const update_current_user = (new_username, new_profile_pic) => {
		set_current_user({
			...current_user,
			username: new_username,
			profile_pic: new_profile_pic
		})
	}


	return (
		<div className="App">
			<Router>

				<VALID_USER_CONTEXT.Provider value={{ current_user, remove_current_user, initialise_curr_user, update_current_user }}>

					<Navbar/>

					<div className="main_body">
						<Routes>
							<Route path="/" element={<Home/>}/>
							<Route path="/signup" element={<SignUp/>}/>
							<Route path="/signin" element={<SignIn/>}/>
							<Route path="/profile" element={<Profile/>}/>
							<Route path="/posts" element={<Posts/>}/>
							<Route path="*" element={<Error/>}/>
						</Routes>
					</div>

					<Footer/>

				</VALID_USER_CONTEXT.Provider>

			</Router>
		</div>
	);
}

export default App;
