// might need to rename these functions

export const get_item_local_storage = (key) => {
    // return JSON.parse(localStorage.getItem(key))
    return JSON.parse(sessionStorage.getItem(key))
}

export const set_item_local_storage = (key, value) => {
    // localStorage.setItem(key, JSON.stringify(value))
    sessionStorage.setItem(key, JSON.stringify(value))
}

export const remove_item_local_storage = (key) => {
    // localStorage.removeItem(key)
    sessionStorage.removeItem(key)
}