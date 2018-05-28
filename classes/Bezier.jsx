//--------------------------------------------------
// Bezier
//--------------------------------------------------
var Bezier = function(isReflect){
    this.dataList = [];
    this.isReflect = isReflect;
}

Bezier.prototype.add = function(bezierData) {
    this.dataList.push(bezierData);
}

Bezier.prototype.getCroppedBezier = function(frame) {
    var ret = new Bezier(this.isReflect);
    for (var i = 0, cnt = this.dataList.length; i < cnt; i++) {
        var bezData = this.dataList[i];
        if (bezData.inRange(frame)) 
            ret.add(bezData.clone());
        else {
            bezData = bezData.crop(frame);
            if (bezData) ret.add(bezData);
        }
    }
    return ret.dataList.length > 0 ? ret : undefined;
}

Bezier.prototype.clone = function() {
    var ret = new Bezier(this.isReflect);
    for (var i = 0, cnt = this.dataList.length; i < cnt; i++) {
        ret.dataList.push(this.dataList[i].clone());
    }
    return ret;
}

Bezier.prototype.prot = function(pathObj, frame, frameAdjuster, lastProtPos) {
    for (var i = 0, cnt = this.dataList.length; i < cnt; i++) {
        var b = this.dataList[i];
        if (b.rateRanges.length === 0) continue;
        lastProtPos = b.prot(pathObj, frame, frameAdjuster, lastProtPos, this.isReflect);
    }
    return lastProtPos;
}

//--------------------------------------------------
// BezierData
//--------------------------------------------------
var BezierData = function(anchor1, handle1, anchor2, handle2){
    this.anchor1 = anchor1;
    this.anchor2 = anchor2;
    this.handle1 = handle1;
    this.handle2 = handle2;
    this.rateRanges = [new BezierRateRange(0, 1)];
}

BezierData.prototype.sortRateRange = function() {
    this.rateRanges.sort(function(lh, rh) {
        return lh.start - rh.start;
    });
}

BezierData.prototype.getStartPos = function() {
    if (this.rateRanges.length === 0) return undefined;
    var rateRange = this.rateRanges[0];
    if (rateRange.start === 0) return this.anchor1;
    var points = [this.anchor1, this.handle1, this.handle2, this.anchor2];
    return PathUtil.getPosByRate(points, rateRange.start);
}

BezierData.prototype.clone = function() {
    return new BezierData(this.anchor1, this.handle1, this.anchor2, this.handle2);
}

BezierData.prototype.addRateRange = function(rateRange) {
    this.rateRanges.push(rateRange);
}

BezierData.prototype.inRange = function(frame) {
    var a1 = this.anchor1;
    var a2 = this.anchor2;
    var h1 = this.handle1;
    var h2 = this.handle2;
    return frame.inRange(a1) && frame.inRange(a2) &&
        frame.inRange(h1) && frame.inRange(h2);
}

BezierData.prototype._getPosFromTable = function(posTbl, rate) {
    if (posTbl.hasValue(rate)) {
        return posTbl.get(rate);
    } else {
        var points = [this.anchor1, this.handle1, this.handle2, this.anchor2];
        var pos = PathUtil.getPosByRate(points, rate);
        posTbl.set(rate, pos);
        return pos;
    }
}

BezierData.prototype.crop = function(frame) {
    var END_DISTANCE = 0.1;
    var posTbl = new NumTable();
    var b = this.clone();
    var tasks = [new BezierRateRange(0, 0.25),
        new BezierRateRange(0.25, 0.5),
        new BezierRateRange(0.5, 0.75),
        new BezierRateRange(0.75, 1)];
    var tmp = [];
    while(tasks.length > 0) {
        var task = tasks.shift();
        var p1 = this._getPosFromTable(posTbl, task.start);
        var p2 = this._getPosFromTable(posTbl, task.end);
        var in1 = frame.inRange(p1);
        var in2 = frame.inRange(p2);
        if (in1 && in2)
            tmp.push(task);
        else if (in1 !== in2) {
            var distance = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
            if (distance < END_DISTANCE)
                tmp.push(task);
            else {
                var mid = (task.end - task.start) / 2 + task.start;
                tasks.push(new BezierRateRange(task.start, mid));
                tasks.push(new BezierRateRange(mid, task.end));
            }
        }
    }
    if (tmp.length === 0) return undefined;
    tmp.sort(function(lh, rh){
        return lh.start - rh.start;
    });
    // merge each rates
    var rates = [];
    var trg = tmp[0];
    for(var i = 1, cnt = tmp.length; i < cnt; i++) {
        var r = tmp[i];
        if (trg.end === r.start) {
            trg = new BezierRateRange(trg.start, r.end);
        } else {
            rates.push(trg);
            trg = r;
        }
    }
    rates.push(trg);
    b.rateRanges = rates;
    return b;
}

