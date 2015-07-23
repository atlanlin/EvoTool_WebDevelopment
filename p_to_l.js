(function(window) {


// holds all our boxes
var boxes2 = [];
// New, holds the 8 tiny boxes that will be our selection handles
// the selection handles will be in this order:
// 0  1  2
// 3     4
// 5  6  7
var selectionHandles = [];

// Hold canvas information
var canvas;
var ctx;
var WIDTH;
var HEIGHT;
var INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed
var EVO_UPDATE_INTERVAL = 2000;

var isValuesRetrieved = false;
var isDrag = false;
var isResizeDrag = false;
var expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
var mx, my; // mouse coordinates

 // when set to true, the canvas will redraw everything
 // invalidate() just sets this to false right now
 // we want to call invalidate() whenever we make a change
var canvasValid = false;

// The node (if any) being selected.
// If in the future we want to select multiple objects, this will get turned into an array
var mySel = null;

// The selection color and width. Right now we have a red selection with a small width
var mySelColor = '#CC0000';
var mySelWidth = 2;
var mySelBoxColor = 'darkred'; // New for selection boxes
var mySelBoxSize = 8;

// we use a fake canvas to draw individual shapes for selection testing
var ghostcanvas;
var gctx; // fake canvas context

// since we can drag from anywhere in a node
// instead of just its x/y corner, we need to save
// the offset of the mouse when we start dragging.
var offsetx, offsety;

// Padding and border style widths for mouse offsets
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

//flag for rectangle opacity
//var rectFlag = true;
var pointArrowDirFlag = "horizontal";
var pointFlag = false;

//flag for rectange 2 opacity
var lineArrowDirFlag = "horizontal";
var lineFlag = false;

var EVOToolName = "EVO PTL";
var EVOININame = "INI PTL";

// Box object to hold data
function Box2() {
  this.x = 0;
  this.y = 0;
  this.w = 1; // default width and height?
  this.h = 1;
  this.fill = '#444444';
}



Box2.prototype = {
  // this function will only erase the first object in the listStyleType
  // it will not erase the selected canvas object
  erase: function(context, optionalColor) {
	  
	context.clearRect(this.x - mySelBoxSize, this.y - mySelBoxSize, this.w + 2*mySelBoxSize, this.h + 2*mySelBoxSize);
  
  }
}

function displayTexts(startXtb, startYtb, endXtb, endYtb, widthtb, arrowDirFlag, inBox){
	var sx, sy, ex, ey, w;
	
	if(arrowDirFlag == "horizontal"){
		
		sx = inBox.x * GLOBAL_SCALE * GLOBAL_SCALE_X;
		sy = (inBox.y + parseInt(inBox.h/2))*GLOBAL_SCALE * GLOBAL_SCALE_Y;
		ex = (inBox.x + inBox.w) * GLOBAL_SCALE * GLOBAL_SCALE_X;
		ey = (inBox.y + parseInt(inBox.h/2)) * GLOBAL_SCALE * GLOBAL_SCALE_Y;
		w = Math.abs(inBox.h) * GLOBAL_SCALE * GLOBAL_SCALE_Y;
	}else{
		sx = (inBox.x + parseInt(inBox.w/2)) * GLOBAL_SCALE * GLOBAL_SCALE_X;
		sy = inBox.y * GLOBAL_SCALE * GLOBAL_SCALE_Y;
		ex = (inBox.x + parseInt(inBox.w/2)) * GLOBAL_SCALE * GLOBAL_SCALE_X;
		ey = (inBox.y + inBox.h) * GLOBAL_SCALE * GLOBAL_SCALE_Y;
		w = Math.abs(inBox.w) * GLOBAL_SCALE * GLOBAL_SCALE_X;
	}
	document.getElementById(startXtb).value=sx.toFixed(2);
	document.getElementById(startYtb).value=sy.toFixed(2);
	document.getElementById(endXtb).value=ex.toFixed(2);
	document.getElementById(endYtb).value=ey.toFixed(2);
	document.getElementById(widthtb).value=w.toFixed(2);
}

// New methods on the Box class
Box2.prototype = {
  // we used to have a solo draw function
  // but now each box is responsible for its own drawing
  // mainDraw() will call this with the normal canvas
  // myDown will call this with the ghost canvas with 'black'
  draw: function(context, optionalColor) {
      if (context === gctx) {
        context.fillStyle = 'black'; // always want black for the ghost canvas
      } else {
        context.fillStyle = this.fill;
      }
      
      // We can skip the drawing of elements that have moved off the screen:
      if (this.x > WIDTH || this.y > HEIGHT) return; 
      if (this.x + this.w < 0 || this.y + this.h < 0) return;
	  
      context.fillRect(this.x,this.y,this.w,this.h);
      
    // draw selection
    // this is a stroke along the box and also 8 new selection handles
    if (mySel === this) {
      context.strokeStyle = mySelColor;
      context.lineWidth = mySelWidth;
      context.strokeRect(this.x,this.y,this.w,this.h);
      
      // draw the boxes
      
      var half = mySelBoxSize / 2;
      
      // 0  1  2
      // 3     4
      // 5  6  7
      
      // top left, middle, right
      selectionHandles[0].x = this.x-half;
      selectionHandles[0].y = this.y-half;
      
      selectionHandles[1].x = this.x+this.w/2-half;
      selectionHandles[1].y = this.y-half;
      
      selectionHandles[2].x = this.x+this.w-half;
      selectionHandles[2].y = this.y-half;
      
      //middle left
      selectionHandles[3].x = this.x-half;
      selectionHandles[3].y = this.y+this.h/2-half;
      
      //middle right
      selectionHandles[4].x = this.x+this.w-half;
      selectionHandles[4].y = this.y+this.h/2-half;
      
      //bottom left, middle, right
      selectionHandles[6].x = this.x+this.w/2-half;
      selectionHandles[6].y = this.y+this.h-half;
      
      selectionHandles[5].x = this.x-half;
      selectionHandles[5].y = this.y+this.h-half;
      
      selectionHandles[7].x = this.x+this.w-half;
      selectionHandles[7].y = this.y+this.h-half;

      
      context.fillStyle = mySelBoxColor;
      for (var i = 0; i < 8; i ++) {
        var cur = selectionHandles[i];
        context.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
      }
	  
    }
	
    
  } // end draw

}

//Initialize a new Box, add it, and invalidate the canvas
function addRect(x, y, w, h, fill) {
  var rect = new Box2;
  rect.x = x;
  rect.y = y;
  rect.w = w
  rect.h = h;
  rect.fill = fill;
  boxes2.push(rect);
  invalidate();
}

// initialize our canvas, add a ghost canvas, set draw loop
// then add everything we want to intially exist on the canvas
function init2() {
  
	EVOToolName += " " +queryString["toolNo"];
	EVOININame += " " +queryString["toolNo"];
	
  //enable the distance command in EVO3
  ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B2%3BGeneral.Enabled%3B1%23");
  ajaxGet("info.htm?cmd=%23021%3B"+ EVOININame +"%3B2%3BGeneral.Enabled%3B1%23");
			

	//start the program to retrieve image
	ajaxGet("info.htm?cmd=%23002%23");	
	intervalUpdateStart();
	disableBtn("btnStart");
	disableBtn("btnMeasure");
	disableBtn("fileMeasure");
	setImgFlag(false);
	
	
  canvas = document.getElementById('canvas2');
  HEIGHT = canvas.height;
  WIDTH = canvas.width;
  ctx = canvas.getContext('2d');
  ghostcanvas = document.createElement('canvas');
  ghostcanvas.height = HEIGHT;
  ghostcanvas.width = WIDTH;
  gctx = ghostcanvas.getContext('2d');
  
  //fixes a problem where double clicking causes text to get selected on the canvas
  canvas.onselectstart = function () { return false; }
  
  // fixes mouse co-ordinate problems when there's a border or padding
  // see getMouse for more detail
  if (document.defaultView && document.defaultView.getComputedStyle) {
    stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)     || 0;
    stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)      || 0;
    styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
    styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)  || 0;
  }
  
  // make mainDraw() fire every INTERVAL milliseconds
  setInterval(mainDraw, INTERVAL);
  setInterval(evoComm, EVO_UPDATE_INTERVAL);
  
  // set our events. Up and down are for mobile dragging,
  // double click is for making new boxes
  canvas.onmousedown = myDown;
  canvas.onmouseup = myUp;
  //canvas.ondblclick = myDblClick;
  canvas.onmousemove = myMove;
  
  canvas.addEventListener("touchstart", myDown);
  canvas.addEventListener("touchend", myUp);
  canvas.addEventListener("touchmove", myMove);
  
  // set up the selection handle boxes
  for (var i = 0; i < 8; i ++) {
    var rect = new Box2;
    selectionHandles.push(rect);
  }
  
  // add custom initialization here:	
	
	$("#cbPointHor").change(function() {
		if(this.checked) {
			pointArrowDirFlag = "horizontal";
		}else{
			pointArrowDirFlag = "vertical";
		}
		canvasValid = false;
	});
	
	$("#cbLineHor").change(function() {
		if(this.checked) {
			lineArrowDirFlag = "horizontal";
		}else{
			lineArrowDirFlag = "vertical";
		}
		canvasValid = false;
	});
	
	$("#btnMeasure").click(function(){
			//not to confuse with previous result
			$("#resultDisplay").val("");
			//evoComm();
			ajaxGet("cfg.ini", getValueFrominiFile);
			saveScreenshot();
		}
	);
	
	$("#loadValues").click(function(){
			// add a large green rectangle
			addRect(0, 0, 60, 65, 'rgba(0,205,0,0.7)');
  
			// add a green-blue rectangle
			addRect(240, 120, 60, 65, 'rgba(2,165,165,0.7)');  
			//get settings
			ajaxGet("ptl.ini", getSettingFrominiFile);
			this.disabled = true;
			this.style.color="gray";
			undisableBtn("fileMeasure");
			undisableBtn("btnMeasure");
		}
	);

  
  // add a large green rectangle
  //addRect(0, 0, 60, 65, 'rgba(0,205,0,0.7)');
  
  // add a green-blue rectangle
  //addRect(240, 120, 60, 65, 'rgba(2,165,165,0.7)');  
  
  // add a smaller purple rectangle
  //addRect(45, 60, 25, 25, 'rgba(150,150,250,0.7)');	
}

