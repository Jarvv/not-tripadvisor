/**
 * Store data in the localStorage.
 * @param id - The key of the data
 * @param input - Data to input to the localStorage
 */
function storeCachedData(id,input){
    localStorage.setItem(id,input);
}

/**
 * Retrieve the data stored in the localStorage and remove the item.
 * @param id - The key of the data.
 * @returns The data stored in the localStorage.
 */
function getCachedData(id) {
    const value = localStorage.getItem(id);
    if (value == null)
        return null;
    else
        localStorage.removeItem(id);
        return value;
}