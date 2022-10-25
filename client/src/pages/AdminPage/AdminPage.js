
import { Outlet } from 'react-router-dom';
import AdminNavBar from './AdminNavBar';

import './AdminPage.scss';

import { 
    ApolloClient, 
    InMemoryCache, 
    ApolloProvider, 
    HttpLink, 
    from 
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { useCurrentUser } from '../../Contexts/CurrentUser/CurrentUserProvider';

const errorLink = onError(({ graphqlErrors, networkError }) => {
    if (graphqlErrors) {
        graphqlErrors.map(({message, location, path}) => {
            alert(`Graphql Error: ${message}`)
        })
    }
})

const link = from([
    errorLink, 
    new HttpLink({uri: "http://localhost:3001/graphql"})
])

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: link
})


function AdminPage() {

    const { current_user } = useCurrentUser();


    return (
        <div className='AdminPage'>
            {
                current_user.role === "admin"
                ?
                <div className='AdminDashBoard'>
                    <ApolloProvider client={client}>
                        <div className="AdminNavBar">
                            <AdminNavBar/>
                        </div>
                        <div className="dashboard">
                            <Outlet/>
                        </div>
                    </ApolloProvider>
                </div>
                :
                <div>
                    You do not have permissions to view this page
                </div>
            }
        </div>
    )
}

export default AdminPage