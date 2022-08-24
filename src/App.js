import './App.scss';

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// page imports
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import Error from './pages/Error';


function App() {
	return (
		<div className="App">
			<Router>

				<div className="navbar_and_main_body">

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

				</div>

				<Footer/>

			</Router>
		</div>
	);
}

export default App;
