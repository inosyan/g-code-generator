//--------------------------------------------------
// LayerData
//--------------------------------------------------
var LayerData = function(frames, name) {
    this.name = name;
    this.layerFrames = [];
    for(var i = 0; i < frames.length; i++) {
        this.layerFrames.push(new LayerDataFrame(frames[i]));
    }
}

LayerData.prototype.addBezier = function(bezier, frameAdjuster) {
    for(var i = 0; i < this.layerFrames.length; i++) {
        var layerFrame = this.layerFrames[i];
        layerFrame.addBezier(bezier, frameAdjuster);
    }
}

//--------------------------------------------------
// LayerDataFrame
//--------------------------------------------------
var LayerDataFrame = function(frame) {
    this.frame = frame;
    this.root = new GCodeDataBase();
    this.lastProtPos = new Vector2(0, 0);
}

LayerDataFrame.prototype.addBezier = function(bezier, frameAdjuster) {
    var croppedBezier = bezier.getCroppedBezier(this.frame);
    if (!croppedBezier) return;
    this.lastProtPos = croppedBezier.prot(this.root, this.frame, frameAdjuster, this.lastProtPos);
}
