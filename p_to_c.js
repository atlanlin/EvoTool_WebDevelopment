// screen on load 
window.onload = function() {
	//initialize square and circle on canvas
	
	EVOToolName += " " + queryString["toolNo"];
	EVOININame +=  " " + queryString["toolNo"];
	
	//addMemoryCirclesIntoDb("dbMemory1");
	//addMemoryPointsIntoDb("dbMemory2");
	
	initCircle();
	
	//start the program to retrieve image
	ajaxGet("info.htm?cmd=%23002%23");	
	//ajaxGet("cfg.ini", getValueFrominiFile);
	intervalUpdateStart();
	disableBtn("btnStart");
	disableBtn("btnMeasure");
	disableBtn("fileMeasure");
	setImgFlag(false);
	
	initSquare();
	
	
	
	//enable function in evo 3 ckp file
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B2%3BGeneral.Enabled%3B1%23");
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOININame +"%3B2%3BGeneral.Enabled%3B1%23");
	
	
	//ajaxGet("info.htm?cmd=%23021%3BEVO Distance "+ queryString["toolNo"] +"%3B2%3BGeneral.Enabled%3B1%23");
	//ajaxGet("info.htm?cmd=%23021%3BINI Distance "+ queryString["toolNo"] +"%3B2%3BGeneral.Enabled%3B1%23");
	
}

// circle code

function initCircle() {
	ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B2%3BOptionForType%3B2%23");	
    drawCircle(circle, innerCircle);
	
	// mouse handler
    element = document.getElementById('canvas');
	element.style.height = IMG_HEIGHT;
    element.addEventListener('mousedown', startDragging, false);
    element.addEventListener('mousemove', drag, false);
    element.addEventListener('mouseup', stopDragging, false);
    element.addEventListener('mouseout', stopDragging, false);
	
	// touch screen handler
	element.addEventListener('touchmove', t_Move);
	
	// getting of result to display on text area
	$("#btnMeasure").click(function(){
			$("#resultDisplay").val("");
			ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B2%3BOptionForType%3B2%23");
			ajaxGet("cfg.ini", getValueFrominiFile);
			//save screenshot of the current measurement taken
			saveScreenshot();
		}
	);
	
	$("#loadValues").click(function(){
			 // add a large green rectangle
			addRect(0, 0, 60, 65, 'rgba(0,205,0,0.7)');
			//get settings
			ajaxGet("ptc.ini", getSettingFrominiFile);
			//ajaxGet("ptc.ini", getCircleDetailsFrominiFile);
			//updateObjectsFunction();
			isValuesRetrieved = true;
			this.disabled = true;
			this.style.color="gray";
			undisableBtn("fileMeasure");
			undisableBtn("btnMeasure");
			loadCoordinates = true;
		}
	);
	
	/*$("#cbMemory1").change(function() {
		if(this.checked) {
			document.getElementById("dbMemory1").style.display="block";
		}else{
			document.getElementById("dbMemory1").style.display="none";
		}
		canvasValid = false;
	});
	
	$("#cbMemory2").change(function() {
		if(this.checked) {
			document.getElementById("dbMemory2").style.display="block";
		}else{
			document.getElementById("dbMemory2").style.display="none";
		}
		canvasValid = false;
	});*/
	
}

// circle point of x and y coordinates
var Point = function (x, y) {
    this.x = x;
    this.y = y;
    return this;
}

// circle details
var Circle = function (point, radius) {
    this.point = point;
    this.radius = radius;
    this.isInside = function (pt) {
        return Math.pow(pt.x - point.x, 2) + Math.pow(pt.y - point.y, 2) < Math.pow(radius, 2);
    };
    return this;
}

//mouse down
function startDragging(e) {

    var p = new Point(mouseX(e), mouseY(e));
		
		if(withinCircle(p)){
			//mouse pointer on the center
			deltaCenter = new Point(p.x - circle.point.x, p.y - circle.point.y);
		}
	
}

