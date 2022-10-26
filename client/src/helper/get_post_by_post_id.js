import { get_item_local_storage } from "./local_storage"

export const get_post_by_post_id = (my_post_id) => {

    // to get a specific detail, here is an example

    // get_user_details(post_details.post_author).username

    const all_posts = get_item_local_storage("Available_Posts")

    for (const post of all_posts) {
        if (post.post_id === my_post_id) {
            return post
        }
    }

    return {
        post_author: "unknown",
        post_id: "unknown",
        post_title: "unknown",
        post_text: "unknown",
        post_date_time: new Date().getTime(),
        post_up_votes: 0,
        post_down_votes: 0,
        post_comments: [],
        edited: false
    }
}