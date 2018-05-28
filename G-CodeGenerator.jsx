//--------------------------------------------------
// 
// G-CodeGenerator
// 
// ExtendScript for Illustrator
// 
//--------------------------------------------------

#include 'classes/GCode.jsx';
#include 'classes/Analyzer.jsx';
#include 'classes/NumTable.jsx';
#include 'classes/FileManager.jsx';
#include 'classes/PathUtil.jsx';
#include 'classes/Frame.jsx';
#include 'classes/Vector2.jsx';
#include 'classes/AdjRect.jsx';
#include 'classes/LayerData.jsx';
#include 'classes/Bezier.jsx';
#include 'classes/FrameAdjuster.jsx';

//--------------------------------------------------
// Execute
//--------------------------------------------------
var analyzer = new Analyzer();
var fileMngr = new FileManager();
analyzer.scan();
fileMngr.saveFiles(analyzer.getResults());
alert('Complete');