//mouse move
function drag(e) {

	var p = new Point(mouseX(e), mouseY(e));
	
	
	if(withinCircle(p))
		this.style.cursor='move';
	else 
		this.style.cursor='auto';

	// make sure it doesn't go out of frame
		if(deltaCenter != null) {
		
			circle.point.x = (mouseX(e) - deltaCenter.x);
			circle.point.y = (mouseY(e) - deltaCenter.y); 
			
			var radius = circle.radius;
			
			if(circle.point.x - radius < startFrameX)
			{
				circle.point.x = radius;
			}
			if(circle.point.y - radius < startFrameY)
			{
				circle.point.y = radius;
			}
			if(circle.point.x + radius > endFrameX)
			{
				circle.point.x = endFrameX - radius; 
			}
			if(circle.point.y + radius > endFrameY)
			{
				circle.point.y = endFrameY - radius; 
			}
			
			drawCircle(circle, innerCircle);
		}
	
}

// moving of circle using touch screen
function t_Move(e){
	
	tempcanvas = document.getElementById('canvas');
	var rect = tempcanvas.getBoundingClientRect();
	// get point or coordinates on touch
	var p = new Point(e.targetTouches[0].clientX - rect.left, e.targetTouches[0].clientY - rect.top);
	
	// move the circle accordingly allows to move only within the frame when touches the circle.
	if(withinCircle(p))
	{
		// to prevent screen move or zooming when using touch screen
		e.preventDefault();
		
		// move the circle according to where the user directs
		circle.point.x = e.targetTouches[0].clientX - rect.left;
		circle.point.y = e.targetTouches[0].clientY - rect.top;
	
		// reset coordinates if it is not within the canvas frame
		var radius = circle.radius;
			if(circle.point.x - radius < startFrameX)
			{
				circle.point.x = radius;
			}
			if(circle.point.y - radius < startFrameY)
			{
				circle.point.y = radius;
			}
			if(circle.point.x + radius > endFrameX)
			{
				circle.point.x = endFrameX - radius; 
			}
			if(circle.point.y + radius > endFrameY)
			{
				circle.point.y = endFrameY - radius; 
			}
			
		drawCircle(circle, innerCircle);
		mainDraw();
		}
}

// find minimum value
function findMin(x, y) {
	if(x < y)
		return x
return y
}

function findMax(x, y) {
	if(x > y)
		return x
return y
}

// mouse up & mouse out
function stopDragging(e) {
    deltaCenter = null;
}

// return true if given points is within the circle, else false
function withinCircle(pt) {
	return Math.pow(pt.x - circle.point.x, 2) + Math.pow(pt.y - circle.point.y, 2) < Math.pow(circle.radius, 2);
}

// getting mouse coordinates
function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
}

// return mouse X coordinate	  
function mouseX(e) {
	var cx = document.getElementById('canvas');
    var mousePos = getMousePos(cx, e);
	return mousePos.x;
}

// return mouse Y coordinate	
function mouseY(e) {
	var cy = document.getElementById('canvas');
    var mousePos = getMousePos(cy, e);
	return mousePos.y;
}

