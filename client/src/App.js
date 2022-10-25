import "./App.scss";

import { lazy, Suspense } from "react";

// loading import
import Loading from "./components/Loading";

// routing imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Context Provider imports
import NotificationProvider from "./Contexts/Notifications/NotificationProvider";
import CurrentUserProvider from "./Contexts/CurrentUser/CurrentUserProvider";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// common components on every page
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// page imports, via lazy loading
const Home = lazy(() => import("./pages/Home"));
const SignUp = lazy(() => import("./pages/sign_up_page/SignUp"));
const SignIn = lazy(() => import("./pages/SignIn"));
const Profile = lazy(() => import("./pages/Profile"));
const Posts = lazy(() => import("./pages/Posts"));
const AdminPage = lazy(() => import("./pages/AdminPage/AdminPage"));
const Error = lazy(() => import("./pages/Error"));
const Summary = lazy(() => import("./pages/AdminPage/Summary"));
const AllUsers = lazy(() => import("./pages/AdminPage/AllUsers"));
const UserOverview = lazy(() => import("./pages/AdminPage/UserOverview"));

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
                                <Suspense fallback={<Loading />}>
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
                                        <Route
                                            path="/posts"
                                            element={<Posts />}
                                        />
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
                                </Suspense>
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
