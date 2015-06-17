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
	
		if(withinCircle(p)) {
			
			//mouse pointer on the center
			deltaCenter = new Point(p.x - circle.point.x, p.y - circle.point.y);
			deltaCenter2 = null;
			
		}else if(withinCircle2(p)) {
			
			//mouse pointer on the center
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
			var radius = circle.radius;
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

function t_Move(e){
	
	e.preventDefault();
	
	tempcanvas = document.getElementById('canvas');
	var rect = tempcanvas.getBoundingClientRect();
	
	var p = new Point(e.targetTouches[0].clientX - rect.left, e.targetTouches[0].clientY - rect.top);
	
	
	if(withinCircle(p))
	{
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
	}else if(withinCircle2(p))
	{
			circle2.point.x = e.targetTouches[0].clientX - rect.left;
			circle2.point.y = e.targetTouches[0].clientY - rect.top;
	
			var radius = circle.radius;
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

// mouse up & mouse out
function stopDragging(e) {
    deltaCenter = null;
	deltaCenter2 = null;
}

function withinCircle(pt) {

return Math.pow(pt.x - circle.point.x, 2) + Math.pow(pt.y - circle.point.y, 2) < Math.pow(circle.radius, 2);
}

function withinCircle2(pt) {

return Math.pow(pt.x - circle2.point.x, 2) + Math.pow(pt.y - circle2.point.y, 2) < Math.pow(circle2.radius, 2);
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
	
	//circle 1
    ctx.beginPath();
    ctx.arc(circle.point.x, circle.point.y, circle.radius, 0, Math.PI*2, false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
	ctx.stroke();
	ctx.closePath();
	//ctx.globalAlpha=0.4;
	//ctx.fill();

	ctx.beginPath();
    ctx.arc(circle.point.x, circle.point.y, innerCircle.radius, 0,Math.PI*2,false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
	ctx.stroke();
	ctx.closePath();
	
	//circle 2
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
    ctx.arc(circle2.point.x, circle2.point.y, circle2.radius, 0, Math.PI*2, false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
	ctx.stroke();
	ctx.closePath();
	//ctx.globalAlpha=0.4;
	//ctx.fill();

	ctx.beginPath();
    ctx.arc(circle2.point.x, circle2.point.y, innerCircle2.radius, 0,Math.PI*2,false);
	
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 3;
    ctx.strokeStyle = "blue";
	ctx.stroke();
	ctx.closePath();
	
	$("#xvalue").val(Math.round(circle.point.x));
	$("#yvalue").val(Math.round(circle.point.y));
	$("#startvalue").val(0);
	$("#anglevalue").val(360);
	$("#outervalue").val(Math.round(circle.radius));
	$("#innervalue").val(Math.round(innerCircle.radius));
	
	$("#xvalue2").val(Math.round(circle2.point.x));
	$("#yvalue2").val(Math.round(circle2.point.y));
	$("#startvalue2").val(0);
	$("#anglevalue2").val(360);
	$("#outervalue2").val(Math.round(circle2.radius));
	$("#innervalue2").val(Math.round(innerCircle2.radius));
	
	document.querySelector('#circlevolume').value = Math.round(circle.radius);
	document.querySelector('#innercirclevolume').value = Math.round(innerCircle.radius);
	
	document.querySelector('#circlevolume2').value = Math.round(circle2.radius);
	document.querySelector('#innercirclevolume2').value = Math.round(innerCircle2.radius);
	
	
	updateCircleEvo();
	updateCircle2Evo();

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
		
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.Center.X%3B"+ centerX +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.Center.Y%3B"+ centerY +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.InnerRadius%3B"+ innerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.OuterRadius%3B"+ outerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.StartAngle%3B"+ startvalue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.LengthAngle%3B"+ anglevalue +"%23");
		
		

}

function updateCircle2Evo()
{
		var centerX = $("#xvalue2").val();
		var centerY = $("#yvalue2").val();
		var innerRadius = $("#innervalue2").val();
		var outerRadius = $("#outervalue2").val();
		var startvalue = $("#startvalue2").val();
		var anglevalue = $("#anglevalue2").val();
		
		/*if ($("#lightToDark").is(":checked")) {
            alert("light checked");
        }
		else if($("#darkToLight").is(":checked")) {
            alert("dark checked");
        }*/
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.Center.X%3B"+ centerX +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.Center.Y%3B"+ centerY +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.InnerRadius%3B"+ innerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.OuterRadius%3B"+ outerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.StartAngle%3B"+ startvalue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos2.LengthAngle%3B"+ anglevalue +"%23");

}

    
var element;
var circle = new Circle(new Point(50, 50), 50);
var innerCircle = new Circle(new Point(50, 50), 25);


var circle2 = new Circle(new Point(50, 200), 50);
var innerCircle2 = new Circle(new Point(100, 50), 25);

var deltaCenter = null;
var deltaCenter2 = null;


// imginary frame
var startFrameX = 5;

var startFrameY = 5;

var endFrameX = 747;

var endFrameY = 470;

// settings

var maxRadius = 200;

var minRadius = 20;
