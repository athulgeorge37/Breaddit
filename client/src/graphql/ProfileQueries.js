import { gql } from "@apollo/client";

export const GET_PROFILE_VISIT_DATE_DATA = gql`
    query getProfileVisitDateData($dates: [Date!]!, $user_id: ID!) {
        get_total_profile_visits_before_date(dates: $dates, id: $user_id)
    }
`;

export const GET_PROFILE_STATS = gql`
    query getProfileStats($user_id: ID!) {
        get_follower_count(id: $user_id)
        get_following_count(id: $user_id)
        get_number_of_user_posts(id: $user_id)
        check_is_online(id: $user_id)
    }
`;

export const GET_PROFILE_VISITORS = gql`
    query get_profile_visitors($user_id: ID!, $limit: Int!, $offset: Int!) {
        get_profile_visitors_by_user_id(
            user_id: $user_id
            limit: $limit
            offset: $offset
        ) {
            id
            username
            role
            profile_pic
            email
            createdAt
            is_banned
        }
    }
`;
