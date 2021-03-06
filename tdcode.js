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
	var INTERVAL = 20;	// how often, in milliseconds, we check to see if a redraw is needed
	var EVOINTERVAL = 2000;
	
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

	// flag for rectangle opacity (roi window)
	var rectRoiFlag = false;
	
	var parametersLoaded = false;
	
	var commandName = "EVO%20DataCode";

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
		

		var tempCmd, tempBarcode, tempOcr;
		tempCmd = getCookie("cmdDatacode");
		tempBarcode = getCookie("cmdBarcode");
		tempOcr = getCookie("cmdOcr");
		if(tempCmd != null && tempCmd != "")
			commandName = tempCmd;
		if(tempBarcode == null || tempBarcode == "")
			tempBarcode = "EVO%20BarCode";
		if(tempOcr == null || tempOcr == "")
			tempOcr = "EVO%20OCR";

		// enable 2d code
		enableDataCode(commandName, 1);
		
		// disable barcode and ocr
		enableBarCode(tempBarcode, 0);
		enableOCR(tempOcr, -1);
		

		//for camera trigger
		//ajaxGet("info.htm?cmd=%23021%3BCapture image%3B2%3BCaptureType%3B0%23");
		ajaxGet("info.htm?cmd=%23021%3BCapture image%3B2%3BTriggeredCapture%3B0%23");
		
		/* // enable 2d code
		ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BGeneral.Enabled%3B1%23');
		ajaxGet('info.htm?cmd=%23021%3BScript%20DataCode%3B2%3BGeneral.Enabled%3B1%23');
		
		// disable barcode and ocr in case they are still enabled
		ajaxGet('info.htm?cmd=%23021%3B'+ tempBarcode + '%3B2%3BGeneral.Enabled%3B0%23');
		ajaxGet('info.htm?cmd=%23021%3BScript%20BarCode%3B2%3BGeneral.Enabled%3B0%23');

		ajaxGet('info.htm?cmd=%23021%3B'+ tempOcr +'%3B2%3BGeneral.Enabled%3B0%23');
		ajaxGet('info.htm?cmd=%23021%3BScript%20OCR%3B2%3BGeneral.Enabled%3B0%23');

		ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BGeneral.Enabled%3B0%23');
		ajaxGet('info.htm?cmd=%23021%3BScript%20OCR%3B2%3BGeneral.Enabled%3B0%23'); */
		
		//evoComm();
		
		//start the program to retrieve image
		ajaxGet("info.htm?cmd=%23002%23");
		intervalUpdateStart();
		disableBtn("btnCodeStart");
		disableBtn("btnMeasure");
		disableBtn("fileCR");
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
		setInterval(evoComm, EVOINTERVAL);

		// set our events
		// up and down are for dragging
		canvas.onmousedown = myDown;
		canvas.onmouseup = myUp;
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
	  	
		function showWindowConfig(){
			if (document.getElementById("wholeWindow").checked) {
				document.getElementById("windowBoundary").style.display="none";
			}
			if (document.getElementById("defineWindow").checked) {
				document.getElementById("windowBoundary").style.display="block";
			}
		}
		
		$("input[name='searchType']").click(function() {
			if ($("input[name='searchType']:radio:checked").val()=="set") {
				rectRoiFlag=true;
			} else {
				rectRoiFlag=false;
			}
		});
		
		$("#btnMeasure").click(function(){
			//not to confuse with previous result
			$("#resultDisplay").val("");
			//evoComm();
			ajaxGet("cfg.ini", getCodeValueFrominiFile);
		});
		
		// Unload ckp file and go back to main menu
		document.getElementById("home").addEventListener("click", function(){
				
			var codeFilename = getCookie("fileCR");
			ajaxGet('info.htm?cmd=%23018' + codeFilename + '.ckp%23');
			delay(1000);
			window.location.href='index.htm';
		});
		
		$("#loadValues").click(function(){
			//get settings
			ajaxGet("datacode.ini", getParameterFrominiFile);
			this.disabled = true;
			this.style.color="gray";
			undisableBtn("fileCR");
			undisableBtn("btnMeasure");
			parametersLoaded = true;
		});
		
		// add a large green rectangle (roi window)
		addRect(0, 0, 100, 100, 'rgba(238,0,238,0)', 'rgba(75,0,130,1)');
	}	// end init2
	
	// consists of EVO communication commands
	function evoComm() {
		if (parametersLoaded == true) {
			codeType();
			roiSet();
		}
	}	// end evoComm
	
	function delay(ms) {
		ms += new Date().getTime();
		while (new Date() < ms){}
	}
	
	// consists of code type
	function codeType() {
		if (document.getElementById("dmc").checked) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BDataCodeType%3B0%23');
		}	
		if (document.getElementById("qr").checked) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BDataCodeType%3B1%23');
		}
		if (document.getElementById("microqr").checked) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BDataCodeType%3B2%23');
		}
	}
	
	// consists of roi settings
	function roiSet() {
		var startX = $("#xValue").val() * GLOBAL_SCALE;
		var startY = $("#yValue").val() * GLOBAL_SCALE;
		var width = $("#wValue").val() * GLOBAL_SCALE;
		var height = $("#hValue").val() * GLOBAL_SCALE;
		
		if (document.getElementById("wholeWindow").checked) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BSourceWindow.SourceMode%3B4%23');
		}	
		if (document.getElementById("defineWindow").checked) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BSourceWindow.SourceMode%3B3%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BSourceWindow.SourceWindow.Left%3B'+startX+'%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BSourceWindow.SourceWindow.Top%3B'+startY+'%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BSourceWindow.SourceWindow.Width%3B'+width+'%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BSourceWindow.SourceWindow.Height%3B'+height+'%23');
		}
	}
	
	function getParameterFrominiFile() {
		if (xhr.readyState != 4)  {
			responseCount++;
			if(responseCount > 2){
				ajaxGet("datacode.ini", getParameterFrominiFile);
				responseCount = 0;
			}
			return; 
		}

		var resp = xhr.responseText;
		var command = "datacode";
		var dcCodeType = getIniStr(command, "codetype", resp);
		var dcSourceMode = getIniStr(command, "sourcemode", resp);
		var dcSourceWindowLeft = getIniStr(command, "sourcewindowleft", resp);
		var dcSourceWindowTop = getIniStr(command, "sourcewindowtop", resp);
		var dcSourceWindowWidth = getIniStr(command, "sourcewindowwidth", resp);
		var dcSourceWindowHeight = getIniStr(command, "sourcewindowheight", resp);
		getCodeType(dcCodeType);
		getSourceMode(dcSourceMode, dcSourceWindowLeft, dcSourceWindowTop, dcSourceWindowWidth, dcSourceWindowHeight);
	}
	
	function getCodeType(dcCodeType) {
		if (dcCodeType == 0) {
			$("#dmc").prop("checked", true);
		}
		else if (dcCodeType == 1) {
			$("#qr").prop("checked", true);
		}
		else if (dcCodeType == 2) {
			$("#microqr").prop("checked", true);
		}
	}
	
	function getSourceMode(dcSourceMode, dcSourceWindowLeft, dcSourceWindowTop, dcSourceWindowWidth, dcSourceWindowHeight) {
		if (dcSourceMode == 4) {
			$("#wholeWindow").prop("checked", true);
			document.getElementById("windowBoundary").style.display="none";
			rectRoiFlag = false;
		}
		else if (dcSourceMode == 3) {

			$("#defineWindow").prop("checked", true);
			document.getElementById("windowBoundary").style.display="block";
			
			var roiX = dcSourceWindowLeft / GLOBAL_SCALE;
			var roiY = dcSourceWindowTop / GLOBAL_SCALE;
			var roiW = dcSourceWindowWidth / GLOBAL_SCALE;
			var roiH = dcSourceWindowHeight / GLOBAL_SCALE;
			
			if(roiX <= 0 || roiY <= 0 || (roiX+roiW) > WIDTH || (roiY+roiH) > HEIGHT){
				alert("ROI set back to original position. ROI is out boundary.");
				roiX = boxes2[0].x;
				roiY = boxes2[0].y;
				roiW = boxes2[0].w;
				roiH = boxes2[0].h;
			}
			
			boxes2[0].x = roiX;
			boxes2[0].y = roiY;
			boxes2[0].w = roiW;
			boxes2[0].h = roiH;
			
			rectRoiFlag = true;
		}
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
			
			// draw all boxes
			var l = boxes2.length;
			
			// modified by weiling
			if (rectRoiFlag==true) {
				boxes2[0].draw(ctx);
			} else {
				// don't draw rectangle
			}
			
			// add stuff you want drawn on top all the time here
			
			// added by weiling
			var xPos = boxes2[0].x;
			var yPos = boxes2[0].y;
			var w = boxes2[0].w;
			var h = boxes2[0].h;
			$("#xValue").val(xPos.toFixed(0));
			$("#yValue").val(yPos.toFixed(0));
			$("#wValue").val(w.toFixed(0));
			$("#hValue").val(h.toFixed(0));
	  }
	}

	// happens when the mouse is moving inside the canvas
	function myMove(e) {
		
		if (isDrag) {
			e.preventDefault();
			getMouse(e);
		
			mySel.x = mx - offsetx;
			mySel.y = my - offsety;   
		
			
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
			e.preventDefault();
			var oldx = mySel.x;
			var oldy = mySel.y;
			// 0  1  2
			// 3     4
			// 5  6  7
			
			// added by weiling
			var oldw = mySel.w;
			var oldh = mySel.h;
			
			
			if (mx > WIDTH)
				mx = WIDTH;
			if (my > HEIGHT)
				my = HEIGHT;
			
			// for android bug
			if (mx < 0)
				mx = 0;
			if (my < 0)
				my = 0;
			
			switch (expectResize) {
				case 0:
					// added by weiling
					while (mx >= oldx + oldw) {
						mx = (oldx + oldw) - 25;
					}
					while (my >= oldy + oldh) {
						my = (oldy + oldh) - 25;
					}
					mySel.x = mx;
					mySel.y = my;
					mySel.w += oldx - mx;
					mySel.h += oldy - my;
					break;
				case 1:
					// added by weiling
					while (my >= oldy + oldh) {
						my = (oldy + oldh) - 25;
					}
					mySel.y = my;
					mySel.h += oldy - my;
					break;
				case 2:
					// added by weiling
					while (mx <= oldx) {
						mx = oldx + 25;
					}
					while (my >= oldy + oldh) {
						my = (oldy + oldh) - 25;
					}
					mySel.y = my;
					mySel.w = mx - oldx;
					mySel.h += oldy - my;
					break;
				case 3:
					// added by weiling
					while (mx >= oldx + oldw) {
						mx = (oldx + oldw) - 25;
					}
					mySel.x = mx;
					mySel.w += oldx - mx;
					break;
				case 4:
					// added by weiling
					while (mx <= oldx) {
						mx = oldx + 25;
					}
					mySel.w = mx - oldx;
					break;
				case 5:
					// added by weiling
					while (mx >= oldx + oldw) {
						mx = (oldx + oldw) - 25;
					}
					while (my <= oldy) {
						my = oldy + 25;
					}
					mySel.x = mx;
					mySel.w += oldx - mx;
					mySel.h = my - oldy;
					break;
				case 6:
					// added by weiling
					while (my <= oldy) {
						my = oldy + 25;
					}
					mySel.h = my - oldy;
					break;
				case 7:
					// added by weiling
					while (mx <= oldx) {
						mx = oldx + 25;
					}
					while (my <= oldy) {
						my = oldy + 25;
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
				
				if (mx >= cur.x && mx <= cur.x + mySelBoxSize*3 && my >= cur.y && my <= cur.y + mySelBoxSize*3) {
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
	}	// end myMove

	// happens when the mouse is clicked in the canvas
	function myDown(e) {
		
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
				
				if (mx >= cur.x && mx <= cur.x + mySelBoxSize*3 && my >= cur.y && my <= cur.y + mySelBoxSize*3) {
					// we found one!
					e.preventDefault();
					expectResize = i;
					isResizeDrag = true;
					invalidate();
					return;
				}
			}
		  
			// we are over a selection box
			if (expectResize !== -1) {
				isResizeDrag = true;
				return;
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
	}	// end myUp

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
		
		// for android bug
		if (mx < 0) {
			var rect = canvas.getBoundingClientRect();
			mx = e.targetTouches[0].clientX - rect.left;
			my = e.targetTouches[0].clientY - rect.top;
		}
	}

	// if you don't want to use <body onLoad='init()'>
	// you could uncomment this init() reference and place the script reference inside the body tag
	//init();
	window.init2 = init2;
})(window);