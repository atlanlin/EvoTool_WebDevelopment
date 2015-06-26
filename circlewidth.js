// center x plus radius to fin arc --> )
// 
window.onload = function() {
	initCircle();
	
	ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B2%3BGeneral.Enabled%3B1%23");
			
	ajaxGet("info.htm?cmd=%23021%3BINI Circle%3B2%3BGeneral.Enabled%3B1%23");
}

function initCircle() {
	
	
	
    drawCircle(circle, innerCircle);
	
	  
	
    element = document.getElementById('canvas');
    element.addEventListener('mousedown', startDragging, false);
    element.addEventListener('mousemove', drag, false);
    element.addEventListener('mouseup', stopDragging, false);
    element.addEventListener('mouseout', stopDragging, false);
	
	
	//element.addEventListener('touchdown', touchScreenMove, false);
	
	element.addEventListener('touchmove', t_Move);

	setInterval(updateCircleEvo, UPDATECIRCLEINTERVAL);
	
	
	$("#btnMeasure").click(function(){
	
			
			
			//ajaxGet("info.htm?cmd=%23021%3BEVO Circle "+queryString["toolNo"]+"%3B2%3BGeneral.Enabled%3B1%23");
			
			ajaxGet("cfg.ini", getValueFrominiFile);
			
		
			
			//setCookie("Circle Width " +queryString["toolNo"], $("#resultDisplay").val(),1);
			
			
		}
	);
	
	if(getCookie("resolution") == null)
	{
		setCookie("resolution","1",1);
	}
			
	resolution = parseInt(getCookie("resolution"));
	
	setPageScaleSize(resolution);
}


var Point = function (x, y) {
    this.x = x;
    this.y = y;
    return this;
}

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

