// // style import
// import "./ReadProfile.scss";

// // hook imports
// import { useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// // component imports
// import FollowerCard from "../follower/FollowerCard";
// import Post from "../post/Post";
// import ProfilePicture from "../profile/profile_picture/ProfilePicture";
// import Loading from "../../components/ui/Loading";

// // rest api requests imports
// import {
//     get_all_posts_by_username,
//     get_all_posts_by_curr_user,
// } from "../../api/PostRequests";
// import { get_current_date } from "../../helper/time";
// import {
//     get_accounts_of_type_by_username,
//     get_count_of_type_by_username,
//     check_is_following_username,
//     follow_account,
//     unfollow_account,
// } from "../../api/FollowerRequests";

// // rest api requert imports
// import {
//     get_user_details,
//     get_user_profile_details,
//     sign_out,
// } from "../../api/UserRequests";

// import DOMPurify from "dompurify";
// import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

// function ReadProfile({ set_toggle_edit_page }) {
//     const navigate = useNavigate();
//     const { username_route } = useParams();
//     const { current_user, remove_current_user } = useCurrentUser();

//     const [is_signing_out, set_is_signing_out] = useState(false);
//     const [is_following_user, set_is_following_user] = useState(false);

//     const [all_user_posts, set_all_user_posts] = useState([]);
//     const [is_loading, set_is_loading] = useState(true);

//     const [user_profile_details, set_user_profile_details] = useState({
//         email: "unknown",
//         username: "unknown",
//         profile_pic: null,
//         createdAt: "2000-01-01T01:01:01.000Z",
//         bio: null,
//     });

//     const [followers, set_followers] = useState({
//         count: 0,
//         data: [],
//         show_data: false,
//     });

//     const [following, set_following] = useState({
//         count: 0,
//         data: [],
//         show_data: false,
//     });

//     const initialise_profile_data = async (is_cancelled) => {
//         if (is_cancelled === true) {
//             console.log("canceling profile data request");
//             return;
//         }

//         set_is_loading(true);
//         // console.log("initialising profile data")

//         const initialised_user_details = await initialise_user_details();
//         // console.log("user_profile_details.username ===", user_profile_details.username)

//         const initialised_counts = await initialise_counts();
//         // console.log({
//         //     followers: followers.count,
//         //     following: following.count
//         // })

//         let initialised_is_following;
//         // console.log("username_route", username_route)
//         // console.log("current_user.username", current_user.username)
//         if (username_route === current_user.username) {
//             // console.log("not fetching is_following_user, cus we are logged in")
//             initialised_is_following = true;
//             // need to make true so we do fetch user posts below
//         } else {
//             initialised_is_following = await initialise_is_following_user();
//         }

//         // console.log("initialised_user_details", initialised_user_details)
//         set_user_profile_details(initialised_user_details);

//         // console.log("initialised_counts", initialised_counts)
//         set_followers({
//             ...followers,
//             count: initialised_counts.follower_count,
//         });
//         set_following({
//             ...following,
//             count: initialised_counts.following_count,
//         });

//         // console.log("initialised_is_following", initialised_is_following)
//         set_is_following_user(initialised_is_following);

//         if (initialised_is_following === true) {
//             const initialised_user_posts = await initialise_user_posts();
//             set_all_user_posts(initialised_user_posts);
//         }

//         set_is_loading(false);
//     };

//     const initialise_user_details = async () => {
//         let response;
//         // console.log("username_route", username_route)
//         // console.log("current_user.username", current_user.username)
//         if (username_route === current_user.username) {
//             response = await get_user_details();
//             // this response includes the user email, so they can change it
//         } else {
//             response = await get_user_profile_details(username_route);
//             // this response does not include the user email, only profile details
//         }

//         if (response.error) {
//             console.log(response);
//             return;
//         }

//         // set_user_profile_details(response.user_details)
//         return response.user_details;
//     };

//     const initialise_user_posts = async () => {
//         // no need to fetch if we are not following the user
//         // if (is_following_user === false) {
//         //     // keeping all_user_posts as []
//         //     console.log("not fetching user posts")
//         //     return
//         // }

//         // console.log("fetching user posts")
//         let response;
//         if (username_route === current_user.username) {
//             response = await get_all_posts_by_curr_user(username_route);
//         } else {
//             response = await get_all_posts_by_username(username_route);
//         }

//         if (response.error) {
//             console.log(response);
//             return;
//         }

//         // set_all_user_posts(response.all_posts)
//         return response.all_posts;
//     };

//     const initialise_is_following_user = async () => {
//         const response = await check_is_following_username(username_route);

//         if (response.error) {
//             console.log(response);
//             return false;
//         }

//         // set_is_following_user(response.is_following)
//         return response.is_following;
//     };

