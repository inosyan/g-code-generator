//--------------------------------------------------
// GCodeDataBase
//--------------------------------------------------
function GCodeDataBase() {
    this.type = GCodeDataBase.TYPE ;
    this.children = [];
}

GCodeDataBase.TYPE = 'GCodeDataBase';

GCodeDataBase.prototype.translate = function (x, y) {
    var cnt = this.children.length;
    for(var i = 0; i < cnt; i++) {
        var gcodeData = this.children[i];
        gcodeData.translate(x, y);
    };
}

GCodeDataBase.prototype.addChild = function(child) {
    this.children.push(child);
}

GCodeDataBase.prototype.toString = function() {
    return this.children.join('\n');
}

GCodeDataBase.prototype.draw = function() {
    var gcodeStart = 'M05 S0\n\nG90\nG21\n';
    var gcodeEnd = '\nG4 P0\nM05 S0\nG0 F1000\nG0 X0 Y0\nM18\n';
    return gcodeStart + this.toString() + gcodeEnd;
}

GCodeDataBase.prototype.zeroRound = function(num) {
    num = Math.round(num * 10000) / 10000;
    return num.toFixed(4);
    return num;
}

GCodeDataBase.prototype.hasChildren = function() {
    return this.children.length > 0;
}

GCodeDataBase.prototype.clone = function() {
    var ret = new GCodeDataBase();
    for (var i = 0, cnt = this.children.length; i < cnt; i++) {
        ret.children.push(this.children[i].clone());
    }
    return ret;
}

//--------------------------------------------------
// GCodeDebug
//--------------------------------------------------
function GCodeDebug(comment) {
    GCodeDataBase.call(this);
    this.type = GCodeDebug.TYPE;
    this.comment = comment;
}

GCodeDebug.TYPE = 'GCodeDebug';

for(var key in GCodeDataBase.prototype) {
    GCodeDebug.prototype[key] = GCodeDataBase.prototype[key];
}

GCodeDebug.prototype.toString = function() {
    return '# ' + this.comment;
}

GCodeDebug.prototype.clone = function() {
    return new GCodeDebug(this.comment);
}

//--------------------------------------------------
// GCodeLaserOn
//--------------------------------------------------
function GCodeLaserOn() {
    GCodeDataBase.call(this);
    this.type = GCodeLaserOn.TYPE;
}

GCodeLaserOn.TYPE = 'GCodeLaserOn';

for(var key in GCodeDataBase.prototype) {
    GCodeLaserOn.prototype[key] = GCodeDataBase.prototype[key];
}

GCodeLaserOn.prototype.toString = function() {
    return 'M03 S255\nG4 P0\nG1 F600';
}

GCodeLaserOn.prototype.clone = function() {
    return new GCodeLaserOn();
}

//--------------------------------------------------
// GCodeLaserOff
//--------------------------------------------------
function GCodeLaserOff() {
    GCodeDataBase.call(this);
    this.type = GCodeLaserOff.TYPE;
}

GCodeLaserOff.TYPE = 'GCodeLaserOff';

for(var key in GCodeDataBase.prototype) {
    GCodeLaserOff.prototype[key] = GCodeDataBase.prototype[key];
}

GCodeLaserOff.prototype.toString = function() {
    return 'G4 P0\nM05 S0';
}

GCodeLaserOff.prototype.clone = function() {
    return new GCodeLaserOff();
}

//--------------------------------------------------
// GCodeTravel
//--------------------------------------------------
function GCodeTravel(x, y) {
    GCodeDataBase.call(this);
    this.type = GCodeTravel.TYPE;
    this.x = x;
    this.y = y;
}

GCodeTravel.TYPE = 'GCodeTravel';

for(var key in GCodeDataBase.prototype) {
    GCodeTravel.prototype[key] = GCodeDataBase.prototype[key];
}

GCodeTravel.prototype.translate = function(x, y) {
    this.x += x;
    this.y += y;
}

GCodeTravel.prototype.toString = function() {
    return 'G0 F1000\nG0 X' + this.zeroRound(this.x) + ' Y' + this.zeroRound(this.y) + '\nG4 P0';
}

GCodeTravel.prototype.clone = function() {
    return new GCodeTravel(this.x, this.y);
}

//--------------------------------------------------
// GCodeLinear
//--------------------------------------------------
function GCodeLinear(x, y) {
    GCodeTravel.call(this, x, y);
    this.type = GCodeLinear.TYPE;
}

GCodeLinear.TYPE = 'GCodeLinear';

for(var key in GCodeTravel.prototype) {
    GCodeLinear.prototype[key] = GCodeTravel.prototype[key];
}

GCodeLinear.prototype.toString = function() {
    return 'G1 X' + this.zeroRound(this.x) + ' Y' + this.zeroRound(this.y);
}

GCodeLinear.prototype.clone = function() {
    return new GCodeLinear(this.x, this.y);
}

//--------------------------------------------------
// GCodeArc
//--------------------------------------------------
function GCodeArc(x, y, i, j, isCCW) {
    GCodeDataBase.call(this);
    this.type = GCodeArc.TYPE;
    this.x = x;
    this.y = y;
    this.i = i;
    this.j = j;
    this.isCCW = isCCW;
}

GCodeArc.TYPE = 'GCodeLinear';

for(var key in GCodeDataBase.prototype) {
    GCodeArc.prototype[key] = GCodeDataBase.prototype[key];
}

GCodeArc.prototype.translate = function(x, y) {
    this.x += x;
    this.y += y;
}

GCodeArc.prototype.toString = function() {
    const code = this.isCCW ? 'G3' : 'G2';
    var argX = this.zeroRound(this.x);
    var argY = this.zeroRound(this.y);
    var argI = this.zeroRound(this.i);
    var argJ = this.zeroRound(this.j);
    return code + ' X' + argX + ' Y' + argY + ' I' + argI + ' J' + argJ;
}

GCodeArc.prototype.clone = function() {
    return new GCodeArc(this.x, this.y, this.i, this.j, this.isCCW);
}
