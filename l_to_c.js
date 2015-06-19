// screen on load 
window.onload = function() {
	initSquare();
	initCircle();
	
}

function showPoints(){

	if(document.getElementById("circlePoint").checked){
		initCircle();
	}
	if(document.getElementById("sqPoint").checked){
		clearCircle();
	}

}

function showCircleDetails()
{
	if(document.getElementById("circleCheck").checked){
		document.getElementById("circleDetail").style.display="block";
		document.getElementById("circleSettings").style.display="block";
	}else
	{
		document.getElementById("circleDetail").style.display="none";
		document.getElementById("circleSettings").style.display="none";
	}

}

function showSquareDetails()
{
	
	if(document.getElementById("squareCheck").checked){
		document.getElementById("rectDetail").style.display="block";
		document.getElementById("rectSettings").style.display="block";
	}
	else
	{
		document.getElementById("rectDetail").style.display="none";
		document.getElementById("rectSettings").style.display="none";
	}

}

// circle code

function initCircle() {
	
	setPageScaleSize(resolution);
	
	
    drawCircle(circle, innerCircle);
	
	
    element = document.getElementById('canvas');
    element.addEventListener('mousedown', startDragging, false);
    element.addEventListener('mousemove', drag, false);
    element.addEventListener('mouseup', stopDragging, false);
    element.addEventListener('mouseout', stopDragging, false);
	
	element.addEventListener('touchmove', t_Move);
	
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
			
		drawCircle(circle, innerCircle);
		mainDraw();
		}
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
	
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    ctx.strokeStyle = "blue";
	ctx.stroke();
	ctx.closePath();
	
	//update values to the page
	$("#xvalue").val(Math.round(circle.point.x));
	$("#yvalue").val(Math.round(circle.point.y));
	$("#startvalue").val(0);
	$("#anglevalue").val(360);
	$("#outervalue").val(Math.round(circle.radius));
	$("#innervalue").val(Math.round(innerCircle.radius));
	
	document.querySelector('#circlevolume').value = Math.round(circle.radius);
	document.querySelector('#innercirclevolume').value = Math.round(innerCircle.radius);
	
	
	//updateCircleEvo();
	//updateRectEvo();

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
	mainDraw();

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
	mainDraw();
}

//update circle values to evo3
function updateCircleEvo()
{

		var centerX = $("#xvalue").val();
		var centerY = $("#yvalue").val();
		var calCenterX = centerX * mulCenterX;
		var calCenterY = centerY * mulCenterY;
		
		var innerRadius = $("#innervalue").val();
		var outerRadius = $("#outervalue").val();
		var calOuterRadius = outerRadius * mulOuterRadius;
		
		var startvalue = $("#startvalue").val();
		var anglevalue = $("#anglevalue").val();
		
		var nominalValue = $("#nv").val();
		var positive = $("#plus").val();
		var negative = $("#minus").val();
		
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.Center.X%3B"+ calCenterX +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.Center.Y%3B"+ calCenterY +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.InnerRadius%3B"+ innerRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.OuterRadius%3B"+ calOuterRadius +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.StartAngle%3B"+ startvalue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BCirclePos.LengthAngle%3B"+ anglevalue +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.NominalValue%3B"+ nominalValue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.PlusTolerance%3B"+ positive +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.MinusTolerance%3B"+ negative +"%23");
		
}

//update rect values to evo3
function updateRectEvo()
{

		var startX = $("#tbStartX").val();
		var endX = $("#tbEndX").val();
		var startY = $("#tbStartY").val();
		var endY = $("#tbEndY").val();
		var width = $("#tbWidth").val();
		
		var calStartX = startX * mulStartX;
		var calStartY = startY * mulStartY;
		var calEndX = endX * mulEndX;
		var calEndY = endY * mulEndY;
				
		
		var nominalValue = $("#nv").val();
		var positive = $("#plus").val();
		var negative = $("#minus").val();
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BRecPos.PointStart.X%3B"+ calStartX +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BRecPos.PointEnd.X%3B"+ calEndX +"%23");
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BRecPos.PointStart.Y%3B"+ calStartY +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BRecPos.PointEnd.Y%3B"+ calEndY +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BRecPos.Width%3B"+ width +"%23");
		
		
		
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.NominalValue%3B"+ nominalValue +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.PlusTolerance%3B"+ positive +"%23");
		ajaxGet("info.htm?cmd=%23021%3BEVO Distance%3B1%3BResult[0].Evaluation.MinusTolerance%3B"+ negative +"%23");
		
}


    
     
    
var element;
var circle = new Circle(new Point(50, 150), 50);
var innerCircle = new Circle(new Point(50, 150), 25);
var smallCircle = new Circle(new Point(100, 50), 10);

