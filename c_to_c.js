// screen on load 
window.onload = function() {
//initialize circle on canvas
	initCircle();

	//enable function in evo 3 ckp file
	ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B2%3BGeneral.Enabled%3B1%23");
	ajaxGet("info.htm?cmd=%23021%3BINI Distance%3B2%3BGeneral.Enabled%3B1%23");
}

function initCircle() {
	
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

	// update both circle parameter at every certain interval
	setInterval(updateCircleEvo, UPDATECIRCLEINTERVAL);
	setInterval(updateCircle2Evo, UPDATECIRCLE2INTERVAL);
	
	// getting of result to display on text area
	$("#btnMeasure").click(function(){
			ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B2%3BOptionForType%3B4%23");
			ajaxGet("cfg.ini", getValueFrominiFile);
			//save screenshot of the current measurement taken
			saveScreenshot();
		}
	);
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
	
		if(withinCircle(p)) {
			//mouse pointer on the center for circle1
			deltaCenter = new Point(p.x - circle.point.x, p.y - circle.point.y);
			deltaCenter2 = null;
			
		}else if(withinCircle2(p)) {
			//mouse pointer on the center for circle2
			deltaCenter2 = new Point(p.x - circle2.point.x, p.y - circle2.point.y);
			deltaCenter = null;
			
		}
	
}

//mouse move
function drag(e) {
		 
	var p = new Point(mouseX(e), mouseY(e));
	
	if(withinCircle(p))
		this.style.cursor='move';
	else if(withinCircle2(p))
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
			
		}else if(deltaCenter2 != null) {
		
			circle2.point.x = (mouseX(e) - deltaCenter2.x);
			circle2.point.y = (mouseY(e) - deltaCenter2.y); 
			var radius = circle2.radius;
			if(circle2.point.x - radius < startFrameX)
			{
				circle2.point.x = radius;
			}
			if(circle2.point.y - radius < startFrameY)
			{
				circle2.point.y = radius;
			}
			if(circle2.point.x + radius > endFrameX)
			{
				circle2.point.x = endFrameX - radius; 
			}
			if(circle2.point.y + radius > endFrameY)
			{
				circle2.point.y = endFrameY - radius; 
			}
			
		}
	drawCircle(circle, innerCircle);

}

// moving of circle using touch scre
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
	}else if(withinCircle2(p))
	{
	
			// to prevent screen move or zooming when using touch screen
			e.preventDefault();
			circle2.point.x = e.targetTouches[0].clientX - rect.left;
			circle2.point.y = e.targetTouches[0].clientY - rect.top;
	
			var radius = circle2.radius;
			if(circle2.point.x - radius < startFrameX)
			{
				circle2.point.x = radius;
			}
			if(circle2.point.y - radius < startFrameY)
			{
				circle2.point.y = radius;
			}
			if(circle2.point.x + radius > endFrameX)
			{
				circle2.point.x = endFrameX - radius; 
			}
			if(circle2.point.y + radius > endFrameY)
			{
				circle2.point.y = endFrameY - radius; 
			}
	}

	drawCircle(circle, innerCircle);
}

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
	deltaCenter2 = null;
}

// return true if given points is within the circle, else false
function withinCircle(pt) {
	return Math.pow(pt.x - circle.point.x, 2) + Math.pow(pt.y - circle.point.y, 2) < Math.pow(circle.radius, 2);
}

