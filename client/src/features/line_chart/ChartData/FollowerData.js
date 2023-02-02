import { useState } from "react";

import PaginatedTable from "../../pagination/PaginatedTable";
import LineChart from "../LineChart";

import {
    GET_ALL_FOLLOWER_DATA,
    GET_FOLLOWER_DATE_DATA,
} from "../../../graphql/FollowerQueries";

import { useLazyQuery } from "@apollo/client";

import PaginatedTableRow, {
    TABLE_HEADERS,
} from "../../pagination/UserTableRow/PaginatedTableRow";

function FollowerData({ user_id, username }) {
    const [get_followers] = useLazyQuery(GET_ALL_FOLLOWER_DATA);

    const [chart_data, set_chart_data] = useState({
        labels: [],
        datasets: [
            {
                label: "Followers",
                data: [],
                borderColor: "green",
                backgroundColor: "green",
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
                text: `Total count of users following ${username}`,
            },
            maintainAspectRatio: false,
        },
    };

    // response of get_vote_data contains data, error, loading
    const [get_follower_data] = useLazyQuery(GET_FOLLOWER_DATE_DATA);

    const get_all_follower_data = async (dates_and_labels) => {
        const follower_response = await get_follower_data({
            variables: {
                dates: dates_and_labels.all_dates,
                user_id: user_id,
            },
        });

        if (follower_response.error) {
            // console.log(follower_response);
            return;
        }

        // making a copy of chart_data_copy
        const chart_data_copy = JSON.parse(JSON.stringify(chart_data));

        // adding the labels to the chart
        chart_data_copy.labels = dates_and_labels.all_labels;

        // setting the data for each vote
        chart_data_copy.datasets[0].data =
            follower_response.data.get_total_followers_before_date;

        // adding it to state to reflect in UI
        set_chart_data(chart_data_copy);
    };

    return (
        <div className="FollowerData">
            <PaginatedTable
                get_data={get_followers}
                determine_data_path={(response) =>
                    response.data.get_user_info.Followers
                }
                user_id={user_id}
                table_headers={TABLE_HEADERS}
                table_row={(user) => {
                    return <PaginatedTableRow user_data={user} key={user.id} />;
                }}
            />
            <LineChart
                get_data={get_all_follower_data}
                chart_data={chart_data}
                chart_options={chart_options}
            />
        </div>
    );
}

export default FollowerData;
