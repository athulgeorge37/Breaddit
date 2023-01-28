// ui
import Loading from "../components/ui/Loading";

// routers
import { Routes, Route } from "react-router-dom";

// helper
import { lazy, Suspense } from "react";

// page imports, via lazy loading

const HomePage = lazy(() => import("../pages/HomePage"));

const SignUpPage = lazy(() => import("../pages/SignUpPage"));

const SignInPage = lazy(() => import("../pages/SignInPage"));

const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const ProfileDetails = lazy(() => import("../features/profile/ProfileDetails"));
const PostsByUser = lazy(() => import("../features/post/PostsByUser"));
const CommentsByUser = lazy(() => import("../features/comment/CommentsByUser"));

const EditProfilePage = lazy(() => import("../pages/EditProfilePage"));

const PostsPage = lazy(() => import("../pages/PostsPage"));

const PostPage = lazy(() => import("../pages/PostPage"));

const CreateThreadPage = lazy(() => import("../pages/CreateThreadPage"));

const CreatePostPage = lazy(() => import("../pages/CreatePostPage"));

const AdminPage = lazy(() => import("../pages/AdminPage"));
const Summary = lazy(() => import("../features/admin/Summary"));
const AllUsers = lazy(() => import("../features/admin/AllUsers"));
const UserOverview = lazy(() => import("../features/admin/UserOverview"));

const ErrorPage = lazy(() => import("../pages/ErrorPage"));

function AllRoutes() {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/edit_profile" element={<EditProfilePage />} />
                <Route path="/user/:username_route" element={<ProfilePage />}>
                    <Route path="profile" element={<ProfileDetails />} />
                    <Route path="posts" element={<PostsByUser />} />
                    <Route path="comments" element={<CommentsByUser />} />
                    <Route path="*" element={<p>Page does not exist</p>} />
                </Route>
                <Route path="/create_thread" element={<CreateThreadPage />} />
                <Route path="/create_post" element={<CreatePostPage />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/post/:post_id_route" element={<PostPage />} />
                <Route path="/admin_dashboard" element={<AdminPage />}>
                    <Route path="summary" element={<Summary />} />
                    <Route path="all_users" element={<AllUsers />} />
                    <Route
                        path="user_overview/:user_id"
                        element={<UserOverview />}
                    />
                </Route>
                <Route path="*" element={<ErrorPage />} />
            </Routes>
        </Suspense>
    );
}

export default AllRoutes;
