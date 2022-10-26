import { gql } from "@apollo/client";

export const GET_ALL_FOLLOWING_DATA = gql`
    query GetFollowing($user_id: ID!, $limit: Int!, $offset: Int!) {
        get_user_info(id: $user_id) {
            username
            Following(id: $user_id, limit: $limit, offset: $offset) {
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

export const GET_FOLLOWING_DATE_DATA = gql`
    query getFollowingDateData($dates: [Date!]!, $user_id: ID!) {
        get_total_following_before_date(dates: $dates, id: $user_id)
    }
`;
