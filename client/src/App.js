// styling imports
import "./App.scss";

// Context Provider imports
import NotificationProvider from "./context/Notifications/NotificationProvider";
import CurrentUserProvider from "./context/CurrentUser/CurrentUserProvider";

// react query import
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
const HomePage = lazy(() => import("./pages/HomePage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PostsPage = lazy(() => import("./pages/PostsPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const Summary = lazy(() => import("./features/admin/Summary"));
const AllUsers = lazy(() => import("./features/admin/AllUsers"));
const UserOverview = lazy(() => import("./features/admin/UserOverview"));

function App() {
    const client = new QueryClient();

    return (
        <div className="App">
            <QueryClientProvider client={client}>
                <ReactQueryDevtools />
                <Router>
                    <CurrentUserProvider>
                        <Navbar />

                        <NotificationProvider>
                            <div className="main_body">
                                <Suspense fallback={<Loading />}>
                                    <Routes>
                                        <Route
                                            path="/"
                                            element={<HomePage />}
                                        />
                                        <Route
                                            path="/signup"
                                            element={<SignUpPage />}
                                        />
                                        <Route
                                            path="/signin"
                                            element={<SignInPage />}
                                        />
                                        <Route
                                            path="/profile/:username_route"
                                            element={<ProfilePage />}
                                        />
                                        <Route
                                            path="/posts"
                                            element={<PostsPage />}
                                        />
                                        <Route
                                            path="/post/:post_id_route"
                                            element={<PostPage />}
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
                                        <Route
                                            path="*"
                                            element={<ErrorPage />}
                                        />
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
