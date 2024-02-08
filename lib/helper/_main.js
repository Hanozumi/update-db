/**
 * Compares all Arrays included in the singular ```keys``` parameter
 * @param {any[]} keys Array containing arrays that should be compared
 * @returns empty array, if all elements are equal; otherwise returns Object containing element name and differing keys
 */
async function compareArrays(redis, keys) {
    let values = [];
    for (let key of keys) {
        let arr = (await redis).HKEYS(key);
        values.push(await arr);
    }

    let ret = [];

    for (let arrA of await values) {
        let _ret = [];
        for (let arrB of await values) {
            if (arrA === arrB) { continue; }
            _ret = _ret.concat(compareTwoArrays(arrA, arrB));
        }
        ret.push({ key: keys[values.indexOf(arrA)], values: [...new Set(_ret)] });
    }

    return ret;
}

function compareTwoArrays(arrA, arrB) {
    let ret = [];
    for (let e of arrB) {
        if (!arrA.includes(e)) { ret.push(e); }
    }

    return ret;
}

module.exports = {
    compareArrays
};