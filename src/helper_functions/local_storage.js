

export const get_item_local_storage = (key) => {
    return JSON.parse(localStorage.getItem(key))
}

export const set_item_local_storage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
}

export const remove_item_local_storage = (key) => {
    localStorage.removeItem(key)
}