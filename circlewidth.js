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
	//tempcanv = document.getElementById('canvas');
	element.addEventListener('touchmove', t_Move);

	
	$("#set").click(function(){
		//var outerRadius = parseFloat();
		
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
		//alert(Math.pow(pt.x - point.x, 2) + Math.pow(pt.y - point.y, 2) < Math.pow(radius, 2));
        return Math.pow(pt.x - point.x, 2) + Math.pow(pt.y - point.y, 2) < Math.pow(radius, 2); 
		
		//return true;
		
    };
    return this;
}


//mouse down
function startDragging(e) {

    var p = new Point(mouseX(e), mouseY(e));
		//alert(mouseX(e));
		
	if(clicked == false)
	{
		
		//if(circle.isInside(p)) {
		if(withinCircle(p)) {
			//alert("delta x " + (p.x - circle.point.x) + " y " + (p.y - circle.point.y));
			
			//mouse pointer on the center
			deltaCenter = new Point(p.x - circle.point.x, p.y - circle.point.y);
			
			
		}
	}
		 mouseXi = e.pageX - (this.offsetLeft + additionalFrameLeft);
         mouseYi = e.pageY - (this.offsetTop + additionalFrameTop);
		 
		 //small circle
		//var smallCirclePointX = circle.point.x + (circle.radius*Math.cos(0/(180/Math.PI)));
		//if(( mouseXi <= smallCirclePointX + 15 && mouseXi >= smallCirclePointX) )
	/*if(( mouseXi <= circle.point.x + circle.radius + 10 && mouseXi >= circle.point.x + circle.radius) && (mouseYi <= circle.point.y - 5))
	{
			clicked = true;
			lastClickX = mouseXi;
			
	}*/
	
	
}

