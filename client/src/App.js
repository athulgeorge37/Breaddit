// styles
import "./App.scss";

// contexts
import NotificationProvider from "./context/Notifications/NotificationProvider";
import CurrentUserProvider from "./context/CurrentUser/CurrentUserProvider";
import DarkModeProvider from "./context/DarkMode/DarkModeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// components
import Navbar from "./page_layout/Navbar";
import Footer from "./page_layout/Footer";

// ui
import Loading from "./components/ui/Loading";

// routers
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// helper
import { lazy, Suspense } from "react";

// page imports, via lazy loading
const HomePage = lazy(() => import("./pages/HomePage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const ProfilePageV2 = lazy(() => import("./pages/ProfilePageV2"));
const PostsByUser = lazy(() => import("./features/post/PostsByUser"));
const ProfileDetails = lazy(() => import("./features/profile/ProfileDetails"));
const EditProfileV2 = lazy(() => import("./features/profile/EditProfileV2"));
const PostsPage = lazy(() => import("./pages/PostsPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const CreateThreadPage = lazy(() => import("./pages/CreateThreadPage"));
const CreatePostPage = lazy(() => import("./pages/CreatePostPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const Summary = lazy(() => import("./features/admin/Summary"));
const AllUsers = lazy(() => import("./features/admin/AllUsers"));
const UserOverview = lazy(() => import("./features/admin/UserOverview"));

function App() {
    const client = new QueryClient();

    return (
        <div className="App">
            <DarkModeProvider>
                <QueryClientProvider client={client}>
                    <ReactQueryDevtools />
                    <Router>
                        <CurrentUserProvider>
                            <NotificationProvider>
                                <div className="app_content">
                                    <div className="nav_bar_and_body">
                                        <Navbar />

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
                                                        path="/edit_profile"
                                                        element={
                                                            <EditProfileV2 />
                                                        }
                                                    />
                                                    <Route
                                                        path="/user/:username_route"
                                                        element={
                                                            <ProfilePageV2 />
                                                        }
                                                    >
                                                        <Route
                                                            path="profile"
                                                            element={
                                                                <ProfileDetails />
                                                            }
                                                        />
                                                        <Route
                                                            path="posts"
                                                            element={
                                                                <PostsByUser />
                                                            }
                                                        />
                                                        <Route
                                                            path="*"
                                                            element={
                                                                <p>
                                                                    Page does
                                                                    not exist
                                                                </p>
                                                            }
                                                        />
                                                    </Route>
                                                    <Route
                                                        path="/create_thread"
                                                        element={
                                                            <CreateThreadPage />
                                                        }
                                                    />
                                                    <Route
                                                        path="/create_post"
                                                        element={
                                                            <CreatePostPage />
                                                        }
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
                                                            element={
                                                                <Summary />
                                                            }
                                                        />
                                                        <Route
                                                            path="all_users"
                                                            element={
                                                                <AllUsers />
                                                            }
                                                        />
                                                        <Route
                                                            path="user_overview/:user_id"
                                                            element={
                                                                <UserOverview />
                                                            }
                                                        />
                                                    </Route>
                                                    <Route
                                                        path="*"
                                                        element={<ErrorPage />}
                                                    />
                                                </Routes>
                                            </Suspense>
                                        </div>
                                    </div>
                                    <Footer />
                                </div>
                            </NotificationProvider>
                        </CurrentUserProvider>
                    </Router>
                </QueryClientProvider>
            </DarkModeProvider>
        </div>
    );
}

export default App;
