import "./PaginatedTableRowPosts.scss";
import { calculate_time_passed } from "../../helper_functions/time";

import { useQuery } from "@apollo/client";
import { GET_POST_DATA } from '../../GraphQL/Queries';
import { useState, useEffect } from "react";

export const TABLE_HEADERS = [
    "Title", "Time Since", "Edited", 
    "Up Votes", "Down Votes", "Total Comments",
    "Is Appropriate"
]

function PaginatedTableRowPosts({ post_details, set_curr_post }) {

    const [post_data, set_post_data] = useState({
        up_votes: 0,
        down_votes: 0,
        total_comments: 0
    })


    const { error, loading, data } = useQuery(GET_POST_DATA, {
        variables: {
            post_id: post_details.id
        }
    });  




    useEffect(() => {

        if (data) {
            // console.log(data)
            set_post_data({
                ...post_data,
                up_votes: data.get_total_up_votes_by_post_id,
                down_votes: data.get_total_down_votes_by_post_id,
                total_comments: data.get_total_comments_by_post_id
            })
        }

    }, [data])





    return (
        <tr 
            className='PaginatedTableRowPosts' 
            onClick={() => {
                set_curr_post(post_details, post_data)
            }}
        >
            <td className="title item">
                {post_details.title}
            </td>
            <td className="date_edited item">
                {calculate_time_passed(post_details.updatedAt)}
            </td>
            <td className="edited item">
                {post_details.edited ? "true" : "false"}
            </td>
            <td className="up_votes item">
               {post_data.up_votes}
            </td>
            <td className="down_votes item">
                {post_data.down_votes}
            </td>
           
            <td className="no_of_comments item">
                {post_data.total_comments}
            </td>
            <td className={`is_inappropriate_item item ${post_details.is_inappropriate ? "inappropriate" : ""}`}>
                {post_details.is_inappropriate ? "inappropriate" : "appropriate"}
            </td>
        </tr>
    )
}

export default PaginatedTableRowPosts