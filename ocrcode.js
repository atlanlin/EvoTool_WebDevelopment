(function(window) {
	// holds all our boxes
	var boxes2 = [];
	
	// holds the 8 tiny boxes that will be our selection handles
	// the selection handles will be in this order:
	// 0  1  2
	// 3     4
	// 5  6  7
	var selectionHandles = [];

	// hold canvas information
	var canvas;
	var ctx;
	var WIDTH;
	var HEIGHT;
	var HEIGHT;
	var INTERVAL = 20;	// how often, in milliseconds, we check to see if a redraw is needed

	var isDrag = false;
	var isResizeDrag = false;
	var expectResize = -1;	// will save the # of the selection handle if the mouse is over one
	var mx, my;	// mouse coordinates

	 // when set to true, the canvas will redraw everything
	 // invalidate() just sets this to false right now
	 // we want to call invalidate() whenever we make a change
	var canvasValid = false;

	// the node (if any) being selected
	// if in the future we want to select multiple objects, this will get turned into an array
	var mySel = null;

	// the selection color and width
	// right now we have a red selection with a small width
	var mySelColor = '#CC0000';
	var mySelWidth = 2;
	var mySelBoxColor = 'darkred';	// new for selection boxes
	var mySelBoxSize = 8;

	// we use a fake canvas to draw individual shapes for selection testing
	var ghostcanvas;
	var gctx;	// fake canvas context

	// since we can drag from anywhere in a node
	// instead of just its x/y corner, we need to save
	// the offset of the mouse when we start dragging.
	var offsetx, offsety;

	// padding and border style widths for mouse offsets
	var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

	//flag for rectangle opacity (character size)
	var rectFlag = false;

	// flag for rectangle opacity (roi window)
	var rectRoiFlag = false;
	
	// scaling
	var mulStartX;
	var mulEndX;
	var mulStartY;
	var mulEndY;
	var mulWidth;
	var mulHeight;
	
	var mulCharStartX;
	var mulCharStartY;
	var	mulCharWidth;
	var mulCharHeight;

	// box object to hold data
	// default width and height
	function Box2() {
	  this.x = 0;
	  this.y = 0;
	  this.w = 1;
	  this.h = 1;
	  this.fill = '#444444';
	  this.lineColor = '#444444';
	}

	//added by yelling
	Box2.prototype = {
	  // this function will only erase the first object in the listStyleType
	  // it will not erase the selected canvas object
	  erase: function(context, optionalColor) {
		context.clearRect(this.x - mySelBoxSize, this.y - mySelBoxSize, this.w + 2*mySelBoxSize, this.h + 2*mySelBoxSize);
	  }
	}

	// new methods on the Box class
	Box2.prototype = {
		// we used to have a solo draw function
		// but now each box is responsible for its own drawing
		// mainDraw() will call this with the normal canvas
		// myDown will call this with the ghost canvas with 'black'
		draw: function(context, optionalColor) {
			if (context === gctx) {
				context.fillStyle = 'black';	// always want black for the ghost canvas
			} else {
				context.fillStyle = this.fill;
				
				// added by weiling
				context.strokeStyle = this.lineColor;
				context.lineWidth = mySelWidth;
			 }
			  
			// we can skip the drawing of elements that have moved off the screen:
			if (this.x > WIDTH || this.y > HEIGHT) return; 
			if (this.x + this.w < 0 || this.y + this.h < 0) return;
			  
			context.fillRect(this.x,this.y,this.w,this.h);
			 
			// added by weiling
			context.strokeRect(this.x,this.y,this.w,this.h);
			  
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
		}	// end draw
	}	// end Box class

	//initialize a new Box, add it, and invalidate the canvas
	function addRect(x, y, w, h, fill, lineColor) {
		var rect = new Box2;
		rect.x = x;
		rect.y = y;
		rect.w = w
		rect.h = h;
		rect.fill = fill;
		rect.lineColor = lineColor;
		boxes2.push(rect);
		invalidate();
	}

	// initialize our canvas, add a ghost canvas, set draw loop
	// then add everything we want to initially exist on the canvas
	function init2() {
		ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BGeneral.Enabled%3B1%23');
		ajaxGet('info.htm?cmd=%23021%3BINI%20FlushData%3B2%3BGeneral.Enabled%3B1%23');
		ajaxGet('info.htm?cmd=%23021%3BINI%20CodeData%3B2%3BGeneral.Enabled%3B1%23');
		ajaxGet('info.htm?cmd=%23021%3BSend%20CodeData%3B2%3BGeneral.Enabled%3B1%23');
	
		if (getCookie("resolution") == null) {
			setCookie("resolution","0",1);
		}
		resolution = parseInt(getCookie("resolution"));
			
		setScaleSize(1, resolution);
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
		//setInterval(evoComm, INTERVAL);

		// set our events
		// up and down are for dragging
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
	  
		function showCharWindowConfig() {
			document.getElementById("characterBoundary").style.display="none";
			
			if (document.getElementById("characterSize").checked) {
				document.getElementById("characterBoundary").style.display="block";
			}
		}
	  
		$("input[name='characterSize']").click(function() {
			if( $("input[name='characterSize']:checkbox:checked").val()=="characterSize"){
				rectFlag=true;		
			} else {
				rectFlag=false;
			}
		});	
		
		$("input[name='searchType']").click(function() {
			if ($("input[name='searchType']:radio:checked").val()=="set") {
				rectRoiFlag=true;
			} else {
				rectRoiFlag=false;
			}
		});
		
		$("#btnMeasure").click(function(){
	
			evoComm();
			
			ajaxGet("cfg.ini", getCodeValueFrominiFile);
			
		});
		
		
		
		// add a large green rectangle (roi window)
		addRect(0, 0, 100, 100, 'rgba(0,205,0,0)', 'rgba(0,205,0,1)');
	  
		// add a green-blue rectangle (character size)
		addRect(0, 0, 100, 100, 'rgba(2,165,165,0)', 'rgba(2,165,165,1)');
	}	// end init2
	
	// consists of EVO communication commands
	function evoComm() {
		fontType();
		polarityType();
		charOptions();
		roiSet();
	}	// end evoComm
	
	// consists of font type
	function fontType() {
		if (document.getElementById("industrial").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B0%23');
		}
		if (document.getElementById("industrial09").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B1%23');
		}
		if (document.getElementById("industrial09AZ").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B3%23');
		}
		if (document.getElementById("industrial09P").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B2%23');
		}
		if (document.getElementById("industrialAZP").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B4%23');
		}
		if (document.getElementById("dotPrint").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B5%23');
		}
		if (document.getElementById("dotPrint09").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B6%23');
		}
		if (document.getElementById("dotPrint09AZ").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B7%23');
		}
		if (document.getElementById("dotPrint09P").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B9%23');
		}
		if (document.getElementById("dotPrintAZP").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B8%23');
		}
		if (document.getElementById("document").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B10%23');
		}
		if (document.getElementById("document09").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B11%23');
		}
		if (document.getElementById("document09AZ").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B12%23');
		}
		if (document.getElementById("documentAZP").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B13%23');
		}
		if (document.getElementById("enhancedOCRA").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B14%23');
		}
		if (document.getElementById("enhancedOCRB").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B15%23');
		}
		if (document.getElementById("pharma").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B16%23');
		}
		if (document.getElementById("pharma09").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B17%23');
		}
		if (document.getElementById("pharma09AZ").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B19%23');
		}
		if (document.getElementById("pharma09P").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B18%23');
		}
		if (document.getElementById("micr").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B20%23');
		}
		if (document.getElementById("semi").selected) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BfontNum%3B21%23');
		}
	}
	
	// consists of polarity type
	function polarityType() {
		if (document.getElementById("darkOnLight").checked) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BpolarityType%3B0%23');
		}
		else {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BpolarityType%3B1%23');
		}
	}
	
	// consists of advanced character options
	function charOptions() {
		var charStartX = $("#charXValue").val() * mulCharStartX;
		var charStartY = $("#charYValue").val() * mulCharStartY;
		var charWidth = $("#charWValue").val() * mulCharWidth;
		var charHeight = $("#charHValue").val() * mulCharHeight;
			
		if (document.getElementById("dotted").checked) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BdotType%3B1%23');
		} else {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BdotType%3B0%23');
		}
			
		if( document.getElementById("rotationCorrection").checked) {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BrotateType%3B1%23');
		} else {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BrotateType%3B0%23');
		}
			
		if (document.getElementById("characterSize").checked) {
			// auto character size
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BAutoCharX%3B'+charStartX+'%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BAutoCharY%3B'+charStartY+'%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BAutoCharW%3B'+charWidth+'%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BAutoCharH%3B'+charHeight+'%23');
			
			// manual character size
/* 			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BcharX%3B200%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BcharY%3B200%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BcharW%3B100%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BcharH%3B100%23'); */
		} else {
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BAutoCharX%3B50%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BAutoCharY%3B50%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BAutoCharW%3B40%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BAutoCharH%3B50%23');
		}
	}
	
	// consists of roi settings
	function roiSet() {
		
		/* var startX = $("#xValue").val() * mulStartX;
		var endX = (parseInt($("#xValue").val()) + parseInt($("#wValue").val())) * mulEndX;
		var startY = (parseInt($("#yValue").val()) + (parseInt($("#hValue").val())/2)) * mulStartY;
		var endY = (parseInt($("#yValue").val()) + (parseInt($("#hValue").val())/2)) * mulEndY;
		var width = $("#wValue").val() * mulWidth; */
		
		if (document.getElementById("wholeWindow").checked) {
			/* ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointStart.X%3B0%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointEnd.X%3B752%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointStart.Y%3B240%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointEnd.Y%3B240%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.Width%3B750%23'); */
			
			var startX = 0 * mulStartX;
			var endX = 752 * mulEndX;
			var startY = 240 * mulStartY;
			var endY = 240 * mulEndY;
			var width = 480 * mulWidth;
			
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointStart.X%3B'+startX+'%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointEnd.X%3B'+endX+'%23');			
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointStart.Y%3B'+startY+'%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointEnd.Y%3B'+endY+'%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.Width%3B'+width+'%23');
		}
			
		if (document.getElementById("defineWindow").checked) {
			
			var startX = $("#xValue").val() * mulStartX;
			var endX = (parseInt($("#xValue").val()) + parseInt($("#wValue").val())) * mulEndX;
			var startY = (parseInt($("#yValue").val()) + (parseInt($("#hValue").val())/2)) * mulStartY;
			var endY = (parseInt($("#yValue").val()) + (parseInt($("#hValue").val())/2)) * mulEndY;
			var width = $("#hValue").val() * mulWidth;
		
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointStart.X%3B'+startX+'%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointEnd.X%3B'+endX+'%23');			
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointStart.Y%3B'+startY+'%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.PointEnd.Y%3B'+endY+'%23');
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B1%3BposRect.Width%3B'+width+'%23');

		}
	}

	function Line(x1,y1,x2,y2) {
		this.x1=x1;
		this.y1=y1;
		this.x2=x2;
		this.y2=y2;
	}
	
	Line.prototype.drawWithArrowheads=function(ctx) {
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
		
		// rotate the context to point along the path
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

	// wipes the canvas context
	function clear(c) {
	  c.clearRect(0, 0, WIDTH, HEIGHT);
	}

	// main draw loop
	// while draw is called as often as the INTERVAL variable demands
	// it only ever does something if the canvas gets invalidated by our code
	function mainDraw() {
		if (canvasValid == false) {
			clear(ctx);

			// add stuff you want drawn in the background all the time here
			/*var imageObj = new Image();

			imageObj.onload = function() {
			ctx.drawImage(imageObj, 0, 0);
			};
			imageObj.src = 'jpeg.jpg';
			
			var img = document.getElementsByTagName('img')[0];
			img.src = can.toDataURL();
			*/
			
			// draw all boxes
			var l = boxes2.length;
			
			// added by yelling
			/* if(rectFlag==false){
				boxes2[0].erase(ctx);
			} */
			
			// modified by weiling
			for (var i = 0; i < l; i++) {
				if (rectFlag==false && rectRoiFlag==false) {
					
				} else if (rectFlag==false && rectRoiFlag==true) {
					boxes2[0].draw(ctx);
				} else if (rectFlag==true && rectRoiFlag==false) {
					boxes2[1].draw(ctx);
					//create text boxes2[1] is for character, boxes2[0] is for roi
					ctx.font="20px Georgia";
					ctx.fillStyle = 'black';
					ctx.fillText("C",boxes2[1].x+boxes2[1].w-20,boxes2[1].y+20);
				} else {
					boxes2[i].draw(ctx); // we used to call drawshape, but now each box draws itself
					//create text boxes2[1] is for character, boxes2[0] is for roi
					ctx.font="20px Georgia";
					ctx.fillStyle = 'black';
					ctx.fillText("C",boxes2[1].x+boxes2[1].w-20,boxes2[1].y+20);
				}
			}
			
			// add stuff you want drawn on top all the time here
			
			
			
			// added by weiling
			var charXPos = boxes2[1].x;
			var charYPos = boxes2[1].y;
			var charW = boxes2[1].w;
			var charH = boxes2[1].h;
			$("#charXValue").val(charXPos);
			$("#charYValue").val(charYPos);
			$("#charWValue").val(charW);
			$("#charHValue").val(charH);
			
			var xPos = boxes2[0].x;
			var yPos = boxes2[0].y;
			var w = boxes2[0].w;
			var h = boxes2[0].h;
			$("#xValue").val(xPos);
			$("#yValue").val(yPos);
			$("#wValue").val(w);
			$("#hValue").val(h);
			
			//evoComm();
	  }
	}

	// happens when the mouse is moving inside the canvas
	function myMove(e) {
		e.preventDefault();
		if (isDrag) {
			getMouse(e);
		
			mySel.x = mx - offsetx;
			mySel.y = my - offsety;   
		
			// changes made by yelling
			if (mySel.x < 0)
				mySel.x = 0;
			else if (mySel.x + mySel.w > WIDTH)
				mySel.x = WIDTH - mySel.w;
			if (mySel.y < 0)
				mySel.y = 0;
			else if (mySel.y + mySel.h > HEIGHT)
				mySel.y = HEIGHT - mySel.h;
		
			// something is changing position so we better invalidate the canvas!
			invalidate();
		} else if (isResizeDrag) {
			// time to resize!
			var oldx = mySel.x;
			var oldy = mySel.y;
			// 0  1  2
			// 3     4
			// 5  6  7
			
			// added by weiling
			var oldw = mySel.w;
			var oldh = mySel.h;
			
			switch (expectResize) {
				case 0:
					// added by weiling
					while (mx >= oldx + oldw) {
						mx = (oldx + oldw) - 1;
					}
					while (my >= oldy + oldh) {
						my = (oldy + oldh) - 1;
					}
					mySel.x = mx;
					mySel.y = my;
					mySel.w += oldx - mx;
					mySel.h += oldy - my;
					break;
				case 1:
					// added by weiling
					while (my >= oldy + oldh) {
						my = (oldy + oldh) - 1;
					}
					mySel.y = my;
					mySel.h += oldy - my;
					break;
				case 2:
					// added by weiling
					while (mx <= oldx) {
						mx = oldx + 1;
					}
					while (my >= oldy + oldh) {
						my = (oldy + oldh) - 1;
					}
					mySel.y = my;
					mySel.w = mx - oldx;
					mySel.h += oldy - my;
					break;
				case 3:
					// added by weiling
					while (mx >= oldx + oldw) {
						mx = (oldx + oldw) - 1;
					}
					mySel.x = mx;
					mySel.w += oldx - mx;
					break;
				case 4:
					// added by weiling
					while (mx <= oldx) {
						mx = oldx + 1;
					}
					mySel.w = mx - oldx;
					break;
				case 5:
					// added by weiling
					while (mx >= oldx + oldw) {
						mx = (oldx + oldw) - 1;
					}
					while (my <= oldy) {
						my = oldy + 1;
					}
					mySel.x = mx;
					mySel.w += oldx - mx;
					mySel.h = my - oldy;
					break;
				case 6:
					// added by weiling
					while (my <= oldy) {
						my = oldy + 1;
					}
					mySel.h = my - oldy;
					break;
				case 7:
					// added by weiling
					while (mx <= oldx) {
						mx = oldx + 1;
					}
					while (my <= oldy) {
						my = oldy + 1;
					}
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
			  
				// we don't need to use the ghost context because
				// selection handles will always be rectangles
				//changes made by yelling
				if (mx >= cur.x && mx <= cur.x + mySelBoxSize*3/2 && my >= cur.y && my <= cur.y + mySelBoxSize*3/2) {
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
	  
	}	// end myMove

	// happens when the mouse is clicked in the canvas
	function myDown(e) {
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
		// haven't returned means we have selected nothing
		mySel = null;
		// clear the ghost canvas for next time
		clear(gctx);
		// invalidate because we might need the selection border to disappear
		invalidate();
	}	// end myDown

	function myUp(){
		isDrag = false;
		isResizeDrag = false;
		expectResize = -1;
	}	// end myDown

	// adds a new node
	function myDblClick(e) {
		getMouse(e);
		// for this method width and height determine the starting X and Y, too.
		// so I left them as vars in case someone wanted to make them args for something and copy this code
		var width = 20;
		var height = 20;
		addRect(mx - (width / 2), my - (height / 2), width, height, 'rgba(220,205,65,0.7)');
	}	// end myDblClick

	function invalidate() {
	  canvasValid = false;
	}

	// sets mx, my to the mouse position relative to the canvas
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
	function setScaleSize(horizontal, resolutionChoice) {
	
		if(resolutionChoice == 0) { // image 640 by 480
			if(horizontal == 1) {
				mulStartX = 0.853;
				mulStartY = 0.987;
				mulEndX = 0.851;
				mulEndY = 0.987;
				mulWidth = 1;
				
				mulCharStartX = 0.853;
				mulCharStartY = 0.987;
				mulCharWidth = 0.932;
				mulCharHeight = 0.973;
				
				/* mulStartX = 0.831;
				mulStartY = 1;
				mulEndX = 0.871;
				mulEndY = 1;
				mulWidth = 1; */
			}
			else if(horizontal == 0) {
				mulStartX = 0.859;
				mulStartY = 1;
				mulEndX = 0.859;
				mulEndY = 1;
				mulWidth = 0.81;
			} 
		} 
		else if(resolutionChoice == 1) { //image 1024 by 768
			if(horizontal == 1) {
				mulStartX = 1.3648;
				mulStartY = 1.583;
				mulEndX = 1.363;
				mulEndY = 1.583;
				mulWidth = 1.6;
				
				mulCharStartX = 1.362;
				mulCharStartY = 1.554;
				mulCharWidth = 1.362;
				mulCharHeight = 1.687;
				
				/* mulStartX = 1.3648;
				mulStartY = 1.668;
				mulEndX = 1.303;
				mulEndY = 1.668;
				mulWidth = 1; */
			} 
			else if(horizontal == 0) {
				mulStartX = 1.346;
				mulStartY = 1.6;
				mulEndX = 1.346;
				mulEndY = 1.6;
				mulWidth = 1;
			}
		}
		else if(resolutionChoice == 2) { // image 2592 by 1944
			if(horizontal == 1) {
				mulStartX = 3.451;
				mulStartY = 4.069;
				mulEndX = 3.432;
				mulEndY = 4.069;
				mulWidth = 3.992;
			}
			else if(horizontal == 0) {
				mulStartX = 3.449;
				mulStartY = 3.919;
				mulEndX = 3.449;
				mulEndY = 4.051;
				mulWidth = 3.305;
			} 
		}
	}

	// if you don't want to use <body onLoad='init()'>
	// you could uncomment this init() reference and place the script reference inside the body tag
	//init();
	window.init2 = init2;
})(window);