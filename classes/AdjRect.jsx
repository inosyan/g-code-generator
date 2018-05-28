//--------------------------------------------------
// AdjRect
//--------------------------------------------------
var AdjRect = function(leftTop, rightTop, rightBottom, leftBottom) {
    this.leftTop = leftTop;
    this.rightTop = rightTop;
    this.rightBottom = rightBottom;
    this.leftBottom = leftBottom;
}

AdjRect.prototype.toString = function() {
    return 'leftTop: ' + this.leftTop + ', rightTop: ' + this.rightTop + ', rightBottom: ' + this.rightBottom + ', leftBottom: ' + this.leftBottom;
}

AdjRect.prototype.centering = function(centerPos) {
    this.leftTop.minus(centerPos);
    this.rightTop.minus(centerPos);
    this.rightBottom.minus(centerPos);
    this.leftBottom.minus(centerPos);
}
