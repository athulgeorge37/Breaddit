import { gql } from "@apollo/client";

export const GET_ALL_USER_DATA = gql`
    query GetAll($limit: Int!, $offset: Int!) {
        get_users(limit: $limit, offset: $offset) {
            id
            role
            username
            email
            profile_pic
            createdAt
            is_banned
        }
    }
`;

export const UPDATE_BAN_STATUS = gql`
    mutation change_ban($user_id: ID!, $new_ban_status: Boolean!) {
        update_ban_status(id: $user_id, new_ban_status: $new_ban_status)
    }
`;

export const GET_USER_DATA = gql`
    query getUserData($user_id: ID!) {
        get_user_info(id: $user_id) {
            username
            profile_pic
            email
            bio
            createdAt
            is_banned
        }
        get_follower_count(id: $user_id)
        get_following_count(id: $user_id)
        get_number_of_user_posts(id: $user_id)
        get_profile_visitors_count(id: $user_id)
        check_is_online(id: $user_id)
    }
`;