// drawing of inner and outer circle/arc
function drawCircle(circle, innerCircle) {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
	
	// calculate the radian given in degree 
	var calStartAngle = startAngle * Math.PI / 180;
	var calEndAngle = EndAngle * Math.PI / 180;
	
	// set the imaginary frame limit to cater different image size
	// if no image, frame will set to default value
	if(IMG_HEIGHT != null)
	{
		endFrameY = IMG_HEIGHT - 2;
		endFrameX = IMG_WIDTH - 2;
	}
	
	if(loadCoordinates == true)
	{
		//drawing of arc
		//ctx.clearRect(0, 0, canvas.width, canvas.height);
		//ctx.clearRect(circle.point.x, circle.point.y, circle.radius, circle.radius);
		ctx.beginPath();
		ctx.arc(circle.point.x, circle.point.y, circle.radius, calStartAngle, calEndAngle, false);
	
		ctx.globalAlpha=1;
	
		ctx.lineWidth = 3;
		ctx.strokeStyle = "red";
		ctx.stroke();
		ctx.closePath();
		//ctx.globalAlpha=0.4;
		//ctx.fill();

		ctx.beginPath();
		ctx.arc(circle.point.x, circle.point.y, innerCircle.radius, calStartAngle, calEndAngle,false);
	
		ctx.globalAlpha=1;
		
		ctx.lineWidth = 3;
		ctx.strokeStyle = "blue";
		ctx.stroke();
		ctx.closePath();
	
		//update values to the page
		$("#xvalue").val(Math.round(circle.point.x));
		$("#yvalue").val(Math.round(circle.point.y));
		//$("#startvalue").val(startAngle);
		//$("#anglevalue").val(EndAngle);
		//$("#outervalue").val(Math.round(circle.radius));
		//$("#innervalue").val(Math.round(innerCircle.radius));
	
		// update value of the label beside the slider
		document.querySelector('#circlevolume').value = Math.round(circle.radius);
		document.querySelector('#innercirclevolume').value = Math.round(innerCircle.radius);
	
		document.querySelector('#startangle').value = Math.round(startAngle);
		document.querySelector('#endangle').value = Math.round(EndAngle);
	
		//updateCircleEvo();
		//updateRectEvo();
	}
}

// increase or decrease the outer circle radius size
function outputUpdate(size) {

	var intSize = parseInt(size);

	if(intSize < maxRadius && intSize < findMin(circle.point.x, circle.point.y))
	{
		if((circle.point.x + intSize) < endFrameX && (circle.point.y + intSize) < endFrameY)
		{
			if(intSize >= innerCircle.radius)
				circle.radius = intSize;
		}
	}
			
	drawCircle(circle, innerCircle);
	mainDraw();

}

// increase or decrease the inner circle radius size
function outputInnerUpdate(size){
	var intSize = parseInt(size);

	if(intSize < maxRadius && intSize < findMin(circle.point.x, circle.point.y))
	{
		if((circle.point.x + intSize) < endFrameX && (circle.point.y + intSize) < endFrameY)
		{
			if(intSize <= circle.radius)
				innerCircle.radius = intSize;
		}
	}
			
	drawCircle(circle, innerCircle);
	mainDraw();
}

// change of start angle
function outputStartAngle(size){
	var intSize = parseInt(size);

	if(EndAngle > intSize)
	{
		startAngle = intSize;
	}
	if(startAngle == 0 && EndAngle == 0)
		startAngle = 1;
	else if(startAngle == 360 && EndAngle == 360)
		startAngle = 359;

	drawCircle(circle, innerCircle);
}

// change of end angle
function outputEndAngle(size){
	var intSize = parseInt(size);

	if(startAngle < intSize)
	{
		EndAngle = intSize;
	}
	if(startAngle == 0 && EndAngle == 0)
		EndAngle = 1;
	else if(startAngle == 360 && EndAngle == 360)
		EndAngle = 359;	
	
			
	drawCircle(circle, innerCircle);

}

