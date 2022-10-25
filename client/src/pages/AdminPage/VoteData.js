import { useState } from 'react';

import PaginatedTable from './PaginatedTable';
import LineChart from './LineChart';

import { GET_ALL_FOLLOWER_DATA } from '../../GraphQL/Queries';

import { useLazyQuery } from "@apollo/client";

import { GET_VOTE_DATE_DATA } from '../../GraphQL/Queries';

function VoteData({ user_id }) {

    const [get_followers] = useLazyQuery(GET_ALL_FOLLOWER_DATA);

    const [chart_data, set_chart_data] = useState({
        labels: [],
        datasets: [
            {
                label: 'Up Votes',
                data: [],
                borderColor: 'green',
                backgroundColor: 'green',
            },
            {
                label: 'Down Votes',
                data: [],
                borderColor: 'red',
                backgroundColor: 'red',
            },
        ],
    })

    const chart_options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Total Votes',
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
                comment_id: null,
                post_id: 2,
            }
        })

        if (up_vote_response.error) {
            console.log(up_vote_response);
            return
        }

        const down_vote_response = await get_vote_data({
            variables: {
                dates: dates_and_labels.all_dates,
                up_vote: false,
                parent_type: "post",
                comment_id: null,
                post_id: 2,
            }
        })

        if (down_vote_response.error) {
            console.log(down_vote_response);
            return
        }

        // making a copy of chart_data_copy
        const chart_data_copy = JSON.parse(JSON.stringify(chart_data))

        // adding the labels to the chart
        chart_data_copy.labels = dates_and_labels.all_labels
        
        // setting the data for each vote
        chart_data_copy.datasets[0].data = up_vote_response.data.get_total_votes_before_date
        chart_data_copy.datasets[1].data = down_vote_response.data.get_total_votes_before_date

        // adding it to state to reflect in UI
        set_chart_data(chart_data_copy)
    }


    return (
        <div className='FollowerData'>
            <PaginatedTable
                get_user_data={get_followers}
                determine_data_path={(response) => response.data.get_user_info.Followers}
                user_id={user_id}
            />
            <LineChart
                get_data={get_all_vote_data}
                chart_data={chart_data}
                chart_options={chart_options}
            />
        </div>
    )
}

export default VoteData