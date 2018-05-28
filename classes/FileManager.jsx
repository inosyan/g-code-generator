//--------------------------------------------------
// FileManager
//--------------------------------------------------
function FileManager() {
}

FileManager.prototype.saveFiles = function(results) {
    var filePath = activeDocument.fullName.toString();
    if (!/\.ai$/.test(filePath)) {
        filePath = File.saveDialog('Save file name').toString();
    }
    if (!filePath) return;
    if (/\.ai$/.test(filePath)) {
        filePath = filePath.substr(0, filePath.length - 3);
    }
    var idx = filePath.lastIndexOf('/');
    var fileName = '';
    if (idx === -1) idx = filePath.lastIndexOf('\\');
    if (idx !== -1) {
        fileName = filePath.substr(idx + 1);
        filePath = filePath.substr(0, idx + 1);
    }
    var resCnt = results.length;
    for(var i = 0; i < resCnt; i++) {
        var res = results[i];
        var name = res.name;
        var output = res.output;
        var savePath = '';
        if (!!name) {
            savePath = filePath + name;
        } else {
            savePath = filePath + fileName;
            if (resCnt > 1) savePath += (i + 1);
        }
        if (!/\.txt$/.test(savePath)) {
            savePath += '.txt';
        }
        var fileObj = new File(savePath);
        fileObj.lineFeed = 'Unix'; 
        if (fileObj.open('w')) {
            fileObj.write(output);
            fileObj.close();
        }    
    }
}
