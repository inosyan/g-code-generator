//--------------------------------------------------
// NumTable
//--------------------------------------------------
function NumTable() {
    this.table = {};
    this.numbers = [];
}

NumTable.prototype.hasValue = function(num) {

    return this.table[num] !== undefined;
}

NumTable.prototype.set = function(num, value) {
    this.table[num] = value;
    this.numbers.push(num);
    this.numbers.sort();
}

NumTable.prototype.get = function(num) {
    return this.table[num];
}

NumTable.prototype.getNumbers = function() {
    return this.numbers;
}

NumTable.prototype.getValues = function() {
    var values = [];
    var cnt = this.numbers.length;
    for(var i = 0; i < cnt; i++) {
        values.push(this.table[this.numbers[i]]);
    }
    return values;
}

NumTable.prototype.getNeighbors = function(num) {
    var idx = 0;
    for(var i = 0, len = this.numbers.length; i < len; i++) {
        idx = i;
        if (this.numbers[i] > num) break;
    }
    return {small: this.numbers[i - 1], large: this.numbers[i]}
}

NumTable.prototype.getLargerNumber = function(num) {
    for(var i = 0, len = this.numbers.length; i < len; i++) {
        if (this.numbers[i] > num) return this.numbers[i];
    }
    return this.numbers.length > 0 ? this.numbers[this.numbers.length - 1] : 0;
}
