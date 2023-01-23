// might need to rename these functions

// local storage
export const get_item_local_storage = (key) => {
    return JSON.parse(localStorage.getItem(key));
};

export const set_item_local_storage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const remove_item_local_storage = (key) => {
    localStorage.removeItem(key);
};

// session storage
export const get_item_session_storage = (key) => {
    return JSON.parse(sessionStorage.getItem(key));
};

export const set_item_session_storage = (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
};

export const remove_item_session_storage = (key) => {
    sessionStorage.removeItem(key);
};