function updateObjectsFunction(){
	//setting for point 1
	var in1sx = parseFloat($("#pointStartX").val());
	var in1sy = parseFloat($("#pointStartY").val());
	var in1ex = parseFloat($("#pointEndX").val());
	var in1ey = parseFloat($("#pointEndY").val());
	var in1w = parseFloat($("#pointWidth").val());
	
	var p1sx, p1sy, p1w, p1h;
	if(Math.abs(in1ey - in1sy) < 0.01){
		//ysame
		$('#cbPointHor').prop('checked', true);
		pointArrowDirFlag = "horizontal";
		p1sx = in1sx;
		p1sy = in1sy - in1w/2;
		p1w = in1ex - in1sx;
		p1h = in1w;
		
	}else if(Math.abs(in1ex - in1sx) < 0.01){
		//xsame
		$('#cbPointHor').prop('checked', false);
		pointArrowDirFlag = "vertical";
		p1sx = in1sx - in1w/2;
		p1sy = in1sy;
		p1w = in1w;
		p1h = in1ey - in1sy;
		
	}else{
		var yLen = Math.abs(in1ey - in1sy);
		var xLen = Math.abs(in1ex - in1sx);
		var degreeTheta = Math.atan(yLen/xLen)*180/Math.PI;
		if(degreeTheta < 45){
			//ysame
			$('#cbPointHor').prop('checked', true);
			pointArrowDirFlag = "horizontal";
			p1sx = in1sx;
			p1sy = in1sy - in1w/2;
			p1w = in1ex - in1sx;
			p1h = in1w;
			
		}else{
			//xsame
			$('#cbPointHor').prop('checked', false);
			pointArrowDirFlag = "vertical";
			p1sx = in1sx - in1w/2;
			p1sy = in1sy;
			p1w = in1w;
			p1h = in1ey - in1sy;
			
		}
	}
	
	p1sx = p1sx/(GLOBAL_SCALE*GLOBAL_SCALE_X);
	p1sy = p1sy/(GLOBAL_SCALE*GLOBAL_SCALE_Y);
	p1w = p1w/(GLOBAL_SCALE*GLOBAL_SCALE_X);
	p1h = p1h/(GLOBAL_SCALE*GLOBAL_SCALE_Y);
	
	if(p1sx <= 0 || p1sy <= 0 || (p1sx+p1w) > WIDTH || (p1sy+p1h) > HEIGHT || Math.abs(p1w) <= 10 || Math.abs(p1h) <= 10 || Math.abs(p1w*p1h) < 360){
		alert("Point set back to original position. ROI is very small or out boundary.");
		p1sx = boxes2[0].x;
		p1sy = boxes2[0].y;
		p1w = boxes2[0].w;
		p1h = boxes2[0].h;
	}
	
	boxes2[0].x = p1sx;
	boxes2[0].y = p1sy;
	boxes2[0].w = p1w;
	boxes2[0].h = p1h;
	
	
	//setting for point 2
	var in2sx = parseFloat($("#lineStartX").val());
	var in2sy = parseFloat($("#lineStartY").val());
	var in2ex = parseFloat($("#lineEndX").val());
	var in2ey = parseFloat($("#lineEndY").val());
	var in2w = parseFloat($("#lineWidth").val());
	
	var lsx, lsy, lw, lh;
	if(Math.abs(in2ey - in2sy) < 0.01){
		//ysame
		$('#cbLineHor').prop('checked', true);
		lineArrowDirFlag = "horizontal";
		lsx = in2sx;
		lsy = in2sy - in2w/2;
		lw = in2ex - in2sx;
		lh = in2w;
		
	}else if(Math.abs(in2ex - in2sx) < 0.01){
		//xsame
		$('#cbLineHor').prop('checked', false);
		lineArrowDirFlag = "vertical";
		lsx = in2sx - in2w/2;
		lsy = in2sy;
		lw = in2w;
		lh = in2ey - in2sy;
		
	}else{
		var yLen = Math.abs(in2ey - in2sy);
		var xLen = Math.abs(in2ex - in2sx);
		var degreeTheta = Math.atan(yLen/xLen)*180/Math.PI;
		if(degreeTheta < 45){
			//ysame
			$('#cbLineHor').prop('checked', true);
			lineArrowDirFlag = "horizontal";
			lsx = in2sx;
			lsy = in2sy - in2w/2;
			lw = in2ex - in2sx;
			lh = in2w;
			
		}else{
			//xsame
			$('#cbLineHor').prop('checked', false);
			lineArrowDirFlag = "vertical";
			lsx = in2sx - in2w/2;
			lsy = in2sy;
			lw = in2w;
			lh = in2ey - in2sy;
			
		}
	}
	
	lsx = lsx/(GLOBAL_SCALE*GLOBAL_SCALE_X);
	lsy = lsy/(GLOBAL_SCALE*GLOBAL_SCALE_Y);
	lw = lw/(GLOBAL_SCALE*GLOBAL_SCALE_X);
	lh = lh/(GLOBAL_SCALE*GLOBAL_SCALE_Y);
	
	if(lsx <= 0 || lsy <= 0 || (lsx+lw) > WIDTH || (lsy+lh) > HEIGHT || Math.abs(lw) <= 10 || Math.abs(lh) <= 10 || Math.abs(lw*lh) < 360){
		alert("Line set back to original position. ROI is very small or out boundary.");
		lsx = boxes2[1].x;
		lsy = boxes2[1].y;
		lw = boxes2[1].w;
		lh = boxes2[1].h;
	}
	
	boxes2[1].x = lsx;
	boxes2[1].y = lsy;
	boxes2[1].w = lw;
	boxes2[1].h = lh;
}