//     const handle_follow_btn = async () => {
//         let new_is_following_user;
//         let response;
//         if (is_following_user === true) {
//             // trying to unfollow a user
//             // console.log("unfollowing account")
//             response = await unfollow_account(user_profile_details.username);
//             new_is_following_user = false;
//         } else {
//             // trying to follow a user
//             response = await follow_account(user_profile_details.username);
//             new_is_following_user = true;
//         }

//         console.log(response);
//         if (response.error) {
//             return;
//         }

//         set_is_following_user(new_is_following_user);
//     };

//     const initialise_counts = async () => {
//         // if (user_profile_details.username === "unknown") {
//         //     console.log("username is unknown")
//         //     return
//         // }

//         const follower_response = await get_count_of_type_by_username(
//             "follower",
//             username_route
//         );

//         if (follower_response.error) {
//             console.log("follower_response", follower_response);
//             return;
//         }

//         const following_response = await get_count_of_type_by_username(
//             "following",
//             username_route
//         );

//         if (following_response.error) {
//             console.log("following_response", following_response);
//             return;
//         }

//         // set_followers({
//         //     ...followers,
//         //     count: follower_response.count
//         // })

//         // set_following({
//         //     ...following,
//         //     count: following_response.count
//         // })

//         return {
//             follower_count: follower_response.count,
//             following_count: following_response.count,
//         };
//     };

//     const get_all_follower_data = async () => {
//         // only calling rest api request when data array is empty
//         // if (followers.data.length > 0) {
//         //     set_followers({
//         //         ...followers,
//         //         show_data: true,
//         //     })
//         //     return
//         // }

//         const response = await get_accounts_of_type_by_username(
//             "follower",
//             user_profile_details.username
//         );
//         // console.log(response)
//         if (response.error) {
//             console.log(response);
//             return;
//         }

//         set_followers({
//             ...followers,
//             show_data: true,
//             data: response.all_accounts,
//         });
//     };

//     const get_all_following_data = async () => {
//         // only calling rest api request when data array is empty
//         // if (following.data.length > 0) {
//         //     set_following({
//         //         ...following,
//         //         show_data: true,
//         //     })
//         //     return
//         // }

//         const response = await get_accounts_of_type_by_username(
//             "following",
//             user_profile_details.username
//         );
//         // (response)
//         if (response.error) {
//             console.log(response);
//             return;
//         }

//         set_following({
//             ...following,
//             show_data: true,
//             data: response.all_accounts,
//         });
//     };

//     const handle_set_follower_card = async (type_to_set) => {
//         // where type_to_set is the type of follower / following card we want to set

//         if (type_to_set === "follower") {
//             await get_all_follower_data();
//             set_following({
//                 ...following,
//                 show_data: false,
//             });
//         } else if (type_to_set === "following") {
//             await get_all_following_data();
//             set_followers({
//                 ...followers,
//                 show_data: false,
//             });
//         }
//     };

//     const handle_sign_out = async () => {
//         const sign_out_response = await sign_out();
//         console.log(sign_out_response);
//         if (sign_out_response.error) {
//             return;
//         }

//         set_is_signing_out(true);
//         setTimeout(() => {
//             navigate("/signin");

//             // removing web token from localstorage and
//             // updating current_user in App.js,
//             // to remove users access to certain pages
//             remove_current_user();
//         }, 1000);
//     };

//     const remove_post_from_list = (post_to_remove_id) => {
//         const new_post_list = all_user_posts.filter((my_post) => {
//             return my_post.id !== post_to_remove_id;
//         });

//         set_all_user_posts(new_post_list);
//     };

//     // const initialise_data = useCallback(async () => {

//     //     set_is_loading(true)

//     //     console.log("initialising profile data")

//     //     await initialise_user_details()
//     //     console.log("user_profile_details.username ===", user_profile_details.username)

//     //     await initialise_counts()
//     //     console.log({
//     //         followers: followers.count,
//     //         following: following.count
//     //     })

//     //     await initialise_is_following_user()

//     //     await initialise_user_posts()

//     //     set_is_loading(false)

//     // }, [username_route])

//     // useEffect(() => {

//     //     // initialise_profile_data()
//     //     initialise_data()

//     // }, [initialise_data])

//     useEffect(() => {
//         let is_cancelled = false;

//         initialise_profile_data(is_cancelled);

//         return () => {
//             is_cancelled = true;
//         };
//     }, [username_route]);

//     return (
//         <div className="ReadProfile">
//             {is_loading === true ? (
//                 <Loading />
//             ) : (
//                 <>
//                     <div className="follower_following_cards">
//                         {/* {
//                         followers.show_data
//                         ?
//                         <FollowerCard
//                             state_object={followers}
//                             set_state_object={set_followers}
//                             state_name={"Followers"}
//                             state_type={"follower"}
//                         />
//                         :
//                             <FollowerCard
//                             state_object={following}
//                             set_state_object={set_following}
//                             state_name={"Following"}
//                             state_type={"following"}
//                         />
//                     } */}

