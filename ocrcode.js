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

	//flag for rectangle opacity (character size)
	var rectFlag = false;

	// flag for rectangle opacity (roi window)
	var rectRoiFlag = false;
	
	var iniWidth = 752;
	var iniHeight = 752;
	
	var parametersLoaded = false;
	
	var commandName = "EVO%20OCR";
	
	var toolNo;

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
	
		var tempCmd, tempBarcode, tempDatacode;
		tempCmd = getCookie("cmdOcr");
		tempBarcode = getCookie("cmdBarcode");
		tempDatacode = getCookie("cmdDatacode");
		if(tempCmd != null && tempCmd != "")
			commandName = tempCmd;
		if(tempBarcode == null || tempBarcode == "")
			tempBarcode = "EVO%20BarCode";
		if(tempDatacode == null || tempDatacode == "")
			tempDatacode = "EVO%20DataCode";
		
		// disable barcode and 2d code
		enableBarCode(tempBarcode, 0);
		enableDataCode(tempDatacode, 0);
			
		//for camera trigger
		//ajaxGet("info.htm?cmd=%23021%3BCapture image%3B2%3BCaptureType%3B0%23");
		ajaxGet("info.htm?cmd=%23021%3BCapture image%3B2%3BTriggeredCapture%3B0%23");
		
		/* // enable ocr
		ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BGeneral.Enabled%3B1%23');
		ajaxGet('info.htm?cmd=%23021%3BScript%20OCR%3B2%3BGeneral.Enabled%3B1%23');

		
		// disable barcode and 2d code in case they are still enabled
		ajaxGet('info.htm?cmd=%23021%3BEVO%20BarCode%3B2%3BGeneral.Enabled%3B0%23');
		ajaxGet('info.htm?cmd=%23021%3BScript%20BarCode%3B2%3BGeneral.Enabled%3B0%23');
		ajaxGet('info.htm?cmd=%23021%3BEVO%20DataCode%3B2%3BGeneral.Enabled%3B0%23');
		ajaxGet('info.htm?cmd=%23021%3BScript%20DataCode%3B2%3BGeneral.Enabled%3B0%23'); */
		
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
			//not to confuse with previous result
			$("#resultDisplay").val("");
			//evoComm();
			ajaxGet("cfg.ini", getCodeValueFrominiFile);	
		});
		
		// Unload ckp file and go back to main menu
		document.getElementById("btnhome").addEventListener("click", function(){
				
			var codeFilename = getCookie("fileCR");
			ajaxGet('info.htm?cmd=%23018' + codeFilename + '.ckp%23');
			delay(1000);
			window.location.href='index.htm';
		});
		
		$("#loadValues").click(function(){
		
			toolNo = document.getElementById("selectedNumber").value;
			enableOCR(commandName, toolNo);
			
			commandName = commandName + " " + toolNo;
			//get settings
			ajaxGet("ocr.ini", getParameterFrominiFile);
			this.disabled = true;
			this.style.color="gray";
			document.getElementById("selectedNumber").disabled = true;
			undisableBtn("fileCR");
			undisableBtn("btnMeasure");
			parametersLoaded = true;
						
			//ajaxGet("info.htm?cmd=%23002%23");
			//intervalUpdateStart();
			//undisableBtn("btnStop");
		});
		
		/* $("#btnGo").click(function(){
			undisableBtn("loadValues");
			
			toolNo = document.getElementById("selectedNumber").value;
			enableOCR(toolNo);
			
			ajaxGet("info.htm?cmd=%23002%23");
			intervalUpdateStart();
			undisableBtn("btnStop");
		}); */
		
		// add a large green rectangle (roi window)
		addRect(0, 0, 100, 100, 'rgba(0,205,0,0)', 'rgba(0,205,0,1)');
	  
		// add a green-blue rectangle (character size)
		addRect(0, 0, 100, 100, 'rgba(2,165,165,0)', 'rgba(2,165,165,1)');
	}	// end init2
	
	// consists of EVO communication commands
	function evoComm() {
		if (parametersLoaded == true) {
			fontType();
			polarityType();
			charOptions();
			roiSet();
		}
	}	// end evoComm
	
	function delay(ms) {
		ms += new Date().getTime();
		while (new Date() < ms){}
	}
	
	// consists of font type
	function fontType() {
		if (document.getElementById("industrial").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B0%23');
		}
		else if (document.getElementById("industrial09").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B1%23');
		}
		else if (document.getElementById("industrial09AZ").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B3%23');
		}
		else if (document.getElementById("industrial09P").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B2%23');
		}
		else if (document.getElementById("industrialAZP").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B4%23');
		}
		else if (document.getElementById("dotPrint").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B5%23');
		}
		else if (document.getElementById("dotPrint09").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B6%23');
		}
		else if (document.getElementById("dotPrint09AZ").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B7%23');
		}
		else if (document.getElementById("dotPrint09P").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B9%23');
		}
		else if (document.getElementById("dotPrintAZP").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B8%23');
		}
		else if (document.getElementById("document").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B10%23');
		}
		else if (document.getElementById("document09").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B11%23');
		}
		else if (document.getElementById("document09AZ").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B12%23');
		}
		else if (document.getElementById("documentAZP").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B13%23');
		}
		else if (document.getElementById("enhancedOCRA").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B14%23');
		}
		else if (document.getElementById("enhancedOCRB").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B15%23');
		}
		else if (document.getElementById("pharma").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B16%23');
		}
		else if (document.getElementById("pharma09").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B17%23');
		}
		else if (document.getElementById("pharma09AZ").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B19%23');
		}
		else if (document.getElementById("pharma09P").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B18%23');
		}
		else if (document.getElementById("micr").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B20%23');
		}
		else if (document.getElementById("semi").selected) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BfontNum%3B21%23');
		}
	}
	
	// consists of polarity type
	function polarityType() {
		if (document.getElementById("darkOnLight").checked) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BpolarityType%3B0%23');
		} else {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BpolarityType%3B1%23');
		}
	}
	
	// consists of advanced character options
	function charOptions() {
		var charStartX = $("#charXValue").val() * GLOBAL_SCALE;
		var charStartY = $("#charYValue").val() * GLOBAL_SCALE;
		var charWidth = $("#charWValue").val() * GLOBAL_SCALE;
		var charHeight = $("#charHValue").val() * GLOBAL_SCALE;
			
		if (document.getElementById("dotted").checked) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BdotType%3B1%23');
		} else {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BdotType%3B0%23');
		}
			
		if( document.getElementById("rotationCorrection").checked) {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BrotateType%3B1%23');
		} else {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BrotateType%3B0%23');
		}
			
		if (document.getElementById("characterSize").checked) {
			// auto character size
			if (document.getElementById("auto").checked) {
				ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BsegmentationType%3B0%23');
				ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BAutoCharX%3B'+charStartX+'%23');
				ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BAutoCharY%3B'+charStartY+'%23');
				ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BAutoCharW%3B'+charWidth+'%23');
				ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BAutoCharH%3B'+charHeight+'%23');
			} else {	// manual character size
				ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BsegmentationType%3B1%23');
				ajaxGet('any.htm?cmd=%23021%3B'+commandName+'%3B1%3BcharX%3B'+charStartX+'%23');
				ajaxGet('any.htm?cmd=%23021%3B'+commandName+'%3B1%3BcharY%3B'+charStartY+'%23');
				ajaxGet('any.htm?cmd=%23021%3B'+commandName+'%3B1%3BcharW%3B'+charWidth+'%23');
				ajaxGet('any.htm?cmd=%23021%3B'+commandName+'%3B1%3BcharH%3B'+charHeight+'%23');
			}
		} else {
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B2%3BsegmentationType%3B0%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BAutoCharX%3B50%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BAutoCharY%3B50%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BAutoCharW%3B40%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BAutoCharH%3B50%23');
		}
	}
	
	// consists of roi settings
	function roiSet() {
		if (document.getElementById("wholeWindow").checked) {					
			if (isNaN(IMG_WIDTH) || isNaN(IMG_HEIGHT) || isNaN(GLOBAL_SCALE)) {
				var startX = 0;
				var endX = iniWidth;
				var startY = iniHeight / 2;
				var endY = iniHeight / 2;
				var width = iniHeight;
			} else {
				var startX = 0;
				var endX = IMG_WIDTH * GLOBAL_SCALE;
				var startY = IMG_HEIGHT / 2 * GLOBAL_SCALE;
				var endY = IMG_HEIGHT / 2 * GLOBAL_SCALE;
				var width = IMG_HEIGHT;
			}
			
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.PointStart.X%3B'+startX+'%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.PointEnd.X%3B'+endX+'%23');			
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.PointStart.Y%3B'+startY+'%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.PointEnd.Y%3B'+endY+'%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.Width%3B'+width+'%23');
		}
		else if (document.getElementById("defineWindow").checked) {
			var startX = $("#xValue").val() * GLOBAL_SCALE;
			var endX = (parseInt($("#xValue").val()) + parseInt($("#wValue").val())) * GLOBAL_SCALE;
			var startY = (parseInt($("#yValue").val()) + (parseInt($("#hValue").val())/2)) * GLOBAL_SCALE;
			var endY = (parseInt($("#yValue").val()) + (parseInt($("#hValue").val())/2)) * GLOBAL_SCALE;
			var width = $("#hValue").val() * GLOBAL_SCALE;
		
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.PointStart.X%3B'+startX+'%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.PointEnd.X%3B'+endX+'%23');			
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.PointStart.Y%3B'+startY+'%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.PointEnd.Y%3B'+endY+'%23');
			ajaxGet('info.htm?cmd=%23021%3B'+commandName+'%3B1%3BposRect.Width%3B'+width+'%23');
		}
	}
	var responseCount = 0;
	function getParameterFrominiFile() {
		if (xhr.readyState != 4)  {
			responseCount++;
			if(responseCount > 2){
				ajaxGet("ocr.ini", getParameterFrominiFile);
				responseCount = 0;
			}
			return; 
		}
		var resp = xhr.responseText;
		var command = "ocr";
		var ocrFontType = getIniStr(command+toolNo, "fontnum", resp);
		var ocrPolarityType = getIniStr(command+toolNo, "polaritytype", resp);
		var ocrDotted = getIniStr(command+toolNo, "dottype", resp);
		var ocrRotationCorrection = getIniStr(command+toolNo, "rotatetype", resp);
		var ocrCharSizeType = getIniStr(command+toolNo, "segmentationtype", resp);
		var ocrAutoCharX = getIniStr(command+toolNo, "autocharx", resp);
		var ocrAutoCharY = getIniStr(command+toolNo, "autochary", resp);
		var ocrAutoCharW = getIniStr(command+toolNo, "autocharw", resp);
		var ocrAutoCharH = getIniStr(command+toolNo, "autocharh", resp);
		var ocrCharX = getIniStr(command+toolNo, "charx", resp);
		var ocrCharY = getIniStr(command+toolNo, "chary", resp);
		var ocrCharW = getIniStr(command+toolNo, "charw", resp);
		var ocrCharH = getIniStr(command+toolNo, "charh", resp);
		var ocrStartX = getIniStr(command+toolNo, "pointstartx", resp);
		var ocrEndX = getIniStr(command+toolNo, "pointendx", resp);
		var ocrStartY = getIniStr(command+toolNo, "pointstarty", resp);
		var ocrEndY = getIniStr(command+toolNo, "pointendy", resp);
		var ocrWidth = getIniStr(command+toolNo, "width", resp);
		getFontType(ocrFontType);
		getPolarityType(ocrPolarityType);
		getDotted(ocrDotted);
		getRotationCorrection(ocrRotationCorrection);
		getCharType(ocrCharSizeType, ocrAutoCharX, ocrAutoCharY, ocrAutoCharW, ocrAutoCharH, ocrCharX, ocrCharY, ocrCharW, ocrCharH);
		getSourceMode(ocrStartX, ocrEndX, ocrStartY, ocrEndY, ocrWidth);
	}
	
	function getFontType(ocrFontType) {
		if (ocrFontType == 0) {
			$("#industrial").prop("selected", true);
		}
		else if (ocrFontType == 1) {
			$("#industrial09").prop("selected", true);
		}
		else if (ocrFontType == 2) {
			$("#industrial09P").prop("selected", true);
		}
		else if (ocrFontType == 3) {
			$("#industrial09AZ").prop("selected", true);
		}
		else if (ocrFontType == 4) {
			$("#industrialAZP").prop("selected", true);
		}
		else if (ocrFontType == 5) {
			$("#dotPrint").prop("selected", true);
		}
		else if (ocrFontType == 6) {
			$("#dotPrint09").prop("selected", true);
		}
		else if (ocrFontType == 7) {
			$("#dotPrint09AZ").prop("selected", true);
		}
		else if (ocrFontType == 8) {
			$("#dotPrintAZP").prop("selected", true);
		}
		else if (ocrFontType == 9) {
			$("#dotPrint09P").prop("selected", true);
		}
		else if (ocrFontType == 10) {
			$("#document").prop("selected", true);
		}
		else if (ocrFontType == 11) {
			$("#document09").prop("selected", true);
		}
		else if (ocrFontType == 12) {
			$("#document09AZ").prop("selected", true);
		}
		else if (ocrFontType == 13) {
			$("#documentAZP").prop("selected", true);
		}
		else if (ocrFontType == 14) {
			$("#enhancedOCRA").prop("selected", true);
		}
		else if (ocrFontType == 15) {
			$("#enhancedOCRB").prop("selected", true);
		}
		else if (ocrFontType == 16) {
			$("#pharma").prop("selected", true);
		}
		else if (ocrFontType == 17) {
			$("#pharma09").prop("selected", true);
		}
		else if (ocrFontType == 18) {
			$("#pharma09P").prop("selected", true);
		}
		else if (ocrFontType == 19) {
			$("#pharma09AZ").prop("selected", true);
		}
		else if (ocrFontType == 20) {
			$("#micr").prop("selected", true);
		}
		else if (ocrFontType == 21) {
			$("#semi").prop("selected", true);
		}
	}
	
	function getPolarityType(ocrPolarityType) {
		if (ocrPolarityType == 0) {
			$("#darkOnLight").prop("checked", true);
		}
		else if (ocrPolarityType == 1) {
				$("#lightOnDark").prop("checked", true);
		}
	}
	
	function getDotted(ocrDotted) {
		if (ocrDotted == 0) {
			$("#dotted").prop("checked", false);
		}
		else if (ocrDotted == 1) {
				$("#dotted").prop("checked", true);
		}
	}
	
	function getRotationCorrection(ocrRotationCorrection) {
		if (ocrRotationCorrection == 0) {
			$("#rotationCorrection").prop("checked", false);
		}
		else if (ocrRotationCorrection == 1) {
				$("#rotationCorrection").prop("checked", true);
		}
	}
	
	function getCharType(ocrCharSizeType, ocrAutoCharX, ocrAutoCharY, ocrAutoCharW, ocrAutoCharH, ocrCharX, ocrCharY, ocrCharW, ocrCharH) {
		// auto
		if (ocrCharSizeType == 0) {
			$("#characterSize").prop("checked", true);
			$("#auto").prop("checked", true);
			document.getElementById("characterBoundary").style.display="block";
			
			var autoCharX = ocrAutoCharX / GLOBAL_SCALE;
			var autoCharY = ocrAutoCharY / GLOBAL_SCALE;
			var autoCharW = ocrAutoCharW / GLOBAL_SCALE;
			var autoCharH = ocrAutoCharH / GLOBAL_SCALE;
					
			boxes2[1].x = autoCharX;
			boxes2[1].y = autoCharY;
			boxes2[1].w = autoCharW;
			boxes2[1].h = autoCharH;
			
			rectFlag=true;
		}
		else if (ocrCharSizeType == 1) {	// manual
			$("#characterSize").prop("checked", true);
			$("#manual").prop("checked", true);
			document.getElementById("characterBoundary").style.display="block";
			
			var charX = ocrCharX / GLOBAL_SCALE;
			var charY = ocrCharY / GLOBAL_SCALE;
			var charW = ocrCharW / GLOBAL_SCALE;
			var charH = ocrCharH / GLOBAL_SCALE;
					
			boxes2[1].x = charX;
			boxes2[1].y = charY;
			boxes2[1].w = charW;
			boxes2[1].h = charH;
			
			rectFlag=true;
		}
	}
	
	function getSourceMode(ocrStartX, ocrEndX, ocrStartY, ocrEndY, ocrWidth) {
		/* if ((ocrStartX <= 0) && (ocrStartY == (IMG_HEIGHT/GLOBAL_SCALE)) && (ocrEndX > (IMG_WIDTH/GLOBAL_SCALE)) && (ocrWidth > (IMG_HEIGHT/GLOBAL_SCALE))) {
			$("#wholeWindow").prop("checked", true);
		}
		else { */
			$("#defineWindow").prop("checked", true);
			document.getElementById("windowBoundary").style.display="block";
			
			var roiX = ocrStartX / GLOBAL_SCALE;
			var roiY = (ocrStartY - (ocrWidth/2)) / GLOBAL_SCALE;
			var roiW = (ocrEndX - ocrStartX) / GLOBAL_SCALE;
			var roiH = ocrWidth / GLOBAL_SCALE;
					
			boxes2[0].x = roiX;
			boxes2[0].y = roiY;
			boxes2[0].w = roiW;
			boxes2[0].h = roiH;
			
			rectRoiFlag=true;
		//}
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
			for (var i = 0; i < l; i++) {
				if (rectFlag==false && rectRoiFlag==false) {
					// don't draw both rectangles
				} else if (rectFlag==false && rectRoiFlag==true) {	// draw roi rectangle
					boxes2[0].draw(ctx);
				} else if (rectFlag==true && rectRoiFlag==false) {	// draw character size rectangle
					boxes2[1].draw(ctx);
					// create text for character size
					// boxes2[0] is for roi, boxes2[1] is for character size
					ctx.font="20px Georgia";
					ctx.fillStyle = 'black';
					ctx.fillText("C",boxes2[1].x+boxes2[1].w-20,boxes2[1].y+20);
				} else {	// draw both rectangles
					boxes2[i].draw(ctx); // we used to call drawshape, but now each box draws itself
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
			$("#charXValue").val(charXPos.toFixed(0));
			$("#charYValue").val(charYPos.toFixed(0));
			$("#charWValue").val(charW.toFixed(0));
			$("#charHValue").val(charH.toFixed(0));
			
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