// consists of EVO communication commands
function evoComm() {
	if(isValuesRetrieved){
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B2%3BOptionForType%3B1%23");
		pointSettings();
		lineSettings();
		toleranceSettings();
	}
}		// end evoComm

//send settings for point
function pointSettings() {
	if (document.getElementById("pointDOL").checked) {
			ajaxGet('any.htm?cmd=%23021%3B'+ EVOToolName +'%3B2%3BTransition_1%3B1%23');
	}	
	
	if (document.getElementById("pointLOD").checked) {
			ajaxGet('any.htm?cmd=%23021%3B'+ EVOToolName +'%3B2%3BTransition_1%3B0%23');
	}
	
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.PointStart.X%3B"+$("#pointStartX").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.PointEnd.X%3B"+$("#pointEndX").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.PointStart.Y%3B"+$("#pointStartY").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.PointEnd.Y%3B"+$("#pointEndY").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.Width%3B"+$("#pointWidth").val()+"%23");
}

//send settings for line
function lineSettings() {
	if (document.getElementById("lineDOL").checked) {
			ajaxGet('any.htm?cmd=%23021%3B'+ EVOToolName +'%3B2%3BTransition_2%3B1%23');
	}
	
	if (document.getElementById("lineLOD").checked) {
			ajaxGet('any.htm?cmd=%23021%3B'+ EVOToolName +'%3B2%3BTransition_2%3B0%23');
	}
	
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos2.PointStart.X%3B"+$("#lineStartX").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos2.PointEnd.X%3B"+$("#lineEndX").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos2.PointStart.Y%3B"+$("#lineStartY").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos2.PointEnd.Y%3B"+$("#lineEndY").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos2.Width%3B"+$("#lineWidth").val()+"%23");
}

