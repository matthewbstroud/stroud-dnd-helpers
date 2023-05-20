export let numbers = {
    "getRandomInt": function _getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    "toNumber": function _toNumber(val){
        if (!val || val == '') {
            return 0;
        }
        return Number(val);
    },
    "sortByNumber": function _sortByNumber(a, b) {
        let x = this.toNumber(a);
        let y = this.toNumber(b);
        if (x < y) {
            return -1;
        }
        if (x > y) {
            return 1;
        }
        return 0;
    }
};