function withinCircle2(pt) {
	return Math.pow(pt.x - circle2.point.x, 2) + Math.pow(pt.y - circle2.point.y, 2) < Math.pow(circle2.radius, 2);
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
	var calStartAngle1 = startAngle1 * Math.PI / 180;
	var calEndAngle1 = EndAngle1 * Math.PI / 180;
	
	var calStartAngle2 = startAngle2 * Math.PI / 180;
	var calEndAngle2 = EndAngle2 * Math.PI / 180;
	
	// set the imaginary frame limit to cater different image size
	// if no image, frame will set to default value
	if(IMG_HEIGHT != null)
	{
		endFrameY = IMG_HEIGHT - 2;
		endFrameX = IMG_WIDTH - 2;
	}
	
	//drawing of arc
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//circle 1
    ctx.beginPath();
    ctx.arc(circle.point.x, circle.point.y, circle.radius, calStartAngle1, calEndAngle1, false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
	ctx.stroke();
	ctx.closePath();
	//ctx.globalAlpha=0.4;
	//ctx.fill();

	ctx.beginPath();
    ctx.arc(circle.point.x, circle.point.y, innerCircle.radius, calStartAngle1, calEndAngle1,false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
	ctx.stroke();
	ctx.closePath();
	
	//circle 2
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
    ctx.arc(circle2.point.x, circle2.point.y, circle2.radius, calStartAngle2, calEndAngle2, false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
	ctx.stroke();
	ctx.closePath();
	//ctx.globalAlpha=0.4;
	//ctx.fill();

	ctx.beginPath();
    ctx.arc(circle2.point.x, circle2.point.y, innerCircle2.radius, calStartAngle2, calEndAngle2,false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
	ctx.stroke();
	ctx.closePath();
	
	//update values to the page
	$("#xvalue").val(Math.round(circle.point.x));
	$("#yvalue").val(Math.round(circle.point.y));
	//$("#startvalue").val(startAngle1);
	//$("#anglevalue").val(EndAngle1);
	//$("#outervalue").val(Math.round(circle.radius));
	//$("#innervalue").val(Math.round(innerCircle.radius));
	
	$("#xvalue2").val(Math.round(circle2.point.x));
	$("#yvalue2").val(Math.round(circle2.point.y));
	//$("#startvalue2").val(startAngle2);
	//$("#anglevalue2").val(EndAngle2);
	//$("#outervalue2").val(Math.round(circle2.radius));
	//$("#innervalue2").val(Math.round(innerCircle2.radius));
	
	// update value of the label beside the slider
	document.querySelector('#circlevolume').value = Math.round(circle.radius);
	document.querySelector('#innercirclevolume').value = Math.round(innerCircle.radius);
	
	document.querySelector('#startangle1').value = Math.round(startAngle1);
	document.querySelector('#endangle1').value = Math.round(EndAngle1);
	
	document.querySelector('#circlevolume2').value = Math.round(circle2.radius);
	document.querySelector('#innercirclevolume2').value = Math.round(innerCircle2.radius);
	
	document.querySelector('#startangle2').value = Math.round(startAngle2);
	document.querySelector('#endangle2').value = Math.round(EndAngle2);
	
	//updateCircleEvo();
	//updateCircle2Evo();

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

}

// change of start angle
function outputStartAngle1(size){
	var intSize = parseInt(size);

	startAngle1 = intSize;
	if(startAngle1 == 0 && EndAngle1 == 0)
		startAngle1 = 1;
	else if(startAngle1 == 360 && EndAngle1 == 360)
		startAngle1 = 359;
	

	drawCircle(circle, innerCircle);

}

// change of end angle
function outputEndAngle1(size){
	var intSize = parseInt(size);

	EndAngle1 = intSize;
	if(startAngle1 == 0 && EndAngle1 == 0)
		EndAngle1 = 1;
	else if(startAngle1 == 360 && EndAngle1 == 360)
		EndAngle1 = 359;	
	
			
	drawCircle(circle, innerCircle);

}


// for circle2 to update the outer circle radius, inner circle radius, start angle and end angle
function outputUpdate2(size) {

	var intSize = parseInt(size);

			if(intSize < maxRadius && intSize < findMin(circle2.point.x, circle2.point.y))
			{
				if((circle2.point.x + intSize) < endFrameX && (circle2.point.y + intSize) < endFrameY)
				{
					if(intSize >= innerCircle2.radius)
					circle2.radius = intSize;
				}
			}
	drawCircle(circle, innerCircle);

}
function outputInnerUpdate2(size){
	var intSize = parseInt(size);

			if(intSize < maxRadius && intSize < findMin(circle2.point.x, circle2.point.y))
			{
				if((circle2.point.x + intSize) < endFrameX && (circle2.point.y + intSize) < endFrameY)
				{
					if(intSize <= circle2.radius)
					innerCircle2.radius = intSize;
				}
			}
			
	drawCircle(circle, innerCircle);

}

function outputStartAngle2(size){
	var intSize = parseInt(size);

	startAngle2 = intSize;
	if(startAngle2 == 0 && EndAngle2 == 0)
		startAngle2 = 1;
	else if(startAngle2 == 360 && EndAngle2 == 360)
		startAngle2 = 359;
	

	drawCircle(circle, innerCircle);

}

function outputEndAngle2(size){
	var intSize = parseInt(size);

	EndAngle2 = intSize;
	if(startAngle2 == 0 && EndAngle2 == 0)
		EndAngle2 = 1;
	else if(startAngle2 == 360 && EndAngle2 == 360)
		EndAngle2 = 359;	
	
			
	drawCircle(circle, innerCircle);

}

//update circle values to evo3
function updateCircleEvo()
{
		var centerX = $("#xvalue").val();
		var centerY = $("#yvalue").val();
		
		//var innerRadius = $("#innervalue").val();
		//var outerRadius = $("#outervalue").val();
		//var startvalue = $("#startvalue").val();
		//var anglevalue = $("#anglevalue").val();
		
		var innerRadius = $("#innerRadiusValue1").val();
		var outerRadius = $("#outerRadiusValue1").val();
		
		var startvalue = $("#startAngleValue1").val();
		var anglevalue = $("#endAngleValue1").val();
		
		
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
		
		if(startAngle1 < EndAngle1)
		{
			calDiffer = EndAngle1 - startAngle1;
		}
		else
		{
			var tempDiffer = startAngle1 - EndAngle1;
			calDiffer = 360 - tempDiffer;
		}
		
		
		if ($("#clightToDark").is(":checked")) {
			ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B2%3BTransition_1%3B0%23");
        }
		else if($("#cdarkToLight").is(":checked")) {
            ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B2%3BTransition_1%3B1%23");
        }
		
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.Center.X%3B"+ calCenterX +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.Center.Y%3B"+ calCenterY +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.InnerRadius%3B"+ calInnerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.OuterRadius%3B"+ calOuterRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.StartAngle%3B"+ startvalue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.LengthAngle%3B"+ calDiffer +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.NominalValue%3B"+ nominalValue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.PlusTolerance%3B"+ positive +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.MinusTolerance%3B"+ negative +"%23");

}

//update circle values to evo3
function updateCircle2Evo()
{
		var centerX = $("#xvalue2").val();
		var centerY = $("#yvalue2").val();
		
		//var innerRadius = $("#innervalue2").val();
		//var outerRadius = $("#outervalue2").val();
		//var startvalue = $("#startvalue2").val();
		//var anglevalue = $("#anglevalue2").val();
		
		var innerRadius = $("#innerRadiusValue2").val();
		var outerRadius = $("#outerRadiusValue2").val();
		
		var startvalue = $("#startAngleValue2").val();
		var anglevalue = $("#endAngleValue2").val();
		
		var nominalValue = $("#nv").val();
		var positive = $("#plus").val();
		var negative = $("#minus").val();
		
		// multiple by scaling offset to match coordinates at different image resolution
		var calCenterX = centerX * GLOBAL_SCALE;
		var calCenterY = centerY * GLOBAL_SCALE;
		
		var calInnerRadius = innerRadius * GLOBAL_SCALE;
		var calOuterRadius = outerRadius * GLOBAL_SCALE;
		
		var calDiffer = 0;
		
		// calculation for getting the angle length which is required by the evo3 tools
		if(startAngle2 < EndAngle2)
		{
			calDiffer = EndAngle2 - startAngle2;
		}
		else
		{
			var tempDiffer = startAngle2 - EndAngle2;
			calDiffer = 360 - tempDiffer2;
		}
		
		
		if ($("#rlightToDark").is(":checked")) {
			ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B2%3BTransition_2%3B0%23");
        }
		else if($("#rdarkToLight").is(":checked")) {
            ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B2%3BTransition_2%3B1%23");
        }
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.Center.X%3B"+ calCenterX +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.Center.Y%3B"+ calCenterY +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.InnerRadius%3B"+ calInnerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.OuterRadius%3B"+ calOuterRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.StartAngle%3B"+ startvalue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.LengthAngle%3B"+ calDiffer +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.NominalValue%3B"+ nominalValue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.PlusTolerance%3B"+ positive +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.MinusTolerance%3B"+ negative +"%23");

}

var element;

// Determine circle1 coordinates and radius
var circle = new Circle(new Point(50, 50), 50);
var innerCircle = new Circle(new Point(50, 50), 25);

// Determine circle1 coordinates and radius
var circle2 = new Circle(new Point(50, 200), 50);
var innerCircle2 = new Circle(new Point(100, 50), 25);

var deltaCenter = null;
var deltaCenter2 = null;


// imginary frame
var startFrameX = 1;

var startFrameY = 1;

var endFrameX = 747;

var endFrameY = 560;

// settings
// min and max radius for each circle able to increase or decrease
var maxRadius = 200;

var minRadius = 20;

// update interval to evo3 e.g. 1sec == 1000
var UPDATECIRCLEINTERVAL = 2000;

var UPDATECIRCLE2INTERVAL = 4000;

// angle settings for drawing arcs
// settings circle1
var startAngle1 = 0;

var EndAngle1 = 360;

// settings for circle2
var startAngle2 = 0;

var EndAngle2= 360;
