import { useState } from 'react';

import PaginatedTable from './PaginatedTable';
import LineChart from './LineChart';

import { GET_ALL_FOLLOWING_DATA } from '../../GraphQL/Queries';

import { useLazyQuery } from "@apollo/client";

import { GET_FOLLOWING_DATE_DATA } from '../../GraphQL/Queries';

import PaginatedTableRow, { TABLE_HEADERS } from './PaginatedTableRow';

function FollowingData({ user_id, username }) {

    const [get_following] = useLazyQuery(GET_ALL_FOLLOWING_DATA);

    const [chart_data, set_chart_data] = useState({
        labels: [],
        datasets: [
            {
                label: 'Following',
                data: [],
                borderColor: 'green',
                backgroundColor: 'green',
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
                text: `Total count of who ${username} is following`,
            },
            maintainAspectRatio: false,
        },
        
    };


    // response of get_vote_data contains data, error, loading
    const [get_following_data] = useLazyQuery(GET_FOLLOWING_DATE_DATA);

    
    const get_all_following_data = async (dates_and_labels) => {

        
        
        const following_response = await get_following_data({
            variables: {
                dates: dates_and_labels.all_dates,
                user_id: user_id
            }
        })

        if (following_response.error) {
            console.log(following_response);
            return
        }

        // making a copy of chart_data_copy
        const chart_data_copy = JSON.parse(JSON.stringify(chart_data))

        // adding the labels to the chart
        chart_data_copy.labels = dates_and_labels.all_labels
        
        // setting the data for each vote
        chart_data_copy.datasets[0].data = following_response.data.get_total_following_before_date

        // adding it to state to reflect in UI
        set_chart_data(chart_data_copy)
    }


    return (
        <div className='FollowerData'>
            <PaginatedTable
                get_data={get_following}
                determine_data_path={(response) => response.data.get_user_info.Following}
                user_id={user_id}
                table_headers={TABLE_HEADERS}
                table_row={(user) => {
                    return (
                        <PaginatedTableRow 
                            user_data={user} 
                            key={user.id}
                        />
                    )
                }}   
            />
            <LineChart
                get_data={get_all_following_data}
                chart_data={chart_data}
                chart_options={chart_options}
            />
        </div>
    )
}

export default FollowingData