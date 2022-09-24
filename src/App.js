import './App.scss';

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import { useState, createContext } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// page imports
import Home from './pages/Home';
import SignUp from './pages/sign_up_page/SignUp';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import Error from './pages/Error';


// exporting so we can acces this context in useEditPost file
export const ALL_POSTS_CONTEXT = createContext();

function App() {

	// all_posts is passed to PostContent component to render
    // all of them with the appropriate data
    const [all_posts, set_all_posts] = useState([]);


	return (
		<div className="App">
			<Router>

				<div className="navbar_and_main_body">

					<Navbar/>

					<ALL_POSTS_CONTEXT.Provider value={{all_posts, set_all_posts}}>
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
					</ALL_POSTS_CONTEXT.Provider>

				</div>

				<Footer/>

			</Router>
		</div>
	);
}

export default App;