//update circle values to evo3
function updateCircleEvo()
{
	if(isValuesRetrieved)
	{	
		var centerX = $("#xvalue").val();
		var centerY = $("#yvalue").val();

		//var innerRadius = $("#innervalue").val();
		//var outerRadius = $("#outervalue").val();
		//var startvalue = $("#startvalue").val();
		//var anglevalue = $("#anglevalue").val();
		
		var innerRadius = $("#innerRadiusValue").val();
		var outerRadius = $("#outerRadiusValue").val();
		
		var startvalue = $("#startAngleValue").val();
		var anglevalue = $("#endAngleValue").val();
		
		
		var nominalValue = $("#nv").val();
		var positive = $("#plus").val();
		var negative = $("#minus").val();
		
		// multiple by scaling offset to match coordinates at different image resolution
		var calCenterX = centerX * GLOBAL_SCALE * GLOBAL_SCALE_X;
		var calCenterY = centerY * GLOBAL_SCALE * GLOBAL_SCALE_Y;
	
		var maxGLOBAL_SCALE = findMax(GLOBAL_SCALE_X, GLOBAL_SCALE_Y);
	
		var calInnerRadius = innerRadius * GLOBAL_SCALE * maxGLOBAL_SCALE;
		var calOuterRadius = outerRadius * GLOBAL_SCALE * maxGLOBAL_SCALE;
		
		var calDiffer = 0;
		
		// calculation for getting the angle length which is required by the evo3 tools
		if(startAngle < EndAngle)
		{
			calDiffer = EndAngle - startAngle;
		}
		else
		{
			var tempDiffer = startAngle - EndAngle;
			calDiffer = 360 - tempDiffer;
		}
		
		if ($("#clightToDark").is(":checked")) {
			ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B2%3BTransition_2%3B0%23");
		}
		else if($("#cdarkToLight").is(":checked")) {
			ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B2%3BTransition_2%3B1%23");
		}

		// update circle parameters to evo3	
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BCirclePos.Center.X%3B"+ calCenterX +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BCirclePos.Center.Y%3B"+ calCenterY +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BCirclePos.InnerRadius%3B"+ calInnerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BCirclePos.OuterRadius%3B"+ calOuterRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BCirclePos.StartAngle%3B"+ startvalue +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BCirclePos.LengthAngle%3B"+ calDiffer +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BResult[0].Evaluation.NominalValue%3B"+ nominalValue +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BResult[0].Evaluation.PlusTolerance%3B"+ positive +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BResult[0].Evaluation.MinusTolerance%3B"+ negative +"%23");
	}	
}

//update rect values to evo3
function updateRectEvo()
{
	if(isValuesRetrieved)
	{
		var startX = $("#tbStartX").val();
		var endX = $("#tbEndX").val();
		var startY = $("#tbStartY").val();
		var endY = $("#tbEndY").val();
		var width = $("#tbWidth").val();
		/*var calStartX = startX * GLOBAL_SCALE;
		var calStartY = startY * GLOBAL_SCALE;
		var calEndX = endX * GLOBAL_SCALE;
		var calEndY = endY * GLOBAL_SCALE;
		var calWidth = width * GLOBAL_SCALE;*/
		
		var calStartX = stx;
		var calStartY = sty;
		var calEndX = edx;
		var calEndY = edy;
		var calWidth = wi;
		
		var nominalValue = $("#nv").val();
		var positive = $("#plus").val();
		var negative = $("#minus").val();
		
		if ($("#rlightToDark").is(":checked")) {
			ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B2%3BTransition_1%3B0%23");
        }
		else if($("#rdarkToLight").is(":checked")) {
            ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B2%3BTransition_1%3B1%23");
        }
		
		// update square parameters to evo3
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.PointStart.X%3B"+ calStartX +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.PointEnd.X%3B"+ calEndX +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.PointStart.Y%3B"+ calStartY +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.PointEnd.Y%3B"+ calEndY +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BRecPos.Width%3B"+ calWidth +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BResult[0].Evaluation.NominalValue%3B"+ nominalValue +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BResult[0].Evaluation.PlusTolerance%3B"+ positive +"%23");
		ajaxGet("info.htm?cmd=%23021%3B"+ EVOToolName +"%3B1%3BResult[0].Evaluation.MinusTolerance%3B"+ negative +"%23");
	}	
}


    
var element;

// Determine circle1 coordinates and radius
var circle = new Circle(new Point(50, 150), 50);
var innerCircle = new Circle(new Point(50, 150), 25);


var deltaCenter = null;

// canvas frame settings
// imginary frame
var startFrameX = 1;

var startFrameY = 1;

var endFrameX = 747;

var endFrameY = 570;

