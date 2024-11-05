export function uncapitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toLocaleLowerCase() + String(val).slice(1);
}

export function convertToCamelCase(val: string, splitter = '_') {
    let tempArray = val.split(splitter);
    tempArray = tempArray.map(value => value.charAt(0).toUpperCase() + value.toLowerCase().slice(1, value.length));
    return uncapitalizeFirstLetter(tempArray.join(''));
}