var deltaCenter = null;

// canvas frame settings
// imginary frame
var startFrameX = 1;

var startFrameY = 1;

var endFrameX = 747;

var endFrameY = 470;

// settings

var maxRadius = 200;

var minRadius = 20;

var mulCenterX;

var mulCenterY;

var mulOuterRadius;

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


//added by yelling
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

function displayTexts(startXtb, startYtb, endXtb, endYtb, widthtb, inBox){
	var sx, sy, ex, ey, w;
	
	if(arrowDirFlag == "horizontal"){
		
		sx = inBox.x;
		sy = inBox.y + parseInt(inBox.h/2);
		ex = inBox.x + inBox.w;
		ey = inBox.y + parseInt(inBox.h/2);
		w = Math.abs(inBox.h);
	}else{
		sx = inBox.x + parseInt(inBox.w/2);
		sy = inBox.y;
		ex = inBox.x + parseInt(inBox.w/2);
		ey = inBox.y + inBox.h;
		w = Math.abs(inBox.w);
	}
	document.getElementById(startXtb).value=sx;
	document.getElementById(startYtb).value=sy;
	document.getElementById(endXtb).value=ex;
	document.getElementById(endYtb).value=ey;
	document.getElementById(widthtb).value=w;
	
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
  
  setScaleSize(1, resolution)

  
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
  setInterval(updateRectEvo, UPDATERECTINTERVAL);
  setInterval(updateCircleEvo, UPDATECIRCLEINTERVAL);
 
  
  // set our events. Up and down are for dragging,
  // double click is for making new boxes
  canvas.onmousedown = myDown;
  canvas.onmouseup = myUp;
  //canvas.ondblclick = myDblClick;
  canvas.onmousemove = myMove;
  
  /*$.mobile.loading( "hide" );
  $.mobile.loading().hide();
		 
  $(canvas).bind( "vmousemove", myMove );
  $(canvas).bind( "vmousedown", myDown );
  $(canvas).bind( "vmouseup", myUp );
  $(canvas).bind( "vmouseover", myMove );*/
  
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
			setScaleSize(0, 0);
			
		}else{
			arrowDirFlag = "horizontal";
			setScaleSize(1, 0);
			
		}
	});
	
	$("#cbArrowHor").change(function() {
		if(this.checked) {
			arrowDirFlag = "horizontal";
			setScaleSize(1, 0);
			
		}else{
			arrowDirFlag = "vertical";
			setScaleSize(0, 0);
			
		}
		//updateCircleEvo();
		//updateRectEvo();
	});
	
  
  
  // add a large green rectangle
  addRect(0, 0, 60, 65, 'rgba(0,205,0,0.7)');
  
  // add a green-blue rectangle
  //addRect(240, 120, 40, 40, 'rgba(2,165,165,0.7)');  
  
  // add a smaller purple rectangle
  //addRect(45, 60, 25, 25, 'rgba(150,150,250,0.7)');
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
  c.clearRect(0, 0, WIDTH, HEIGHT);
}

