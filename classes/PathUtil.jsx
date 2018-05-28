//--------------------------------------------------
// PathUtil
//--------------------------------------------------
var PathUtil = function(){}

PathUtil.pointToMM = function(array) {
    var len = array.length;
    for (var i = 0; i < len; i++) {
        array[i] = array[i] * 25.4 / 72;
    }
}

PathUtil.getMMVectorFromPointArray = function(array) {
    PathUtil.pointToMM(array);
    return new Vector2(array[0], array[1]);
}

PathUtil.checkDistance = function(cp, p1, p2) {
    var d1 = Math.sqrt((p1.x - cp.x) * (p1.x - cp.x) + (p1.y - cp.y) * (p1.y - cp.y));
    var d2 = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
    var rate = d2 / d1;
    var isSafe = rate < 0.05;
    return !isSafe;
}

PathUtil.checkDeviation = function(p1, p2, pTrg) {
    const MAX_DEVIATION = 0.05;
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    if (Math.abs(dx) > Math.abs(dy)) {
        var a = dy / dx;
        var b = p1.y - a * p1.x;
        var y = a * pTrg.x + b;
        return Math.abs(pTrg.y - y) > MAX_DEVIATION;
    } else {
        var a = dx / dy;
        var b = p1.x - a * p1.y;
        var x = a * pTrg.y + b;
        return Math.abs(pTrg.x - x) > MAX_DEVIATION;
    }
}


PathUtil.getPosByRate = function(points, rate) {
    while(points.length > 1) {
        var newPoints = [];
        for(var i = 0; i < points.length - 1; i++) {
            var p = PathUtil.getMiddlePos(points[i], points[i+1], rate);
            newPoints.push(p);
        }
        points = newPoints;
    }
    return points[0];
}

PathUtil.getMiddlePos = function(pos1, pos2, rate) {
    var v = new Vector2(0, 0);
    v.x = (pos2.x - pos1.x) * rate + pos1.x;
    v.y = (pos2.y - pos1.y) * rate + pos1.y;
    return v;
}

PathUtil.getLineFormula = function(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    if (dx === 0) {
        var a = Infinity;
        var b = p1.x;
    } else {
        var a = dy / dx;
        var b = p1.y - a * p1.x;
    }
    return {a: a, b: b};
}

PathUtil.getNormalLineFormula = function(line, p) {
    var a = -1 / line.a;
    var b = p.y - a * p.x;
    return {a: a, b: b};
}

PathUtil.getIntersection = function(p1, p2, p3) {
    var line1 = PathUtil.getLineFormula(p1, p2);
    var line2 = PathUtil.getLineFormula(p2, p3);
    var mid1 = PathUtil.getMiddlePos(p1, p2, 0.5);
    var mid2 = PathUtil.getMiddlePos(p2, p3, 0.5);
    var n1 = PathUtil.getNormalLineFormula(line1, mid1);
    var n2 = PathUtil.getNormalLineFormula(line2, mid2);
    var x = (n2.b - n1.b) / (n1.a - n2.a);
    var y = n1.a * x + n1.b;
    return new Vector2(x, y);
}

PathUtil.getAngle = function(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.atan2(dy, dx);
}

PathUtil.rotateCoordinate = function(p, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var x = c * p.x - s * p.y;
    var y = s * p.x + c * p.y;
    return new Vector2(x, y);
}

PathUtil.checkCCW = function(p1, p2, p3) {
    var q1 = new Vector2(0, 0);
    var q2 = new Vector2(p2.x - p1.x, p2.y - p1.y);
    var q3 = new Vector2(p3.x - p1.x, p3.y - p1.y);
    var angle = PathUtil.getAngle(q1, q2);
    var q4 = PathUtil.rotateCoordinate(q3, -angle);
    return q1.y < q4.y;
}