//send settings for tolerance
function toleranceSettings() {
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BResult[0].Evaluation.NominalValue%3B"+$("#nv").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BResult[0].Evaluation.PlusTolerance%3B"+$("#plus").val()+"%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BResult[0].Evaluation.MinusTolerance%3B"+$("#minus").val()+"%23");
}

//create a line and an arrow head
function Line(x1,y1,x2,y2){
        this.x1=x1;
        this.y1=y1;
        this.x2=x2;
        this.y2=y2;
    }
    Line.prototype.drawWithArrowheads=function(ctx){

        // arbitrary styling
        ctx.strokeStyle="blue";
        ctx.fillStyle="blue";
        ctx.lineWidth=1;

        // draw the line
        ctx.beginPath();
        ctx.moveTo(this.x1,this.y1);
        ctx.lineTo(this.x2,this.y2);
        ctx.stroke();

        // draw the starting arrowhead
        //var startRadians=Math.atan((this.y2-this.y1)/(this.x2-this.x1));
        //startRadians+=((this.x2>=this.x1)?-90:90)*Math.PI/180;
        //this.drawArrowhead(ctx,this.x1,this.y1,startRadians);
        // draw the ending arrowhead
        var endRadians=Math.atan((this.y2-this.y1)/(this.x2-this.x1));
        endRadians+=((this.x2>=this.x1)?90:-90)*Math.PI/180;
        this.drawArrowhead(ctx,this.x2,this.y2,endRadians);


    }
    Line.prototype.drawArrowhead=function(ctx,x,y,radians){
        ctx.save();
        ctx.beginPath();
        ctx.translate(x,y);
        ctx.rotate(radians);
        ctx.moveTo(0,0);
        ctx.lineTo(5,20);
        ctx.lineTo(-5,20);
        ctx.closePath();
        ctx.restore();
        ctx.fill();
    }


