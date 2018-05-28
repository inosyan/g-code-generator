//--------------------------------------------------
// Frame
//--------------------------------------------------
var Frame = function(name, left, right, top, bottom){
    var nums = [left, right, top, bottom];
    PathUtil.pointToMM(nums);
    this.name = name;
    this.left = nums[0];
    this.right = nums[1];
    this.top = nums[2];
    this.bottom = nums[3];
    this.width = this.right - this.left;
    this.height = this.top - this.bottom;
    this.x = this.left;
    this.y = this.top;
}

Frame.prototype.getCenter = function() {
    return new Vector2(this.x + this.width / 2, this.y - this.height / 2);
}

Frame.prototype.inRange = function(vec2) {
    return this.left <= vec2.x && vec2.x < this.right &&
        this.bottom <= vec2.y && vec2.y <= this.top;
}

Frame.prototype.getCenteredPos = function(pos) {
    var c = new Vector2(this.left + this.width / 2, this.top - this.height /2);
    return new Vector2(pos.x - c.x, pos.y - c.y);
}