import React from "react";
import "./PostData.scss";
import PaginatedTableRowPosts, {
    TABLE_HEADERS,
} from "./PaginatedTableRowPosts";
import PaginatedTable from "./PaginatedTable";

import { useLazyQuery } from "@apollo/client";
import { POSTS_BY_USER } from "../../graphql/PostQueries";
import { GET_VOTE_DATE_DATA } from "../../graphql/VoteQueries";
import StaticPostContent from "./StaticPostContent";
import { useState } from "react";
import LineChart from "./LineChart";

function PostData({ user_id, username, profile_pic }) {
    const [curr_post, set_curr_post] = useState(null);

    const [get_posts] = useLazyQuery(POSTS_BY_USER);

    const set_new_post = (new_post, post_data) => {
        set_curr_post({
            ...new_post,
            author_details: {
                username: username,
                profile_pic: profile_pic,
            },
            post_data: post_data,
        });
    };

    const [chart_data, set_chart_data] = useState({
        labels: [],
        datasets: [
            {
                label: "Up Votes",
                data: [],
                borderColor: "green",
                backgroundColor: "green",
            },
            {
                label: "Down Votes",
                data: [],
                borderColor: "red",
                backgroundColor: "red",
            },
        ],
    });

    const chart_options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `Total Votes`,
            },
            maintainAspectRatio: false,
        },
    };

    // response of get_vote_data contains data, error, loading
    const [get_vote_data] = useLazyQuery(GET_VOTE_DATE_DATA);

    const get_all_vote_data = async (dates_and_labels) => {
        const up_vote_response = await get_vote_data({
            variables: {
                dates: dates_and_labels.all_dates,
                up_vote: true,
                parent_type: "post",
                post_id: curr_post.id,
                comment_id: null,
            },
        });

        if (up_vote_response.error) {
            console.log(up_vote_response);
            return;
        }

        const down_vote_response = await get_vote_data({
            variables: {
                dates: dates_and_labels.all_dates,
                up_vote: false,
                parent_type: "post",
                post_id: curr_post.id,
                comment_id: null,
            },
        });

        if (down_vote_response.error) {
            console.log(down_vote_response);
            return;
        }

        // making a copy of chart_data_copy
        const chart_data_copy = JSON.parse(JSON.stringify(chart_data));

        // adding the labels to the chart
        chart_data_copy.labels = dates_and_labels.all_labels;

        // setting the data for each vote
        chart_data_copy.datasets[0].data =
            up_vote_response.data.get_total_votes_before_date;
        chart_data_copy.datasets[1].data =
            down_vote_response.data.get_total_votes_before_date;

        // adding it to state to reflect in UI
        set_chart_data(chart_data_copy);
    };

    return (
        <div className="PostData">
            <PaginatedTable
                get_data={get_posts}
                determine_data_path={(response) =>
                    response.data.get_posts_by_user_id
                }
                user_id={user_id}
                table_headers={TABLE_HEADERS}
                table_row={(post) => {
                    return (
                        <PaginatedTableRowPosts
                            set_curr_post={set_new_post}
                            post_details={post}
                            key={post.id}
                        />
                    );
                }}
            />

            <div className="curr_post_and_line_chart">
                {curr_post !== null && (
                    <>
                        <StaticPostContent post_details={curr_post} />
                        <LineChart
                            get_data={get_all_vote_data}
                            chart_data={chart_data}
                            chart_options={chart_options}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default PostData;
