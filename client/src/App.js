// styles
import "./App.scss";

// contexts
import NotificationProvider from "./context/Notifications/NotificationProvider";
import CurrentUserProvider from "./context/CurrentUser/CurrentUserProvider";
import DarkModeProvider from "./context/DarkMode/DarkModeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// dev tools
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// components
import Navbar from "./page_layout/Navbar";
import Footer from "./page_layout/Footer";

import { BrowserRouter as Router } from "react-router-dom";
import AllRoutes from "./page_layout/AllRoutes";

function App() {
    const client = new QueryClient();

    return (
        <div className="App">
            <DarkModeProvider>
                <QueryClientProvider client={client}>
                    <ReactQueryDevtools />
                    <Router>
                        <CurrentUserProvider>
                            <NotificationProvider>
                                <div className="app_content">
                                    <div className="nav_bar_and_body">
                                        <Navbar />

                                        <div className="main_body">
                                            <AllRoutes />
                                        </div>
                                    </div>
                                    <Footer />
                                </div>
                            </NotificationProvider>
                        </CurrentUserProvider>
                    </Router>
                </QueryClientProvider>
            </DarkModeProvider>
        </div>
    );
}

export default App;
