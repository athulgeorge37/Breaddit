import "./PaginatedTableRow.scss";
import ProfilePicture from "../../components/ProfilePicture";
import { get_current_date } from "../../helper_functions/time";

import { useQuery } from "@apollo/client";
import { GET_PROFILE_STATS } from '../../GraphQL/Queries';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const TABLE_HEADERS = [
    "Picture", "Role", "Username", "Email", 
    "Date Joined", "Ban Status", "Followers", 
    "Following", "No of Posts", "Is Online"
]

function PaginatedTableRow({ user_data }) {

    const navigate = useNavigate();

    const [profile_stats, set_profile_stats] = useState({
        follower_count: 0,
        following_count: 0,
        no_of_posts: 0,
        is_banned: user_data.is_banned,
        is_online: false
    })

    const { error, loading, data } = useQuery(GET_PROFILE_STATS, {
        variables: {
            user_id: user_data.id
        }
    });  




    useEffect(() => {

        if (data) {
            // console.log(data)
            set_profile_stats({
                ...profile_stats,
                follower_count: data.get_follower_count,
                following_count: data.get_following_count,
                no_of_posts: data.get_number_of_user_posts,
                is_online: data.check_is_online
            })
        }

    }, [data])





    return (
        <tr 
            className='PaginatedTableRow' 
            onClick={() => {
                navigate(`/admin_dashboard/user_overview/${user_data.id}`, data)
            }}
        >
            <td className="profile_pic item">
                <ProfilePicture
                    username={user_data.username}
                    profile_picture_url={user_data.profile_pic}
                />
            </td>
            <td className="role item">
                {user_data.role}
            </td>
            <td className="username item">
                {user_data.username}
            </td>
            <td className="email item">
                {user_data.email}
            </td>
            <td className="date_joined item">
                {get_current_date(user_data.createdAt)}
            </td>
            <td className="is_banned item">
                <button 
                    className={(profile_stats.is_banned ? "banned" : "")}
                >
                    {profile_stats.is_banned ? "Banned" : "Permitted"}
                </button>
            </td>
            <td className="follower item">
                {profile_stats.follower_count}
            </td>
            <td className="following item">
                {profile_stats.following_count}
            </td>
            <td className="no_of_posts item">
                {profile_stats.no_of_posts}
            </td>
            <td className={`is_online item ${profile_stats.is_online ? "active" : ""}`}>
                {profile_stats.is_online ? "online" : "offline"}
            </td>
        

        </tr>
    )
}

export default PaginatedTableRow