

export const get_user_details = (my_user_id) => {

    // to get a specific detail, here is an example

    // get_user_details(post_details.post_author).username

    if (my_user_id === "current_user") {
        my_user_id = get_current_user_id()
    }
        
    const all_users = JSON.parse(localStorage.getItem("All_Users"))
    
    for (const user of all_users) {
        if (user.user_id === my_user_id) {
            return user
        }
    }

    return {
        date_joined: "unknown",
        email: "unknown",
        password: "unknown",
        user_id: "unknown",
        username: "unknown"
    }
}


export const get_current_user_id = () => {
    return JSON.parse(localStorage.getItem("Current_User"))
}