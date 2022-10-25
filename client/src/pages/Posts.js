import { useEffect, useState } from "react";
import "./Posts.scss";

import CreatePost from "../components/CreatePost";
import PostContent from "../components/PostContent";
import Loading from "../components/Loading";

import { get_all_posts } from "../rest_api_requests/PostRequests";
import { useCurrentUser } from "../Contexts/CurrentUser/CurrentUserProvider";

const POSTS_PER_PAGE = 2;

function Posts() {
    const { current_user } = useCurrentUser();

    const [all_posts2, set_all_posts2] = useState([]);
    const [curr_page_count, set_curr_page_count] = useState(1);
    const [loading_new_posts, set_loading_new_posts] = useState(true);
    const [reached_end_of_list, set_reached_end_of_list] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", handle_scroll);

        return () => window.removeEventListener("scroll", handle_scroll);
    }, []);

    useEffect(() => {
        initialise_all_posts().then(() => {
            set_loading_new_posts(false);
        });
    }, []);

    useEffect(() => {
        set_loading_new_posts(true);

        // console.table({
        //     curr_page_count: curr_page_count,
        //     msg: `getting more ${POSTS_PER_PAGE} more posts`
        // })

        get_more_posts().then((response) => {});
    }, [curr_page_count]);

    const initialise_all_posts = async () => {
        // called on initial Post Page load
        const response = await get_all_posts(POSTS_PER_PAGE, 0);

        if (response.error) {
            console.log(response);
            return;
        }
        set_all_posts2(response.all_posts);
        set_loading_new_posts(false);
        //console.log(response.msg)
    };

    const get_more_posts = async () => {
        // called on initial Post Page load
        // we check if there are any posts in local storage and set it to that
        // otherwise just a list
        const limit = POSTS_PER_PAGE;
        const offset = curr_page_count * limit;
        // console.log("offset", offset, "limit", limit)
        const response = await get_all_posts(limit, offset);

        if (response.error) {
            console.log(response);
            return;
        }

        if (response.all_posts.length === 0) {
            set_reached_end_of_list(true);
        } else {
            set_all_posts2((prev_posts) => [
                ...prev_posts,
                ...response.all_posts,
            ]);
        }
        //console.log(response.msg)
    };

    const handle_scroll = () => {
        const window_height = window.innerHeight;
        const scrollable_height = document.documentElement.scrollHeight;
        const scroll_height_from_top = document.documentElement.scrollTop;

        if (window_height + scroll_height_from_top + 1 >= scrollable_height) {
            if (reached_end_of_list) {
                return;
            }
            set_curr_page_count((prev_page_count) => prev_page_count + 1);
        }
    };

    const add_post_to_list = (new_post_details) => {
        // when adding new_post_details, ensure that
        // it has all the post details including updatedAt and
        // author_details = { username, profile_pic }

        set_all_posts2([...all_posts2, new_post_details]);
    };

    const remove_post_from_list = (post_to_remove_id) => {
        const new_post_list = all_posts2.filter((my_post) => {
            return my_post.id !== post_to_remove_id;
        });

        set_all_posts2(new_post_list);
    };

    return (
        <div className="Posts_Page">
            {current_user.role !== "admin" && (
                <CreatePost add_post_to_list={add_post_to_list} />
            )}

            {all_posts2.length === 0 ? (
                <div className="no_posts">
                    There are no posts in this thread. Be the first to Post!
                </div>
            ) : (
                <div className="All_Posts">
                    {all_posts2.map((post_details) => {
                        return (
                            <PostContent
                                key={post_details.id}
                                post_details={post_details}
                                remove_post_from_list={remove_post_from_list}
                            />
                        );
                    })}
                </div>
            )}

            {reached_end_of_list ? (
                <div>There are no more posts</div>
            ) : (
                <>{loading_new_posts && <Loading />}</>
            )}
        </div>
    );
}

export default Posts;