//                         {followers.show_data && (
//                             <FollowerCard
//                                 state_object={followers}
//                                 set_state_object={set_followers}
//                                 state_name={"Followers"}
//                                 state_type={"follower"}
//                             />
//                         )}

//                         {following.show_data && (
//                             <FollowerCard
//                                 state_object={following}
//                                 set_state_object={set_following}
//                                 state_name={"Following"}
//                                 state_type={"following"}
//                             />
//                         )}
//                     </div>

//                     <div className="profile_card_and_user_posts">
//                         <div className="read_only_profile_card">
//                             <div className="section_one">
//                                 <ProfilePicture
//                                     profile_picture_url={
//                                         user_profile_details.profile_pic
//                                     }
//                                     username={user_profile_details.username}
//                                 />

//                                 <div className="name_and_date_joined">
//                                     <div className="username">
//                                         {user_profile_details.username}
//                                     </div>
//                                     <div className="date_joined">
//                                         {get_current_date(
//                                             user_profile_details.createdAt
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="section_two">
//                                 <div className="profile_stats">
//                                     <div
//                                         className="followers count_and_text"
//                                         onClick={() =>
//                                             handle_set_follower_card("follower")
//                                         }
//                                     >
//                                         <div className="follower_count">
//                                             {followers.count}
//                                         </div>
//                                         <div className="follower_text">
//                                             Followers
//                                         </div>
//                                     </div>

//                                     <div
//                                         className="following count_and_text"
//                                         onClick={() =>
//                                             handle_set_follower_card(
//                                                 "following"
//                                             )
//                                         }
//                                     >
//                                         <div className="following_count">
//                                             {following.count}
//                                         </div>
//                                         <div className="following_text">
//                                             Following
//                                         </div>
//                                     </div>

//                                     <div className="bread_crumbs count_and_text">
//                                         <div className="bread_crumbs_count">
//                                             1000
//                                         </div>
//                                         <div className="bread_crumbs_text">
//                                             Points
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="about_me">
//                                     {user_profile_details.bio === null ? (
//                                         <>
//                                             {username_route ===
//                                                 current_user.username &&
//                                                 "Click Edit Profile to add your own bio"}
//                                         </>
//                                     ) : (
//                                         <div
//                                             className="bio"
//                                             dangerouslySetInnerHTML={{
//                                                 __html: DOMPurify.sanitize(
//                                                     user_profile_details.bio
//                                                 ),
//                                             }}
//                                         >
//                                             {/* {user_profile_details.bio} */}
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className="profile_btns">
//                                     {username_route ===
//                                     current_user.username ? (
//                                         <>
//                                             <button
//                                                 className="edit_profile"
//                                                 onClick={() =>
//                                                     set_toggle_edit_page(true)
//                                                 }
//                                             >
//                                                 Edit Profile
//                                             </button>

//                                             <button
//                                                 className="sign_out"
//                                                 onClick={handle_sign_out}
//                                             >
//                                                 {is_signing_out
//                                                     ? "...Signing Out"
//                                                     : "Sign Out"}
//                                             </button>
//                                         </>
//                                     ) : (
//                                         <button
//                                             className="follow_btn"
//                                             onClick={handle_follow_btn}
//                                         >
//                                             {is_following_user
//                                                 ? "Following"
//                                                 : "Follow"}
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="user_posts">
//                             {username_route === current_user.username ? (
//                                 <>
//                                     {all_user_posts.length === 0 ? (
//                                         <div className="no_posts">
//                                             You have not made any posts
//                                             <button
//                                                 onClick={() =>
//                                                     navigate("/posts")
//                                                 }
//                                             >
//                                                 Create Post
//                                             </button>
//                                         </div>
//                                     ) : (
//                                         <div className="All_Posts">
//                                             {all_user_posts.map(
//                                                 (post_details) => {
//                                                     return (
//                                                         <Post
//                                                             key={
//                                                                 post_details.id
//                                                             }
//                                                             post_details={
//                                                                 post_details
//                                                             }
//                                                             remove_post_from_list={
//                                                                 remove_post_from_list
//                                                             }
//                                                         />
//                                                     );
//                                                 }
//                                             )}
//                                         </div>
//                                     )}
//                                 </>
//                             ) : (
//                                 <>
//                                     {is_following_user === true ? (
//                                         <div className="All_Posts">
//                                             {all_user_posts.map(
//                                                 (post_details) => {
//                                                     return (
//                                                         <Post
//                                                             key={
//                                                                 post_details.id
//                                                             }
//                                                             post_details={
//                                                                 post_details
//                                                             }
//                                                             remove_post_from_list={
//                                                                 remove_post_from_list
//                                                             }
//                                                         />
//                                                     );
//                                                 }
//                                             )}
//                                         </div>
//                                     ) : (
//                                         <div className="not_following">
//                                             Follow {username_route} to see their
//                                             recent activity
//                                         </div>
//                                     )}
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// export default ReadProfile;
