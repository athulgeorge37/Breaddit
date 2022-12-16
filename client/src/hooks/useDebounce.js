import { useEffect, useState } from "react";

// code gotten from https://www.youtube.com/watch?v=PySFIsgXNZ0

const useDebounce = (value, delay) => {
    // this hook allows us to not make multiple requests
    // when requests are triggered on search input.
    // requests are only made when user stop typing for the "delay" parameter
    const [debounced_value, set_debounced_value] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            set_debounced_value(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debounced_value;
};

// // here is an example of it being used
// const debounced_search = useDebounce(search_term, 500);

// useEffect(() => {
//     // searching the api for thread names
//     const search_api_for_thread_names = async () => {
//         set_is_loading(true);
//         const data = await get_thread_names(debounced_search);
//         if (data.error) {
//             console.log({ data });
//             return;
//         }
//         set_threads_list(data.threads);
//         set_is_loading(false);
//     };

//     if (debounced_search) {
//         search_api_for_thread_names();
//     }
// }, [debounced_search]);

export default useDebounce;
