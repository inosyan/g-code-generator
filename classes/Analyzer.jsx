//--------------------------------------------------
// Analyzer
//--------------------------------------------------
function Analyzer() {
    this._frames = [];
    this._layers = [];
    this._layer = undefined;
    this._frameAdjuster = undefined;
}

Analyzer.prototype.scan = function() {
    const scope = this;
    const analyzePathItems = function(pathItems, isRefrect) {
        var pathLen = pathItems.length;
        for (var j = 0; j < pathLen; j++) {
            var pathItem = pathItems[j];
            if (pathItem.hidden) continue;
            var pointLen = pathItem.pathPoints.length;
            var bezier = new Bezier(isRefrect);
            for (var k = 0; k < pointLen; k++) {
                if (!pathItem.closed && k == pointLen - 1) break;
                var point1 = pathItem.pathPoints[k];
                var anchor1 = point1.anchor;
                var handle1 = point1.rightDirection;

                var nextK = k + 1; if (nextK >= pointLen) nextK = 0;
                var point2 = pathItem.pathPoints[nextK];
                var anchor2 = point2.anchor;
                var handle2 = point2.leftDirection;

                var anc1 = PathUtil.getMMVectorFromPointArray(anchor1);
                var anc2 = PathUtil.getMMVectorFromPointArray(anchor2);
                var hnd1 = PathUtil.getMMVectorFromPointArray(handle1);
                var hnd2 = PathUtil.getMMVectorFromPointArray(handle2);
                
                bezier.add(new BezierData(anc1, hnd1, anc2, hnd2));
            }
            scope._layer.addBezier(bezier, scope._frameAdjuster);
        }
    }
    const analyzeGroupOrLayer = function(target, isRefrect) {
        analyzePathItems(target.pathItems, isRefrect);
        var pathLen = target.pathItems.length;
        var compoundPathLen = target.compoundPathItems.length;
        var groupItemLen = target.groupItems.length;
        if (target.layers) analyzeLayers(target.layers, false, isRefrect);
        for (var j = 0; j < compoundPathLen; j++) {
            var compoundPathItem = target.compoundPathItems[j];
            analyzePathItems(compoundPathItem.pathItems, isRefrect);
        }
        for (var j = 0; j < groupItemLen; j++) {
            var group = target.groupItems[j];
            analyzeGroupOrLayer(group, isRefrect);
        }
    }
    const analyzeLayers = function(layers, isRoot, isRefrect) {
        var layerLen = layers.length;
        for (var i = 0; i < layerLen; i++) {
            var layer = layers[i];
            if (!layer.visible) continue;
            if (layer.name === '@adjust' || layer.name === '@frame' || layer.name === '@ignore') continue;
            if (layer.name === '@reflect') {
                analyzeLayers(layer.layers, true, true);
                continue;
            }
            if (isRoot) {
                var name = layer.name;
                if (name.indexOf('.txt') === -1) name = '';
                scope._layer = new LayerData(scope._frames, name);
                scope._layers.push(scope._layer);
            }
            analyzeGroupOrLayer(layer, isRefrect);
        }
    }
    this._checkAdjustLayer();
    this._checkFrameLayer();
    analyzeLayers(activeDocument.layers, true, false);
}

