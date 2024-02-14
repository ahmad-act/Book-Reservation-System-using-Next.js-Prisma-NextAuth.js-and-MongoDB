export const generateReferenceNumber = (prefix = 'REF') => {
    // Add a prefix to the reference number
    let referenceNumber = prefix;

    // Add timestamp to the reference number (optional, you can customize the format)
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '');
    referenceNumber += timestamp;

    // Add a random number to the reference number
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    referenceNumber += randomPart;

    return referenceNumber;
}

export const isEmptyStringNullOrUndefined = (value: any) => {
    // Check for empty string, null, or undefined
    if (value === '' || value === null || value === undefined) {
        return true;
    } else {
        return false;
    }
}
export const isNumber = (value: any): boolean => {

    if (isEmptyStringNullOrUndefined(value)) {
        return false;
    }
    
    return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
};

export const isDate = (value: any): boolean => {

    if (isEmptyStringNullOrUndefined(value)) {
        return false;
    }
    
    return !isNaN(Date.parse(value));
};

export const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};