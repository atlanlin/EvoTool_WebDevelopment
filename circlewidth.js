// center x plus radius to fin arc --> )
// 
window.onload = function() {
	initCircle();
	
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

	
	$("#set").click(function(){
		
		updateCircleEvo();
		
		}
	);
		
	
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
	
		
	if(clicked == false)
	{
		
		
		if(withinCircle(p)) {
			
			//mouse pointer on the center
			deltaCenter = new Point(p.x - circle.point.x, p.y - circle.point.y);
			
			
		}
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
	clicked = false;
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
	
	
	
	
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(circle.point.x, circle.point.y, circle.radius, 0, Math.PI*2, false);
	//ctx.globalAlpha=0.4;
	//ctx.fill();

    ctx.arc(circle.point.x, circle.point.y, innerCircle.radius, 0,Math.PI*2,false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
	ctx.stroke();
	
	
	$("#xvalue").val(Math.round(circle.point.x));
	$("#yvalue").val(Math.round(circle.point.y));
	$("#startvalue").val(0);
	$("#anglevalue").val(360);
	$("#outervalue").val(Math.round(circle.radius));
	$("#innervalue").val(Math.round(innerCircle.radius));
	
	document.querySelector('#circlevolume').value = Math.round(circle.radius);
	document.querySelector('#innercirclevolume').value = Math.round(innerCircle.radius);
	
	
	updateCircleEvo();

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

function updateCircleEvo()
{
		var centerX = $("#xvalue").val();
		var centerY = $("#yvalue").val();
		var innerRadius = $("#innervalue").val();
		var outerRadius = $("#outervalue").val();
		var startvalue = $("#startvalue").val();
		var anglevalue = $("#anglevalue").val();
		
		/*if ($("#lightToDark").is(":checked")) {
            alert("light checked");
        }
		else if($("#darkToLight").is(":checked")) {
            alert("dark checked");
        }*/
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.Center.X%3B"+ centerX +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.Center.Y%3B"+ centerY +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.InnerRadius%3B"+ innerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.OuterRadius%3B"+ outerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.StartAngle%3B"+ startvalue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Circle%3B1%3BCirclePos.LengthAngle%3B"+ anglevalue +"%23");

}

    
var element;
var circle = new Circle(new Point(50, 50), 50);
var innerCircle = new Circle(new Point(50, 50), 25);
var smallCircle = new Circle(new Point(100, 50), 10);

var deltaCenter = null;


// imginary frame
var startFrameX = 5;

var startFrameY = 5;

var endFrameX = 747;

var endFrameY = 470;

// settings

var maxRadius = 200;

var minRadius = 20;

