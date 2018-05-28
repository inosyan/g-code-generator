//--------------------------------------------------
// Vector2
//--------------------------------------------------
var Vector2 = function(x, y) {
    this.x = x;
    this.y = y;
}

Vector2.prototype.toString = function() {
    return 'x: ' + this.x + ', y: ' + this.y;
}

Vector2.prototype.plus = function(vec) {
    this.x += vec.x;
    this.y += vec.y;
}

Vector2.prototype.minus = function(vec) {
    this.x -= vec.x;
    this.y -= vec.y;
}

Vector2.prototype.multiply = function(num) {
    this.x *= num;
    this.y *= num;
}