function arrow(context,p1,p2,size){//


	context.lineWidth=2;
	context.fillStyle = context.strokeStyle = '#099';
	
	
	// Rotate the context to point along the path
      var dx = p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy);
	  context.translate(p2.x,p2.y);
      context.rotate(Math.atan2(dy,dx));

      // line
      context.lineCap = 'round';
      //ctx.beginPath();
      context.moveTo(0,0);
      context.lineTo(-len,0);
      //ctx.closePath();
      context.stroke();

      // arrowhead
      //ctx.beginPath();
      context.moveTo(0,0);
      context.lineTo(-size,-size);
      context.lineTo(-size, size);
      //ctx.closePath();
      context.fill();

      //ctx.restore();
}


//wipes the canvas context
function clear(c) {
  c.clearRect(0, 0, WIDTH + mySelBoxSize, HEIGHT + mySelBoxSize);
}
// Main draw loop.
// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function mainDraw() {
  if (canvasValid == false) {
    clear(ctx);
    
	//to dynamically change the image size and canvas size
	var undefined;
	if(IMG_WIDTH !== undefined && IMG_HEIGHT !== undefined && IMG_WIDTH > 0 && IMG_HEIGHT > 0){
		WIDTH = IMG_WIDTH;
		HEIGHT = IMG_HEIGHT;
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		ghostcanvas.height = HEIGHT;
		ghostcanvas.width = WIDTH;
	}
	
    // Add stuff you want drawn in the background all the time here
	
    // draw all boxes
    var l = boxes2.length;
	
    for (var i = 0; i < l; i++) {
      boxes2[i].draw(ctx); // we used to call drawshape, but now each box draws itself
    }
    
    // Add stuff you want drawn on top all the time here
	
	
	//create text boxes2[1] is for line, boxes2[0] is for point
	ctx.font="20px Georgia";
	ctx.fillStyle = 'black';
	ctx.fillText("P",boxes2[0].x+boxes2[0].w-20,boxes2[0].y+20);
	ctx.fillText("L",boxes2[1].x+boxes2[1].w-20,boxes2[1].y+20);
	
	
	//var point1={x:10, y:20};
	//var point2={x:200, y:80};
	//arrow(ctx, point1, point2, 10);
    canvasValid = true;
	
	//calculation for EVO 3 parameters
	var lx1, ly1, lx2, ly2;
	if(lineArrowDirFlag == "horizontal"){
		lx1 = boxes2[1].x;
		ly1 = boxes2[1].y + boxes2[1].h/2;
		lx2 = boxes2[1].x + boxes2[1].w;
		ly2 = boxes2[1].y + boxes2[1].h/2;
	}else{
		lx1 = boxes2[1].x + boxes2[1].w/2;
		ly1 = boxes2[1].y;
		lx2 = boxes2[1].x + boxes2[1].w/2;
		ly2 = boxes2[1].y + boxes2[1].h;
	}
	// create a new line object
    var line=new Line(lx1,ly1,lx2,ly2);
    // draw the line
    line.drawWithArrowheads(ctx);
	
	
	//calculation for EVO 3 parameters
	var plx1, ply1, plx2, ply2;
	if(pointArrowDirFlag == "horizontal"){
		plx1 = boxes2[0].x;
		ply1 = boxes2[0].y + boxes2[0].h/2;
		plx2 = boxes2[0].x + boxes2[0].w;
		ply2 = boxes2[0].y + boxes2[0].h/2;
	}else{
		plx1 = boxes2[0].x + boxes2[0].w/2;
		ply1 = boxes2[0].y;
		plx2 = boxes2[0].x + boxes2[0].w/2;
		ply2 = boxes2[0].y + boxes2[0].h;
	}
	
	// create a new line object
    var pointLine=new Line(plx1,ply1,plx2,ply2);
    // draw the line
    pointLine.drawWithArrowheads(ctx);
	if(isValuesRetrieved){
		displayTexts('pointStartX', 'pointStartY', 'pointEndX', 'pointEndY', 'pointWidth', pointArrowDirFlag, boxes2[0]);
		displayTexts('lineStartX', 'lineStartY', 'lineEndX', 'lineEndY', 'lineWidth', lineArrowDirFlag, boxes2[1]);
	}
	//showProbeSettings();
	
	
/* 	// modified by weiling
	for (var i = 0; i < l; i++) {
		if(lineFlag==false) {
			boxes2[0].draw(ctx);
			pointLine.drawWithArrowheads(ctx);
		}else if(pointFlag==false) {
			boxes2[1].draw(ctx);
			line.drawWithArrowheads(ctx);
		}else{
			//boxes2[i].draw(ctx); // we used to call drawshape, but now each box draws itself
		}
    } */
	
  }
}


