import { useState, useEffect } from 'react';

import "./PaginatedTable.scss";



const determine_variables = (limit, offset, user_id) => {
    if (user_id === null) {
        return {
            limit: limit,
            offset: offset
        }
    } else {
        return {
            limit: limit,
            offset: offset,
            user_id: user_id
        }
    }
}


const USERS_PER_PAGE = 3;

function PaginatedTable({ get_data, determine_data_path, user_id=null, table_row, table_headers }) {

    const [all_data, set_all_data] = useState([]);
    const [page_number, set_page_number] = useState({
        curr_page_number: 1,
        available_page_numbers: [1, 2, 3, 4, 5]
    });

   

    useEffect(() => {

        initialise_data();
        set_page_number({
            ...page_number,
            curr_page_number: 1
        })

    }, [get_data, user_id])

    const initialise_data = async () => {

        const limit = USERS_PER_PAGE;

        const response = await get_data({
            variables: determine_variables(limit, 0, user_id)
        })

        // console.log(response.data)
        if (response.data) {
            set_all_data(determine_data_path(response))
        }

    }

    const get_more_data = async (new_page_number) => {

        set_page_number({
            ...page_number,
            curr_page_number: new_page_number
        })

        const limit = USERS_PER_PAGE 
        const offset = (new_page_number - 1) * limit

        const response = await get_data({
            variables: determine_variables(limit, offset, user_id)
        })

        if (response.data) {
            set_all_data(determine_data_path(response))
        }

    }




    return (
        <div className='PaginatedTable'>
            <table>
                <thead>
                    <tr>
                        {
                            table_headers.map((header) => {
                                return (
                                    <th key={header}>
                                        {header}
                                    </th>
                                )
                            })
                        }
                    </tr>
                </thead>
            
                <tbody>
                {
                    all_data?.map((each_data) => {
                        return (
                            table_row(each_data)
                        )
                    })
                }
                </tbody>
           
            </table>

            <div className="change_pages">
                <button 
                    onClick={() => get_more_data(page_number.curr_page_number - 1)}
                    className="go_back_one_page"
                >
                    {"<"}
                </button>
                <div className="page_counts">
                    {
                        page_number.available_page_numbers.map((new_page_number) => {
                            return (
                                <button
                                    key={new_page_number}
                                    onClick={() => get_more_data(new_page_number)}
                                    className={new_page_number === page_number.curr_page_number ? "active" : ""}
                                >
                                    {new_page_number}
                                </button>
                            )
                        })
                    }
                </div>
                <button 
                    onClick={() => get_more_data(page_number.curr_page_number + 1)}
                    className="go_forward_one_page"
                >
                    {">"}
                </button>
            </div>
        </div>
    )
}

export default PaginatedTable