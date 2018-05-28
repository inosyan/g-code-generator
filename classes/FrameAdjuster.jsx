//--------------------------------------------------
// FrameAdjuster
//--------------------------------------------------
var FrameAdjuster = function(laserRect, paperRect, frameRect){
    this._calc(laserRect, paperRect, frameRect);
}

FrameAdjuster.prototype._calc = function(laserRect, paperRect, frameRect) {
    if (!laserRect || !paperRect || !frameRect) return undefined;
    const getCenter = function(rect) {
        return PathUtil.getMiddlePos(rect.leftTop, rect.rightBottom, 0.5);
    }
    var centerFrame = getCenter(frameRect);
    var centerLaser = getCenter(laserRect);
    laserRect.centering(centerLaser);
    paperRect.centering(centerLaser);
    frameRect.centering(centerFrame);
    var moveVec = new Vector2(centerLaser.x - centerFrame.x, centerLaser.y - centerFrame.y);
    laserRect.centering(moveVec);
    paperRect.centering(moveVec);
    this.frameRect = frameRect;
    this._adjustedPaperRect = new AdjRect(
        this._rotatePos(frameRect.leftTop, laserRect.leftTop, paperRect.leftTop),
        this._rotatePos(frameRect.rightTop, laserRect.rightTop, paperRect.rightTop),
        this._rotatePos(frameRect.rightBottom, laserRect.rightBottom, paperRect.rightBottom),
        this._rotatePos(frameRect.leftBottom, laserRect.leftBottom, paperRect.leftBottom)
    );
    this._frameWidth = frameRect.rightTop.x - frameRect.leftTop.x;
    this._frameHeight = frameRect.leftTop.y - frameRect.leftBottom.y;
}

FrameAdjuster.prototype._rotatePos = function(frameP, laserP, paperP) {
    var zeroP = new Vector2(0, 0);
    var angle1 = PathUtil.getAngle(zeroP, frameP);
    var angle2 = PathUtil.getAngle(zeroP, laserP);
    var angle = angle2 - angle1;
    var newP = PathUtil.rotateCoordinate(paperP, -angle);
    var dis1 = Math.sqrt(frameP.x * frameP.x + frameP.y * frameP.y);
    var dis2 = Math.sqrt(laserP.x * laserP.x + laserP.y * laserP.y);
    var multi = dis1 / dis2;
    newP.multiply(multi);
    return newP;
}

FrameAdjuster.prototype.adjust = function(frame, pos) {
    if (!this._adjustedPaperRect) return pos;
    var scope = this;
    const getRateXY = function(p) {
        var rateX = p.x / scope._frameWidth * 2;
        var rateY = - p.y / scope._frameHeight * 2; // y is up side down.
        return new Vector2(rateX, rateY);
    }
    const getPosFromRate = function(rateX, rateY) {
        const getRatePos = function(pos1, pos2, rate) {
            // rate: -1 ~ 1
            var mid = PathUtil.getMiddlePos(pos1, pos2, 0.5);
            var isFirstHalf = rate < 0;
            rate = Math.abs(rate);
            var p = isFirstHalf ? PathUtil.getMiddlePos(mid, pos1, rate) : PathUtil.getMiddlePos(mid, pos2, rate);
            return p;
        }
        var paperRect = scope._adjustedPaperRect;
        var pointTop = getRatePos(paperRect.leftTop, paperRect.rightTop, rateX);
        var pointBottom = getRatePos(paperRect.leftBottom, paperRect.rightBottom, rateX);
        var newP = getRatePos(pointTop, pointBottom, rateY);
        return newP;
    }
    var rateXY = getRateXY(pos, false);
    var newP = getPosFromRate(rateXY.x, rateXY.y);
    return newP;
}