BezierData.prototype.prot = function(pathObj, frame, frameAdjuster, lastProtPos, isReflect) {
    var posTbl = new NumTable();
    var scope = this;
    var an1 = frame.getCenteredPos(this.anchor1);
    var an2 = frame.getCenteredPos(this.anchor2);
    var hn1 = frame.getCenteredPos(this.handle1);
    var hn2 = frame.getCenteredPos(this.handle2);
    var refrect = function(p) {
        p.x *= -1;
    }
    if (isReflect) {
        refrect(an1);
        refrect(an2);
        refrect(hn1);
        refrect(hn2);
    }
    an1 = frameAdjuster.adjust(frame, an1);
    an2 = frameAdjuster.adjust(frame, an2);
    hn1 = frameAdjuster.adjust(frame, hn1);
    hn2 = frameAdjuster.adjust(frame, hn2);
    var getPos = function(rate) {
        if (posTbl.hasValue(rate)) {
            return posTbl.get(rate);
        } else {
            var points = [an1, hn1, hn2, an2];
            var pos = PathUtil.getPosByRate(points, rate);
            posTbl.set(rate, pos);
            return pos;
        }
    }
    posTbl.set(0.0, an1);
    posTbl.set(1.0, an2);
    
    var addLinear = function(startPos, endPos) {
        if (lastProtPos.x !== startPos.x || lastProtPos.y !== startPos.y) {
            pathObj.addChild(new GCodeLaserOff);
            pathObj.addChild(new GCodeTravel(startPos.x, startPos.y));
            pathObj.addChild(new GCodeLaserOn);
        }
        pathObj.addChild(new GCodeLinear(endPos.x, endPos.y));
        lastProtPos = endPos;
    }

    var addArc = function(startPos, endPos, argI, argJ, isCCW) {
        if (lastProtPos.x !== startPos.x || lastProtPos.y !== startPos.y) {
            pathObj.addChild(new GCodeLaserOff);
            pathObj.addChild(new GCodeTravel(startPos.x, startPos.y));
            pathObj.addChild(new GCodeLaserOn);
        }
        pathObj.addChild(new GCodeArc(endPos.x, endPos.y, argI, argJ, isCCW));
        lastProtPos = endPos;
    }

    for(var i = 0, cnt = this.rateRanges.length; i < cnt; i++) {
        var r = this.rateRanges[i];
        var smallRate = r.start;
        var largeRate = r.end;
        while(smallRate < r.end) {
            var rate = (largeRate - smallRate) / 2 + smallRate;
            var small = getPos(smallRate);
            var large = getPos(largeRate);
            var pos = getPos(rate);
            if (!PathUtil.checkDeviation(small, large, pos)) {
                // Detect linear line
                addLinear(small, large);
                smallRate = largeRate;
                largeRate = r.end;
                continue;
            }
            var insec = PathUtil.getIntersection(small, pos, large);
            var mid1Rate = (rate - smallRate) / 2 + smallRate;
            var mid1 = getPos(mid1Rate);
            var insec1 = PathUtil.getIntersection(small, mid1, pos);
            if (PathUtil.checkDistance(pos, insec, insec1)) {
                // Not arch detected. Try to search on smaller area.
                largeRate = rate;
                continue;
            }
            var mid2Rate = (largeRate - rate) / 2 + rate;
            var mid2 = getPos(mid2Rate);
            var insec2 = PathUtil.getIntersection(pos, mid2, large);
            if (PathUtil.checkDistance(pos, insec, insec2)) {
                // Half arch detected.
                var argI = insec1.x - small.x;
                var argJ = insec1.y - small.y;
                var isCCW = PathUtil.checkCCW(small, mid1, pos);
                addArc(small, pos, argI, argJ, isCCW);
                smallRate = rate;
            } else {
                // Full arch detected
                var argI = insec.x - small.x;
                var argJ = insec.y - small.y;
                var isCCW = PathUtil.checkCCW(small, pos, large);
                addArc(small, large, argI, argJ, isCCW);
                smallRate = largeRate;
                largeRate = r.end;
            }
        }
    }
    var lastRange = this.rateRanges[this.rateRanges.length - 1];
    return lastProtPos;
}

//--------------------------------------------------
// BezierRateRange
//--------------------------------------------------
var BezierRateRange = function(start, end) {
    if (start < end) {
        this.start = start;
        this.end = end;
    } else {
        this.start = end;
        this.end = start;
    }
}

BezierRateRange.prototype.inRange = function(rate) {
    return this.start <= rate && rate <= this.end;
}

BezierRateRange.prototype.toString = function() {
    return 'start: ' + this.start + ', end: ' + this.end;
}