// settings
// min and max radius for each circle able to increase or decrease
var maxRadius = 300;

var minRadius = 0;

//angle settings for drawing arcs
var startAngle = 0;

var EndAngle = 360;


//rect code
{

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

/*function displayTexts(){
	document.getElementById('tbStartX').value=boxes2[0].x;
	document.getElementById('tbEndX').value=boxes2[0].x+boxes2[0].w;
	document.getElementById('tbStartY').value=boxes2[0].y;
	document.getElementById('tbEndY').value=boxes2[0].y+boxes2[0].h;
	if(arrowDirFlag == "horizontal")
	{
		document.getElementById('tbWidth').value=boxes2[0].h;
		var tempStartY = parseInt(boxes2[0].y);
		var tempEndY = parseInt(boxes2[0].y+boxes2[0].h);
		var avgY = (tempStartY + tempEndY) / 2 ;
		document.getElementById('tbStartY').value=avgY;
		document.getElementById('tbEndY').value=avgY;
	}
	else
	{
		document.getElementById('tbWidth').value=boxes2[0].w;
		var tempStartX = parseInt(boxes2[0].x);
		var tempEndX = parseInt(boxes2[0].x+boxes2[0].w);
		var avgX = (tempStartX + tempEndX) / 2 ;
		document.getElementById('tbStartX').value=avgX;
		document.getElementById('tbEndX').value=avgX;
	
	
	}
}*/
// update rect text boxes values
function displayTexts(startXtb, startYtb, endXtb, endYtb, widthtb, inBox){
	
	if(arrowDirFlag == "horizontal"){
		
		// multiple by scaling offset to match coordinates at different image resolution
		stx = inBox.x * GLOBAL_SCALE * GLOBAL_SCALE_X;
		sty = (inBox.y + parseInt(inBox.h/2))* GLOBAL_SCALE * GLOBAL_SCALE_Y;
		edx = (inBox.x + inBox.w) * GLOBAL_SCALE * GLOBAL_SCALE_X;
		edy = (inBox.y + parseInt(inBox.h/2)) * GLOBAL_SCALE * GLOBAL_SCALE_Y;
		wi = Math.abs(inBox.h) * GLOBAL_SCALE * GLOBAL_SCALE_Y;
	}else{
		stx = (inBox.x + parseInt(inBox.w/2)) * GLOBAL_SCALE * GLOBAL_SCALE_X;
		sty = inBox.y * GLOBAL_SCALE * GLOBAL_SCALE_Y;
		edx = (inBox.x + parseInt(inBox.w/2)) * GLOBAL_SCALE * GLOBAL_SCALE_X;
		edy = (inBox.y + inBox.h) * GLOBAL_SCALE * GLOBAL_SCALE_Y;
		wi = Math.abs(inBox.w) * GLOBAL_SCALE * GLOBAL_SCALE_X;
	}
	document.getElementById(startXtb).value=parseInt(stx);
	document.getElementById(startYtb).value=parseInt(sty);
	document.getElementById(endXtb).value=parseInt(edx);
	document.getElementById(endYtb).value=parseInt(edy);
	document.getElementById(widthtb).value=parseInt(wi);
	
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
function initSquare() {
  canvas = document.getElementById('canvas');
  canvas.height = endFrameY;
  // get canvas height
  HEIGHT = canvas.height;
  //get canvas width
  WIDTH = canvas.width;
  ctx = canvas.getContext('2d');
  
  ghostcanvas = document.createElement('canvas');
  ghostcanvas.height = HEIGHT;
  ghostcanvas.height = endFrameY;
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
  setInterval(updateRectEvo, UPDATERECTINTERVAL);
  setInterval(updateCircleEvo, UPDATECIRCLEINTERVAL);
 
  
  // set our events. Up and down are for dragging,
  // double click is for making new boxes
  canvas.onmousedown = myDown;
  canvas.onmouseup = myUp;
  canvas.onmousemove = myMove;
  
  // touch screen listener
  canvas.addEventListener("touchstart", myDown);
  canvas.addEventListener("touchend", myUp);
  canvas.addEventListener("touchmove", myMove);
  
  
  // set up the selection handle boxes
  for (var i = 0; i < 8; i ++) {
    var rect = new Box2;
    selectionHandles.push(rect);
  }
  
  // add custom initialization here:

  $("input[name='toolChoice']").change(function(){
		if($("input[name='toolChoice']:radio:checked").val()=="evoWidth"){
			rectFlag=true;
		}
		else if($("input[name='toolChoice']:radio:checked").val()=="evoCircle"){
			//alert(String(boxes2[0].x));
			rectFlag=false;
			
		}else{
			rectFlag=true;
		}
	});


	$("#dbArrow").change(function(){
		if($("#dbArrow").val() == "vertical"){
			arrowDirFlag = "vertical";
		}else{
			arrowDirFlag = "horizontal";
		}
	});
	
	$("#cbArrowHor").change(function() {
		if(this.checked) {
			arrowDirFlag = "horizontal";
		}else{
			arrowDirFlag = "vertical";
		}
		//updateCircleEvo();
		//updateRectEvo();
	});
	
  
  
  // add a large green rectangle(MAIN DRAW)
  //addRect(0, 0, 60, 65, 'rgba(0,205,0,0.7)');
  
  // add a green-blue rectangle
  //addRect(240, 120, 40, 40, 'rgba(2,165,165,0.7)');  
  
  // add a smaller purple rectangle
  //addRect(45, 60, 25, 25, 'rgba(150,150,250,0.7)');
}

function updateObjectsFunction(){
	var in1sx = parseFloat($("#tbStartX").val());
	var in1sy = parseFloat($("#tbStartY").val());
	var in1ex = parseFloat($("#tbEndX").val());
	var in1ey = parseFloat($("#tbEndY").val());
	var in1w = parseFloat($("#tbWidth").val());
	
	var p1sx, p1sy, p1w, p1h;
	if(Math.abs(in1ey - in1sy) < 0.01){
		//ysame
		$('#cbArrowHor').prop('checked', true);
		arrowDirFlag = "horizontal";
		p1sx = in1sx;
		p1sy = in1sy - in1w/2;
		p1w = in1ex - in1sx;
		p1h = in1w;
		
	}else if(Math.abs(in1ex - in1sx) < 0.01){
		//xsame
		$('#cbArrowHor').prop('checked', false);
		arrowDirFlag = "vertical";
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
			$('#cbArrowHor').prop('checked', true);
			arrowDirFlag = "horizontal";
			p1sx = in1sx;
			p1sy = in1sy - in1w/2;
			p1w = in1ex - in1sx;
			p1h = in1w;
			
		}else{
			//xsame
			$('#cbArrowHor').prop('checked', false);
			arrowDirFlag = "vertical";
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
		//alert("Point set back to original position. ROI is very small or out boundary.");
		p1sx = boxes2[0].x;
		p1sy = boxes2[0].y;
		p1w = boxes2[0].w;
		p1h = boxes2[0].h;
	}
	
	boxes2[0].x = p1sx;
	boxes2[0].y = p1sy;
	boxes2[0].w = p1w;
	boxes2[0].h = p1h;
	
	
}

function getSettingFrominiFile()
{
	var respValue;
	if (xhr.readyState != 4)  {
		/*
		responseCnt++;
		if(responseCnt > 2){
			ajaxGet("cfg.ini", getValueFrominiFile);
			responseCnt = 0;
			console.log("not ready state");
		}
		*/
		return; 
	}

		var resp = xhr.responseText;
		
		respValue = getIniStr(INICat + queryString["toolNo"], "centerX", resp);
		circle.point.x = Math.round(parseInt(respValue) / GLOBAL_SCALE_X / GLOBAL_SCALE);

		respValue = getIniStr(INICat + queryString["toolNo"], "centerY", resp);
		circle.point.y = Math.round(parseInt(respValue) / GLOBAL_SCALE_Y / GLOBAL_SCALE);
		
		var maxGLOBAL_SCALE = findMax(GLOBAL_SCALE_X, GLOBAL_SCALE_Y);
		
		respValue = getIniStr(INICat + queryString["toolNo"], "innerRadius", resp);
		innerCircle.radius = parseInt(respValue) / GLOBAL_SCALE / maxGLOBAL_SCALE;
		
		respValue = getIniStr(INICat + queryString["toolNo"], "outerRadius", resp);
		circle.radius = parseInt(respValue) / GLOBAL_SCALE / maxGLOBAL_SCALE;
		
		respValue = getIniStr(INICat + queryString["toolNo"], "startAngle", resp);
		startAngle = parseInt(respValue);
		
		respValue = getIniStr(INICat + queryString["toolNo"], "angleLength", resp);
		EndAngle = parseInt(respValue) + startAngle;
		
		// in case everything is 0
		if(circle.point.x == 0 && circle.point.y == 0 && circle.radius == 0 && EndAngle == 0)
		{
			circle.point.x = 50;
			circle.point.y = 50;
			circle.radius = 50;
			innerCircle.radius = 25;
			startAngle = 0;
			EndAngle = 360;
		}
		
		if(circle.point.x + circle.radius > endFrameX || circle.point.y + circle.radius > endFrameY || circle.radius < 25)
		{
			circle.point.x = 50;
			circle.point.y = 50;
			circle.radius = 50;
			innerCircle.radius = 25;
			startAngle = 0;
			EndAngle = 360;
		}
		
		respValue = getIniStr(INICat + queryString["toolNo"], "transition", resp);
		
		if(respValue == 0){
			document.getElementById("clightToDark").checked = true;
			document.getElementById("cdarkToLight").checked = false;
		}else{
			document.getElementById("clightToDark").checked = false;
			document.getElementById("cdarkToLight").checked = true;
		}
		
		//////////////////////////////////////////////////////////////////////////////////////////////////
		
		var settingVal;
		
		settingVal = getIniStr(INICat + queryString["toolNo"], "rectStartX", resp);
		if(settingVal == 0)
			settingVal = 0;
		$("#tbStartX").val(settingVal);
		
		settingVal = getIniStr(INICat + queryString["toolNo"], "rectStartY", resp);
		if(settingVal == 0)
			settingVal = 43;
		$("#tbStartY").val(settingVal);
		
		settingVal = getIniStr(INICat + queryString["toolNo"], "rectEndX", resp);
		if(settingVal == 0)
			settingVal = 82;
		$("#tbEndX").val(settingVal);
		
		settingVal = getIniStr(INICat + queryString["toolNo"], "rectEndY", resp);
		if(settingVal == 0)
			settingVal = 43;
		$("#tbEndY").val(settingVal);
		
		settingVal = getIniStr(INICat + queryString["toolNo"], "rectWidth", resp);
		if(settingVal == 0)
			settingVal = 88;
		$("#tbWidth").val(settingVal);
		
		settingVal = getIniStr(INICat + queryString["toolNo"], "recttransition", resp);
		
		if(settingVal == 0){
			document.getElementById("rlightToDark").checked = true;
			document.getElementById("rdarkToLight").checked = false;
		}else{
			document.getElementById("rlightToDark").checked = false;
			document.getElementById("rdarkToLight").checked = true;
		}
		
		settingVal = getIniStr(INICat + queryString["toolNo"], "nominalValue", resp);
		$("#nv").val(settingVal);
		settingVal = getIniStr(INICat + queryString["toolNo"], "positive", resp);
		$("#plus").val(settingVal);
		settingVal = getIniStr(INICat + queryString["toolNo"], "negative", resp);
		$("#minus").val(settingVal);
		
		//alert(circle.radius);
		drawCircle(circle, innerCircle);
		$("#xvalue").val(circle.point.x);
		
		$("#yvalue").val(circle.point.y);
		
		document.querySelector('#outerRadiusValue').value = Math.round(circle.radius);
		
		document.querySelector('#innerRadiusValue').value = Math.round(innerCircle.radius);
		
		document.querySelector('#startAngleValue').value = Math.round(startAngle);
		document.querySelector('#endAngleValue').value = Math.round(EndAngle);
		
		//update to rectangle values
		updateObjectsFunction();
		isValuesRetrieved = true;
		canvasValid = false;
}

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


function arrow(context,p1,p2,size){

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
  //c.clearRect(0, 0, WIDTH, HEIGHT);
  c.clearRect(0, 0, WIDTH + mySelBoxSize, HEIGHT + mySelBoxSize);
}

// Main draw loop.
// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function mainDraw() {
  if (canvasValid == false) {
    clear(ctx);
    
	drawCircle(circle, innerCircle);
    // Add stuff you want drawn in the background all the time here
	
	// set the imaginary frame limit to cater different image size
	// if no image, frame will set to default value
	if(IMG_WIDTH != null && IMG_HEIGHT != null){
		WIDTH = IMG_WIDTH;
		HEIGHT = IMG_HEIGHT;
	}
	else{
		WIDTH = endFrameX;
		HEIGHT = endFrameY;
	
	}
	
		// draw all boxes
		var l = boxes2.length;
	
		
		if(rectFlag==false){
			boxes2[0].erase(ctx);
		}
	
		for (var i = 0; i < l; i++) {
			boxes2[i].draw(ctx); // we used to call drawshape, but now each box draws itself
		}
    
		// Add stuff you want drawn on top all the time here
		//var point1={x:10, y:20};
		//var point2={x:200, y:80};
		//arrow(ctx, point1, point2, 10);
		//canvasValid = true;
	
	
		var lx1, ly1, lx2, ly2;
		if(arrowDirFlag == "horizontal"){
			lx1 = boxes2[0].x;
			ly1 = boxes2[0].y + boxes2[0].h/2;
			lx2 = boxes2[0].x + boxes2[0].w;
			ly2 = boxes2[0].y + boxes2[0].h/2;
		}else{
			lx1 = boxes2[0].x + boxes2[0].w/2;
			ly1 = boxes2[0].y;
			lx2 = boxes2[0].x + boxes2[0].w/2;
			ly2 = boxes2[0].y + boxes2[0].h;
		}
		// create a new line object
		var line=new Line(lx1,ly1,lx2,ly2);
		// draw the line
		line.drawWithArrowheads(ctx);
	
		//displayTexts();
		
			displayTexts("tbStartX", "tbStartY", "tbEndX", "tbEndY", "tbWidth", boxes2[0]);
		
		//updateCircleEvo();
		//updateRectEvo();
	
	
  }
}


// Happens when the mouse is moving inside the canvas
function myMove(e){
	
	getMouse(e);
	if (isDrag) {
		e.preventDefault();
		if(mySel.x >= 0 && mySel.y >= 0)
		{
			mySel.x = mx - offsetx;
			mySel.y = my - offsety;   
		}
	
	//alert(mySel.x);
		
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
		// time to resize!
		e.preventDefault();
		var oldx = mySel.x;
		var oldy = mySel.y;
		//alert(mx);
		
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
				e.preventDefault();
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
	var element = canvas, offsetX = 5, offsetY = 5;

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

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();


// rect declarations
{
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
var UPDATERECTINTERVAL = 2000;
var UPDATECIRCLEINTERVAL = 5000;

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
var rectFlag = true;
var arrowDirFlag = "horizontal";

//startx, starty, endx, endy, width coordinates or values.
var stx, sty, edx, edy, wi;


var EVOToolName = "EVO PTC";

var EVOININame = "INI PTC";

var INICat = "ptc";

var isValuesRetrieved = false;

var loadCoordinates = false;
}


}