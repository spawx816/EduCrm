/**
 * Formats a string to Proper Case (First letter of each word in uppercase, the rest lowercase).
 * Example: "andersRson Ramirez" -> "Anderson Ramirez"
 */
export const toProperCase = (str: string): string => {
    if (!str) return str;
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
