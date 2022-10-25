import React from 'react';
import PaginatedTable from './PaginatedTable';
import PaginatedTableRow, { TABLE_HEADERS } from './PaginatedTableRow';
import { GET_PROFILE_VISITORS, GET_PROFILE_VISIT_DATE_DATA } from '../../GraphQL/Queries';

import { useLazyQuery } from "@apollo/client";
import LineChart from './LineChart';

import { useState } from 'react';


function ProfileVisitsData({ user_id, username }) {


    const [get_profile_visitors] = useLazyQuery(GET_PROFILE_VISITORS);

    // response of get_vote_data contains data, error, loading
    const [get_profile_visitor_data] = useLazyQuery(GET_PROFILE_VISIT_DATE_DATA);

    
    const get_all_follower_data = async (dates_and_labels) => {

        
        
        const profile_visitors_response = await get_profile_visitor_data({
            variables: {
                dates: dates_and_labels.all_dates,
                user_id: user_id
            }
        })

        if (profile_visitors_response.error) {
            console.log(profile_visitors_response);
            return
        }

        // making a copy of chart_data_copy
        const chart_data_copy = JSON.parse(JSON.stringify(chart_data))

        // adding the labels to the chart
        chart_data_copy.labels = dates_and_labels.all_labels
        
        // setting the data for each vote
        chart_data_copy.datasets[0].data = profile_visitors_response.data.get_total_profile_visits_before_date

        // adding it to state to reflect in UI
        set_chart_data(chart_data_copy)
    }

    const [chart_data, set_chart_data] = useState({
        labels: [],
        datasets: [
            {
                label: 'Profile Visitors',
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
                text: `Total profile visitors for ${username}`,
            },
            maintainAspectRatio: false,
        },
        
    };


    return (
        <div className='ProfileVisitsData'>
            <PaginatedTable
                get_data={get_profile_visitors}
                determine_data_path={(response) => response.data.get_profile_visitors_by_user_id}
                table_headers={TABLE_HEADERS}
                user_id={user_id}
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
                get_data={get_all_follower_data}
                chart_data={chart_data}
                chart_options={chart_options}
            />
        </div>
    )
}

export default ProfileVisitsData