// Happens when the mouse is moving inside the canvas
function myMove(e){
	
  if (isDrag) {
	  e.preventDefault();
    getMouse(e);
    
    mySel.x = mx - offsetx;
    mySel.y = my - offsety;   
    
	
	//limit mouse movements
	if(mySel.x < 0)
		mySel.x = 0;
	else if(mySel.x + mySel.w > WIDTH)
		mySel.x = WIDTH - mySel.w;
	else if(mySel.x > WIDTH)
		mySel.x = WIDTH;
	else if(mySel.x + mySel.w < 0)
		mySel.x = 0 - mySel.w;
		
	if(mySel.y < 0)
		mySel.y = 0;
	else if(mySel.y + mySel.h > HEIGHT)
		mySel.y = HEIGHT - mySel.h;
	else if(mySel.y > HEIGHT)
		mySel.y = HEIGHT;
	else if(mySel.y + mySel.h < 0)
		mySel.y = 0 - mySel.h;
	
	
	
	
    // something is changing position so we better invalidate the canvas!
    invalidate();
  } else if (isResizeDrag) {
    // time ro resize!
	e.preventDefault();
    var oldx = mySel.x;
    var oldy = mySel.y;
    
	
		if(mx > WIDTH)
			mx = WIDTH;
		if(my > HEIGHT)
			my = HEIGHT;
		
		// for android bug
		if(mx < 0)
			mx = 0;
		if(my < 0)
			my = 0;
	
	
    // 0  1  2
    // 3     4
    // 5  6  7
    switch (expectResize) {
      case 0:
        mySel.x = mx;
        mySel.y = my;
        mySel.w += oldx - mx;
        mySel.h += oldy - my;
        break;
      case 1:
        mySel.y = my;
        mySel.h += oldy - my;
        break;
      case 2:
        mySel.y = my;
        mySel.w = mx - oldx;
        mySel.h += oldy - my;
        break;
      case 3:
        mySel.x = mx;
        mySel.w += oldx - mx;
        break;
      case 4:
        mySel.w = mx - oldx;
        break;
      case 5:
        mySel.x = mx;
        mySel.w += oldx - mx;
        mySel.h = my - oldy;
        break;
      case 6:
        mySel.h = my - oldy;
        break;
      case 7:
        mySel.w = mx - oldx;
        mySel.h = my - oldy;
        break;
    }
    
    invalidate();
  }
  
  getMouse(e);
  // if there's a selection see if we grabbed one of the selection handles
  if (mySel !== null && !isResizeDrag) {
    for (var i = 0; i < 8; i++) {
      // 0  1  2
      // 3     4
      // 5  6  7
      
      var cur = selectionHandles[i];
      
      // we dont need to use the ghost context because
      // selection handles will always be rectangles
	  
      if (mx >= cur.x && mx <= cur.x + mySelBoxSize*3 &&
          my >= cur.y && my <= cur.y + mySelBoxSize*3) {
        // we found one!
        expectResize = i;
        invalidate();
        
        switch (i) {
          case 0:
            this.style.cursor='nw-resize';
            break;
          case 1:
            this.style.cursor='n-resize';
            break;
          case 2:
            this.style.cursor='ne-resize';
            break;
          case 3:
            this.style.cursor='w-resize';
            break;
          case 4:
            this.style.cursor='e-resize';
            break;
          case 5:
            this.style.cursor='sw-resize';
            break;
          case 6:
            this.style.cursor='s-resize';
            break;
          case 7:
            this.style.cursor='se-resize';
            break;
        }
        return;
      }
      
    }
    // not over a selection box, return to normal
    isResizeDrag = false;
    expectResize = -1;
    this.style.cursor='auto';
  }
  
}

