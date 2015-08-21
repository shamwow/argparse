export default {
    defaultMap: function (arr, val) {
        return arr.reduce((accum, next) => {
            const obj = {};
            obj[next] = (typeof val === 'function') ? val() : val;
            return Object.assign(obj, accum);
        }, {});
    }
};