// Main draw loop.
// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function mainDraw() {
  if (canvasValid == false) {
    clear(ctx);
    
    // Add stuff you want drawn in the background all the time here
    /*var imageObj = new Image();

    imageObj.onload = function() {
    ctx.drawImage(imageObj, 0, 0);
    };
    imageObj.src = 'jpeg.jpg';
	
	var img = document.getElementsByTagName('img')[0];
	img.src = can.toDataURL();
	*/
	
	drawCircle(circle, innerCircle);
	
    // draw all boxes
    var l = boxes2.length;
	
	//added by yelling
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
  e.preventDefault();
  if (isDrag) {
    getMouse(e);
    
    mySel.x = mx - offsetx;
    mySel.y = my - offsety;   
    
	
	/*Changes made by yelling*/
	if(mySel.x < 0)
		mySel.x = 0;
	else if(mySel.x + mySel.w > WIDTH)
		mySel.x = WIDTH - mySel.w;
	if(mySel.y < 0)
		mySel.y = 0;
	else if(mySel.y + mySel.h > HEIGHT)
		mySel.y = HEIGHT - mySel.h;
	
	
	
	
    // something is changing position so we better invalidate the canvas!
    invalidate();
  } else if (isResizeDrag) {
    // time ro resize!
    var oldx = mySel.x;
    var oldy = mySel.y;
    
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
	  //changes made by yelling
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
  e.preventDefault();
  getMouse(e);
  
  if (mySel !== null && !isResizeDrag) {
    for (var i = 0; i < 8; i++) {
      // 0  1  2
      // 3     4
      // 5  6  7
      
      var cur = selectionHandles[i];
      
      // we dont need to use the ghost context because
      // selection handles will always be rectangles
	  //changes made by yelling
      if (mx >= cur.x && mx <= cur.x + mySelBoxSize*3 &&
          my >= cur.y && my <= cur.y + mySelBoxSize*3) {
        // we found one!
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
      my = e.pageY - offsetY
}

//set rect scale to map evo3
//horizontal == 0 means vertical, choice 0 (640 by 480), 1 (1024 by 768), 2(2592 by 1944)..
function setScaleSize(horizontal, resolutionChoice)
{
	
	if(resolutionChoice == 0) // image 640 by 480
	{
		if(horizontal == 1)
		{
			mulStartX = 0.831;
			mulStartY = 1;
			mulEndX = 0.871;
			mulEndY = 1;
			mulWidth = 1;
		
		}
		else if(horizontal == 0) 
		{
			mulStartX = 0.859;
			mulStartY = 1;
			mulEndX = 0.859;
			mulEndY = 1;
			mulWidth = 0.81;
			
		} 
	} 
	else if(resolutionChoice == 1) //image 1024 by 768
	{
		if(horizontal == 1) 
		{
			mulStartX = 1.3648;
			mulStartY = 1.668;
			mulEndX = 1.303;
			mulEndY = 1.668;
			mulWidth = 1;
			
		} 
		else if(horizontal == 0)
		{
			mulStartX = 1.346;
			mulStartY = 1.6;
			mulEndX = 1.346;
			mulEndY = 1.6;
			mulWidth = 1;
		
		}
		
	}
	else if(resolutionChoice == 2) // image 2592 by 1944
	{
		if(horizontal == 1)
		{
			mulStartX = 3.451;
			mulStartY = 4.069;
			mulEndX = 3.432;
			mulEndY = 4.069;
			mulWidth = 3.992;
		
		}
		else if(horizontal == 0) 
		{
			mulStartX = 3.449;
			mulStartY = 3.919;
			mulEndX = 3.449;
			mulEndY = 4.051;
			mulWidth = 3.305;
			
		} 
	}
	
}

//set circle scale to map evo3
//choice 0 (640 by 480), 1 (1024 by 768), 2(2592 by 1944)..
function setPageScaleSize(resolutionChoice)
{
	
	if(resolutionChoice == 0) // image 640 by 480
	{
		mulCenterX = 0.854;
		mulCenterY = 1;
		mulOuterRadius = 0.9;
	
	}
	else if(resolutionChoice == 1) //image 1024 by 768
	{
		mulCenterX = 1.35667;
		mulCenterY = 1.6;
		mulOuterRadius = 1.5;
	
	}
	else if(resolutionChoice == 2) // image 2592 by 1944
	{
		mulCenterX = 3.445;
		mulCenterY = 4.09;
		mulOuterRadius = 5;
	
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
var INTERVAL = 1;  // how often, in milliseconds, we check to see if a redraw is needed
var UPDATERECTINTERVAL = 1000;
var UPDATECIRCLEINTERVAL = 3000;

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

var mulStartX;

var mulStartY;

var mulEndX;

var mulEndY;

var mulWidth;

// this is the resolution choice where choice 0 (640 by 480), 1 (1024 by 768), 2 (2592 by 1944)..
var resolution = 0;
}
}