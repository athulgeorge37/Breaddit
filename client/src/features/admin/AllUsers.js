import "./AllUsers.scss";
import React from "react";

import { useLazyQuery } from "@apollo/client";

import { GET_ALL_USER_DATA } from "../../graphql/UserQueries";

import PaginatedTable from "../pagination/PaginatedTable";
import PaginatedTableRow, {
    TABLE_HEADERS,
} from "../pagination/UserTableRow/PaginatedTableRow";

function AllUsers() {
    // data for the paginated table
    const [get_all_users] = useLazyQuery(GET_ALL_USER_DATA);

    return (
        <div className="AllUsers">
            <PaginatedTable
                get_data={get_all_users}
                determine_data_path={(response) => response.data.get_users}
                table_headers={TABLE_HEADERS}
                table_row={(user) => {
                    return <PaginatedTableRow user_data={user} key={user.id} />;
                }}
            />
        </div>
    );
}

export default AllUsers;