// Happens when the mouse is clicked in the canvas
function myDown(e){
	
  getMouse(e);
  
  if (mySel !== null && !isResizeDrag) {
    for (var i = 0; i < 8; i++) {
      // 0  1  2
      // 3     4
      // 5  6  7
      
      var cur = selectionHandles[i];
      
      // we dont need to use the ghost context because
      // selection handles will always be rectangles
	 
      if (mx >= cur.x && mx <= cur.x + mySelBoxSize*3 &&
          my >= cur.y && my <= cur.y + mySelBoxSize*3) {
        // we found one!
		e.preventDefault();
        expectResize = i;
		isResizeDrag = true;
        invalidate();
        return;
      }
      
    }
  /*
  //we are over a selection box
  if (expectResize !== -1) {
    isResizeDrag = true;
    return;
  }
  */
  
    // not over a selection box, return to normal
    isResizeDrag = false;
    expectResize = -1;
    this.style.cursor='auto';
  }
  
  clear(gctx);
  var l = boxes2.length;
  for (var i = l-1; i >= 0; i--) {
    // draw shape onto ghost context
    boxes2[i].draw(gctx, 'black');
    
    // get image data at the mouse x,y pixel
    var imageData = gctx.getImageData(mx, my, 1, 1);
    var index = (mx + my * imageData.width) * 4;
    
    // if the mouse pixel exists, select and break
    if (imageData.data[3] > 0) {
      mySel = boxes2[i];
      offsetx = mx - mySel.x;
      offsety = my - mySel.y;
      mySel.x = mx - offsetx;
      mySel.y = my - offsety;
      isDrag = true;
      
      invalidate();
      clear(gctx);
      return;
    }
    
  }
  // havent returned means we have selected nothing
  mySel = null;
  // clear the ghost canvas for next time
  clear(gctx);
  // invalidate because we might need the selection border to disappear
  invalidate();
}

