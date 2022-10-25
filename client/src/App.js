import "./App.scss";

// routing imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// common components on every page
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// page imports
import Home from "./pages/Home";
import SignUp from "./pages/sign_up_page/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Posts from "./pages/Posts";
import AdminPage from "./pages/AdminPage/AdminPage";
import Error from "./pages/Error";
import Summary from "./pages/AdminPage/Summary";
import AllUsers from "./pages/AdminPage/AllUsers";
import UserOverview from "./pages/AdminPage/UserOverview";

// Context Provider imports
import NotificationProvider from "./Contexts/Notifications/NotificationProvider";
import CurrentUserProvider from "./Contexts/CurrentUser/CurrentUserProvider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
    const client = new QueryClient();

    return (
        <div className="App">
            <QueryClientProvider client={client}>
                <Router>
                    <CurrentUserProvider>
                        <Navbar />

                        <NotificationProvider>
                            <div className="main_body">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route
                                        path="/signup"
                                        element={<SignUp />}
                                    />
                                    <Route
                                        path="/signin"
                                        element={<SignIn />}
                                    />
                                    <Route
                                        path="/profile/:username_route"
                                        element={<Profile />}
                                    />
                                    <Route path="/posts" element={<Posts />} />
                                    <Route
                                        path="/admin_dashboard"
                                        element={<AdminPage />}
                                    >
                                        <Route
                                            path="summary"
                                            element={<Summary />}
                                        />
                                        <Route
                                            path="all_users"
                                            element={<AllUsers />}
                                        />
                                        <Route
                                            path="user_overview/:user_id"
                                            element={<UserOverview />}
                                        />
                                    </Route>
                                    <Route path="*" element={<Error />} />
                                </Routes>
                            </div>
                        </NotificationProvider>

                        <Footer />
                    </CurrentUserProvider>
                </Router>
            </QueryClientProvider>
        </div>
    );
}

export default App;