//mouse move
function drag(e) {
		
		
		
		 mouseXi = e.pageX - (this.offsetLeft + additionalFrameLeft);
         mouseYi = e.pageY - (this.offsetTop + additionalFrameTop);
		 
	//small circle
		//var smallCirclePointX = circle.point.x + (circle.radius*Math.cos(0/(180/Math.PI)));
		//if(( mouseXi <= smallCirclePointX + 15 && mouseXi >= smallCirclePointX) )
	/*if(( mouseXi <= circle.point.x + circle.radius + 10 && mouseXi >= circle.point.x + circle.radius) && (mouseYi <= circle.point.y - 5))
	{
		this.style.cursor='e-resize';
	}
	else
		this.style.cursor='auto';*/
		
	//if(( mouseXi < circle.point.x + circle.radius / 2&& mouseXi >= circle.point.x - circle.radius/2) && (mouseYi < circle.point.y + circle.radius/2 && mouseYi >= circle.point.y - circle.radius/2))
	var p = new Point(mouseX(e), mouseY(e));
	
	//if(circle.isInside(p)) 
	if(withinCircle(p))
		this.style.cursor='move';
	else
		this.style.cursor='auto';

	if(clicked == false)
	{
	
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
		
	
	if(clicked == true)
	{
		
		 mouseXi = e.pageX - (this.offsetLeft + additionalFrameLeft);
         mouseYi = e.pageY - (this.offsetTop + additionalFrameTop);
		
		//
		/*var canvas = document.getElementById('myCanvas');
		var context = canvas.getContext('2d');
	
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.font = '18pt Calibri';
		context.fillStyle = 'black';
		context.fillText("mouseXi" + mouseXi, 10, 25);*/
		//
		//circle.radius += Math.abs(circle.radius - mouseXi);
	
		
	  //determine the radius
	  
		
	//if(mouseXi >= (circle.point.x + (circle.radius / 2)) && (mouseYi <= circle.point.y + circle.radius || mouseYi >= circle.point.y + circle.radius))
	//{
		if(lastClickX < mouseXi)
		{
			if( circle.radius < maxRadius && circle.radius < findMin(circle.point.x, circle.point.y))
			{
				if((circle.point.x + circle.radius) < endFrameX && (circle.point.y + circle.radius) < endFrameY)
				{
					/*var x1 = circle.point.x;
					var y1 = circle.point.y;
					var x2 = mouseXi;
					var y2 = mouseYi;
					var dx = x1 - x2;
					var dy = y1 - y2;
					var r = Math.sqrt(dx*dx+dy*dy) - 40;
					r = Math.max(5, r);
					circle.radius += r;*/
					
					circle.radius += (mouseXi / mouseSensitivity);
				}
			}
			if(circle.radius > maxRadius)
			{
				circle.radius = maxRadius;
			}
			
			//circle.radius += 3;
			
			//circle.radius = circle.radius + Math.sqrt(mouseXi);
			//circle.point.x = mouseXi;
			//circle.point.y = 10;
		}
	//}
	//else if(mouseXi <= (circle.point.x + (circle.radius / 2)) && (mouseYi <= circle.point.y + circle.radius || mouseYi >= circle.point.y + circle.radius))
	//{
		if(lastClickX > mouseXi)
		{
			if( circle.radius > minRadius)
				circle.radius -= (mouseXi / mouseSensitivity);
				
				/*var x1 = circle.point.x;
					var y1 = circle.point.y;
					var x2 = mouseXi;
					var y2 = mouseYi;
					var dx = x1 - x2;
					var dy = y1 - y2;
					var r = Math.sqrt(dx*dx+dy*dy) - 40;
					r = Math.min(100, r);
					circle.radius -= r;*/
					
				if(circle.radius < minRadius)
				{
					circle.radius = minRadius;
				}
				
				
				//circle.radius -= 3;
				
				//circle.radius = circle.radius - Math.sqrt(mouseXi);
				//circle.point.x = circle.point.x;
				//circle.point.y = circle.point.y;
		}
	//}
	
	$("#rangeValue").val(circle.radius);
	drawCircle(circle, innerCircle);
	mouseXi = e.pageX - (this.offsetLeft + additionalFrameLeft);
	lastClickX = mouseXi;
	
	}

}

function t_Move(e){
	//alert("move");
	e.preventDefault();
	
	tempcanvas = document.getElementById('canvas');
	var rect = tempcanvas.getBoundingClientRect();
	
	//var p = new Point(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
	
	
	//circle.point.x = e.targetTouches[0].pageX - rect.left;
	//circle.point.y = e.targetTouches[0].pageY - rect.top;
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
	
	//var p = new Point(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
	//alert(e.targetTouches[0].pageX);
	//deltaCenter = new Point(p.x - circle.point.x, p.y - circle.point.y);
	
	//circle.point.x = (e.targetTouches[0].pageX - deltaCenter.x);
	//circle.point.y = (e.targetTouches[0].pageY - deltaCenter.y);
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
    //return e.clientX - (element.offsetLeft + additionalFrameLeft);
	var cx = document.getElementById('canvas');
    var mousePos = getMousePos(cx, e);
	return mousePos.x;
}

function mouseY(e) {
    //return e.clientY - (element.offsetTop + additionalFrameTop);
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
	//ctx.moveTo(0,0);
    ctx.arc(circle.point.x, circle.point.y, innerCircle.radius, 0,Math.PI*2,false);
	//small circle
	//ctx.arc( (circle.point.x + circle.radius), circle.point.y, smallCircle.radius,0, Math.PI*2, false);
	
	//alert(circle.radius);
	ctx.globalAlpha=1;
	
	ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
	ctx.stroke();
	
	
	
	
	//alert("h");
	$("#xvalue").val(Math.round(circle.point.x));
	$("#yvalue").val(Math.round(circle.point.y));
	$("#startvalue").val(0);
	$("#anglevalue").val(360);
	$("#outervalue").val(Math.round(circle.radius));
	$("#innervalue").val(Math.round(innerCircle.radius));
	
	document.querySelector('#circlevolume').value = Math.round(circle.radius);
	document.querySelector('#innercirclevolume').value = Math.round(innerCircle.radius);
	
	
	updateCircleEvo();
    //ctx.fill();
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
			/*if((circle.point.x + intSize) < endFrameX && (circle.point.y + intSize) < endFrameY)
			{
				var minValue = findMin((circle.point.x + intSize), (circle.point.y + intSize));
				if(minValue == (circle.point.x + intSize))
					circle.radius = minValue - circle.point.x;
				else if(minValue == (circle.point.y + intSize))
					circle.radius = minValue - circle.point.y;
			}*/
			
			//if(size)
	
			//alert(circle.point.x);
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
			/*if((circle.point.x + intSize) < endFrameX && (circle.point.y + intSize) < endFrameY)
			{
				var minValue = findMin((circle.point.x + intSize), (circle.point.y + intSize));
				if(minValue == (circle.point.x + intSize))
					circle.radius = minValue - circle.point.x;
				else if(minValue == (circle.point.y + intSize))
					circle.radius = minValue - circle.point.y;
			}*/
			
			//if(size)
	
			//alert(circle.point.x);
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
		//alert($("#outervalue").val());
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

var clicked=false;

var closeEnough = 10;

var lastClickX = 0;

// canvas frame settings
// offset of frame
var additionalFrameLeft = 350;

var additionalFrameTop = 130;

// imginary frame
var startFrameX = 5;

var startFrameY = 5;

var endFrameX = 747;

var endFrameY = 470;

// settings

var maxRadius = 200;

var minRadius = 20;

var mouseSensitivity = 100;
