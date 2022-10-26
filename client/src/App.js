// styling imports
import "./App.scss";

// Context Provider imports
import NotificationProvider from "./Contexts/Notifications/NotificationProvider";
import CurrentUserProvider from "./Contexts/CurrentUser/CurrentUserProvider";

// react query import
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// common components on every page
import Navbar from "./page_layout/Navbar";
import Footer from "./page_layout/Footer";

// loading import, will be displayed while lazy loading a page
import Loading from "./components/ui/Loading";

// routing imports
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// lazy loading imports
import { lazy, Suspense } from "react";

// page imports, via lazy loading
const Home = lazy(() => import("./pages/Home"));
const SignUp = lazy(() => import("./pages/SignUp"));
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