function t_Move(e){
	
	e.preventDefault();
	
	tempcanvas = document.getElementById('canvas');
	var rect = tempcanvas.getBoundingClientRect();
	
	circle.point.x = e.targetTouches[0].clientX - rect.left;
	circle.point.y = e.targetTouches[0].clientY - rect.top;
	
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




function findMin(x, y) {
        if(x < y)
			return x
	return y
}

// mouse up & mouse out
function stopDragging(e) {
    deltaCenter = null;
	
}

function withinCircle(pt) {

return Math.pow(pt.x - circle.point.x, 2) + Math.pow(pt.y - circle.point.y, 2) < Math.pow(circle.radius, 2);
}

function getMousePos(canvas, e) {
	  
        var rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
}
	  
function mouseX(e) {
    
	var cx = document.getElementById('canvas');
    var mousePos = getMousePos(cx, e);
	return mousePos.x;
}

function mouseY(e) {
    
	var cy = document.getElementById('canvas');
    var mousePos = getMousePos(cy, e);
	return mousePos.y;
}

function drawCircle(circle, innerCircle) {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
	
	var calStartAngle = startAngle * Math.PI / 180;
	var calEndAngle = EndAngle * Math.PI / 180;
	
	if(IMG_HEIGHT != null)
	{
		endFrameY = IMG_HEIGHT - 2;
	
		endFrameX = IMG_WIDTH - 2;
	}
	
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    ctx.arc(circle.point.x, circle.point.y, innerCircle.radius, calStartAngle,calEndAngle,false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
	ctx.stroke();
	ctx.closePath();
	
	$("#xvalue").val(Math.round(circle.point.x));
	$("#yvalue").val(Math.round(circle.point.y));
	$("#startvalue").val(startAngle);
	$("#anglevalue").val(EndAngle);
	$("#outervalue").val(Math.round(circle.radius));
	$("#innervalue").val(Math.round(innerCircle.radius));
	
	document.querySelector('#circlevolume').value = Math.round(circle.radius);
	document.querySelector('#innercirclevolume').value = Math.round(innerCircle.radius);
	
	document.querySelector('#startangle').value = Math.round(startAngle);
	document.querySelector('#endangle').value = Math.round(EndAngle);
	
	
	//updateCircleEvo();

}

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

function outputStartAngle(size){
	var intSize = parseInt(size);

	startAngle = intSize;
	if(startAngle == 0 && EndAngle == 0)
		startAngle = 1;
	else if(startAngle == 360 && EndAngle == 360)
		startAngle = 359;
	

	drawCircle(circle, innerCircle);

}

function outputEndAngle(size){
	var intSize = parseInt(size);

	EndAngle = intSize;
	if(startAngle == 0 && EndAngle == 0)
		EndAngle = 1;
	else if(startAngle == 360 && EndAngle == 360)
		EndAngle = 359;	
	
			
	drawCircle(circle, innerCircle);

}

//update circle values to evo3
function updateCircleEvo()
{
		var centerX = $("#xvalue").val();
		var centerY = $("#yvalue").val();
		/* var calCenterX = centerX * mulCenterX;
		var calCenterY = centerY * mulCenterY; */
		
		var innerRadius = $("#innervalue").val();
		var outerRadius = $("#outervalue").val();
		//var calOuterRadius = outerRadius * mulOuterRadius;
		
		var startvalue = $("#startvalue").val();
		var anglevalue = $("#anglevalue").val();
		
		var nominalValue = $("#nv").val();
		var positive = $("#plus").val();
		var negative = $("#minus").val();
		
		var calCenterX = centerX * GLOBAL_SCALE;
		var calCenterY = centerY * GLOBAL_SCALE;
		
		var calInnerRadius = innerRadius * GLOBAL_SCALE;
		var calOuterRadius = outerRadius * GLOBAL_SCALE;
		
		
		/*var calStartValue = parseInt(360 - startAngle);
		
		var calDiffer = 0;
		
		var addDiffer = 0;
		
		
		if(startAngle <= 90 && startAngle > 0)
		{
			addDiffer = 270;
		}
		else if(startAngle > 90 && startAngle < 180)
		{
			addDiffer = 180;
		}
		else if(startAngle < 270)
		{
			addDiffer = 180;
		}
		else 
		{
			addDiffer = 0;
		}
		
		
		if(startAngle < EndAngle && EndAngle < 360)
		{
			calDiffer = EndAngle - startAngle;
		}
		else 
		{
			calDiffer = EndAngle + addDiffer;
		}*/
		
		var calDiffer = 0;
		
		if(startAngle < EndAngle)
		{
			calDiffer = EndAngle - startAngle;
		}
		else
		{
			var tempDiffer = startAngle - EndAngle;
			calDiffer = 360 - tempDiffer;
		}
			
		
		if ($("#lightToDark").is(":checked")) {
			ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B2%3BTransition%3B0%23");
        }
		else if($("#darkToLight").is(":checked")) {
            ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B2%3BTransition%3B1%23");
        }
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.Center.X%3B"+ calCenterX +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.Center.Y%3B"+ calCenterY +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.InnerRadius%3B"+ calInnerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.OuterRadius%3B"+ calOuterRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.StartAngle%3B"+ startvalue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.LengthAngle%3B"+ calDiffer +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BResult[0].Evaluation.NominalValue%3B"+ nominalValue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BResult[0].Evaluation.PlusTolerance%3B"+ positive +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BResult[0].Evaluation.MinusTolerance%3B"+ negative +"%23");

}




var element;
var circle = new Circle(new Point(50, 50), 50);
var innerCircle = new Circle(new Point(50, 50), 25);
var smallCircle = new Circle(new Point(100, 50), 10);

var deltaCenter = null;



// imginary frame
var startFrameX = 1;

var startFrameY = 1;

var endFrameX = 747;

var endFrameY = 560;

// settings

var maxRadius = 200;

var minRadius = 20;

var startAngle = 0;

var EndAngle = 360;

var UPDATECIRCLEINTERVAL = 2000;