Analyzer.prototype._checkAdjustLayer = function() {
    var laserRect = undefined;
    var paperRect = undefined;
    var frameRect = undefined;

    const getRectFromPathItem = function(pathItem) {
        if (pathItem.pathPoints.length !== 4) return undefined;
        var tmp = [];
        var xyTotal = Number.MAX_VALUE;
        var idx = 0;
        for(var i = 0, cnt = pathItem.pathPoints.length; i < cnt; i++) {
            var p = pathItem.pathPoints[i].anchor;
            tmp.push(p);
            if (xyTotal > p[0] - p[1])  {
                xyTotal = p[0] - p[1];
                idx = i;
            }
        }
        // Bring the left top point to first poistion.
        var points = [];
        for(var i = 0; i < 4; i++) {
            idx = idx % 4;
            points.push(PathUtil.getMMVectorFromPointArray(tmp[idx]));
            idx++;
        }
        return new AdjRect(points[0], points[1], points[2], points[3]);
    }

    const getRectFromLayer = function(layer) {
        if (layer.pathItems.length !== 1) return undefined;
        var pathItem = layer.pathItems[0];
        return getRectFromPathItem(pathItem);
    }

    for(var i = 0, cnt = activeDocument.layers.length; i < cnt; i++) {
        if (activeDocument.layers[i].name === '@adjust') {
            for(var j = 0, cnt2 = activeDocument.layers[i].layers.length; j < cnt2; j++) {
                var layer = activeDocument.layers[i].layers[j];
                var rect = getRectFromLayer(layer);
                if (layer.name === '@adjust-laser') {
                    laserRect = rect;
                } else if (layer.name === '@adjust-paper') {
                    paperRect = rect;
                } else if (layer.name === '@adjust-frame') {
                    frameRect = rect;
                }
            }
            for(var j = 0, cnt2 = activeDocument.layers[i].pathItems.length; j < cnt2; j++) {
                var pathItem = activeDocument.layers[i].pathItems[j];
                var rect = getRectFromPathItem(pathItem);
                if (pathItem.name === '@adjust-laser') {
                    laserRect = rect;
                } else if (pathItem.name === '@adjust-paper') {
                    paperRect = rect;
                } else if (pathItem.name === '@adjust-frame') {
                    frameRect = rect;
                }
            }
            break;
        }
    }
    this._frameAdjuster = new FrameAdjuster(laserRect, paperRect, frameRect);
}

Analyzer.prototype._checkFrameLayer = function() {
    var scope = this;
    const createFrameFromPathItem = function(name, pathItem) {
        var left = 0, right = 0, top = 0, bottom = 0;
        var s = '';
        for(var l = 0, cnt4 = pathItem.pathPoints.length; l < cnt4; l++) {
            var pathPoint = pathItem.pathPoints[l];
            s += pathPoint.anchor[0] + ', ' + pathPoint.anchor[1] + '\n';
            if (l === 0) {
                left = right = pathPoint.anchor[0];
                top = bottom = pathPoint.anchor[1];
            } else {
                left = Math.min(left, pathPoint.anchor[0]);
                right = Math.max(right, pathPoint.anchor[0]);
                top = Math.max(top, pathPoint.anchor[1]);
                bottom = Math.min(bottom, pathPoint.anchor[1]);
            }
        }
        var frame = new Frame(name, left, right, top, bottom);
        scope._frames.push(frame);
    }
    for(var i = 0, cnt = activeDocument.layers.length; i < cnt; i++) {
        if (activeDocument.layers[i].name === '@frame') {
            if (!activeDocument.layers[i].visible) continue;
            for(var j = 0, cnt2 = activeDocument.layers[i].layers.length; j < cnt2; j++) {
                var layer = activeDocument.layers[i].layers[j];
                if (!layer.visible) continue;
                for(var k = 0, cnt3 = layer.pathItems.length; k < cnt3; k++) {
                    var pathItem = layer.pathItems[k];
                    createFrameFromPathItem(layer.name, pathItem);
                }
            }
            for(var j = 0, cnt2 = activeDocument.layers[i].pathItems.length; j < cnt2; j++) {
                var pathItem = activeDocument.layers[i].pathItems[j];
                if (pathItem.hidden) continue;
                createFrameFromPathItem(pathItem.name, pathItem);
            }
        }
    }
    if (this._frames.length === 0) {
        var frame = new Frame('', 0, activeDocument.width, 0, - activeDocument.height);
        this._frames.push(frame);
    }
}

Analyzer.prototype.getResults = function() {
    var results = [];
    for(var i = 0, cnt = this._layers.length; i < cnt; i++) {
        var layer = this._layers[i];
        for(var j = 0, cnt2 = layer.layerFrames.length; j < cnt2; j++) {
            var layerFrame = layer.layerFrames[j];
            var root = layerFrame.root;
            if (!root.hasChildren()) continue;
            var frameName = layerFrame.frame.name;
            var name = layer.name ? layer.name.replace('.txt', '') + frameName.replace('.txt', '') + '.txt' : '';
            var output = root.draw();
            results.push({name: name, output: output});
        }
    }
    return results;
}