function myUp(){
  isDrag = false;
  isResizeDrag = false;
  expectResize = -1;
}

// adds a new node
function myDblClick(e) {
  getMouse(e);
  // for this method width and height determine the starting X and Y, too.
  // so I left them as vars in case someone wanted to make them args for something and copy this code
  var width = 20;
  var height = 20;
  addRect(mx - (width / 2), my - (height / 2), width, height, 'rgba(220,205,65,0.7)');
}


function invalidate() {
  canvasValid = false;
}

// Sets mx,my to the mouse position relative to the canvas
// unfortunately this can be tricky, we have to worry about padding and borders
function getMouse(e) {
      var element = canvas, offsetX = 0, offsetY = 0;

      if (element.offsetParent) {
        do {
          offsetX += element.offsetLeft;
          offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
      }

      // Add padding and border style widths to offset
      offsetX += stylePaddingLeft;
      offsetY += stylePaddingTop;

      offsetX += styleBorderLeft;
      offsetY += styleBorderTop;

      mx = e.pageX - offsetX;
      my = e.pageY - offsetY;
	  
	  // for android bug
	if(mx < 0)
	{
			var rect = canvas.getBoundingClientRect();
			mx = e.targetTouches[0].clientX - rect.left;
			my = e.targetTouches[0].clientY - rect.top;
	}
}

function getSettingFrominiFile()
{
	
	if (xhr.readyState != 4)  {
		return; 
	}
		
		var resp = xhr.responseText;
		var settingVal;
		settingVal = getIniStr("ptl" + queryString["toolNo"], "p1rectStartX", resp);
		$("#pointStartX").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "p1rectStartY", resp);
		$("#pointStartY").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "p1rectEndX", resp);
		$("#pointEndX").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "p1rectEndY", resp);
		$("#pointEndY").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "p1rectWidth", resp);
		$("#pointWidth").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "p1recttransition", resp);
		if(settingVal == 0){
			document.getElementById("pointLOD").checked = true;
			document.getElementById("pointDOL").checked = false;
		}else{
			document.getElementById("pointLOD").checked = false;
			document.getElementById("pointDOL").checked = true;
		}
		
		
		settingVal = getIniStr("ptl" + queryString["toolNo"], "l1rectStartX", resp);
		$("#lineStartX").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "l1rectStartY", resp);
		$("#lineStartY").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "l1rectEndX", resp);
		$("#lineEndX").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "l1rectEndY", resp);
		$("#lineEndY").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "l1rectWidth", resp);
		$("#lineWidth").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "l1recttransition", resp);
		if(settingVal == 0){
			document.getElementById("lineLOD").checked = true;
			document.getElementById("lineDOL").checked = false;
		}else{
			document.getElementById("lineLOD").checked = false;
			document.getElementById("lineDOL").checked = true;
		}
		
		
		settingVal = getIniStr("ptl" + queryString["toolNo"], "nominalValue", resp);
		$("#nv").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "positive", resp);
		$("#plus").val(settingVal);
		settingVal = getIniStr("ptl" + queryString["toolNo"], "negative", resp);
		$("#minus").val(settingVal);
		//update to rectangle values
		updateObjectsFunction();
		isValuesRetrieved = true;
		canvasValid = false;
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();
window.init2 = init2;
})(window);