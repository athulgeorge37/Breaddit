import { gql } from "@apollo/client";

export const GET_ALL_FOLLOWER_DATA = gql`
    query GetFollowers($user_id: ID!, $limit: Int!, $offset: Int!) {
        get_user_info(id: $user_id) {
            username
            Followers(id: $user_id, limit: $limit, offset: $offset) {
                id
                role
                username
                email
                profile_pic
                createdAt
                is_banned
            }
        }
    }
`;

export const GET_FOLLOWER_DATE_DATA = gql`
    query getFollowerDateData($dates: [Date!]!, $user_id: ID!) {
        get_total_followers_before_date(dates: $dates, id: $user_id)
    }
`;
