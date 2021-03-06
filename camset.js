/* this file uses jquery.js framework */
/* this file uses evt.js */
/* this file uses dragdeal.js framework */
var test;
var gainSlider;
var shutterSlider;
var STEP_SIZE_GAIN = 1;
var STEP_SIZE_SHUTTER = 1;
var cam = 1;
var myInterval;
var queryString;
var IMG_WIDTH
var IMG_HEIGHT;
var IMG_ACT_WIDTH;
var IMG_ACT_HEIGHT;
var GLOBAL_SCALE = 1;
var GLOBAL_SCALE_X = 1;
var GLOBAL_SCALE_Y = 1;

/*make sure we are in the right mode*/
//ajaxGet("info.htm?cmd=%23021%3Bchoice%3B1%3BConstantValue%3B2%23");

/* init() needs to access some dom elements, so the complete page needs to be loaded before */
$(document).ready(function(){
	init();
    
});

/* bind events to button elements initialize the sliders... */
function init(){
	setCalibrationFromCookie();
	ajaxGet("info.htm?cmd=%23021%3BCalibration%3B1%3BScaleFactorX%3B" + GLOBAL_SCALE_X + "%23");
	ajaxGet("info.htm?cmd=%23021%3BCalibration%3B1%3BScaleFactorY%3B" + GLOBAL_SCALE_Y + "%23");
	
	queryString = new Array();
    
    if (queryString.length == 0) {
        if (window.location.search.split('?').length > 1) {
            var params = window.location.search.split('?')[1].split('&');
            for (var i = 0; i < params.length; i++) {
                var key = params[i].split('=')[0];
                var value = decodeURIComponent(params[i].split('=')[1]);
                queryString[key] = value;
            }
        }
    }
    if (queryString["tool"] != null && queryString["toolNo"] != null) {
        //added temporarily
		//document.getElementById("resultDisplay").value=queryString["tool"] + " " + queryString["toolNo"];
    }
    
	
	
	
 	$("input[name='searchType']").change(function(){
		if($("input[name='searchType']:radio:checked").val()=="full"){
			$("#windowBoundary").hide(100);
			$('#selectionArea').css("display","none");
		}else{
			$("#windowBoundary").show(100);
			
			$("#selectionArea").css("display","block");

        $("#selectionArea")
         .draggable({
            containment: '#imgSnapshot',
            drag: function(){
                var offset = $(this).position();
                var xPos = offset.left;
                var yPos = parseInt(offset.top)-27;
                var w = $(this).width();
                var h = $(this).height();
                $("#xvalue").val(xPos);
                $("#yvalue").val(yPos);
                $("#wvalue").val(w);
                $("#hvalue").val(h);
            }
         })
         .resizable({
            containment: "#imgSnapshot",
            resize: function(event, ui){
                var offset = $(this).position();
                var xPos = offset.left;
                var yPos = parseInt(offset.top)-27;
                var w = $(this).width();
                var h = $(this).height();
                $("#xvalue").val(xPos);
                $("#yvalue").val(yPos);
                $("#wvalue").val(w);
                $("#hvalue").val(h);
            } 

         });
		}
		
	});
	
   $("#btnStart").click(function(){
		ajaxGet("info.htm?cmd=%23002%23");
		
		//ajaxGet("cfg.ini", getValueFrominiFile);
		
		intervalUpdateStart();
		disableBtn($(this).attr('id'));
		undisableBtn("btnMeasure");
		setImgFlag(false);
		}
	);
	
	
	
	$("#btnCodeStart").click(function(){
		ajaxGet("info.htm?cmd=%23002%23");
		
		//ajaxGet("cfg.ini", getCodeValueFrominiFile);
		
		intervalUpdateStart();
		disableBtn($(this).attr('id'));
		undisableBtn("btnMeasure");
		setImgFlag(false);
		//alert("");
		}
	);


	$("#btnStop").click(function(){
		clearInterval(myInterval);
		ajaxGet("info.htm?cmd=%23004%23");
		intervalUpdateStop();
		undisableBtn("btnStart");
		undisableBtn("btnCodeStart");
		disableBtn("btnMeasure");
		}
	);
	
	disableBtn("btnMeasure");
 

     $('#completeWindow').click(function(){
        $('#selectionArea').css("display","none");
     });
	
	/*
	gainSlider = new Dragdealer('gain-slider', {
		steps: 100/STEP_SIZE_GAIN,
		speed: 100,
		snap: true,
		animationCallback: function(x,Y){
			$("#divSlideBarGain")[0].innerHTML = Math.round(x*this.steps)*STEP_SIZE_GAIN;
			if (Math.round(x*100) < 20){
				$("#divSlideBarGain").attr('class', 'norm handle bar');
			}
			else if (Math.round(x*100) < 80){
				$("#divSlideBarGain").attr('class', 'good handle bar');
			}
			else{
				$("#divSlideBarGain").attr('class', 'norm handle bar');
			}
		}
	});
	/* event to actually send the slider value to the server 
	$("#divSlideBarGain").mouseup(function(){
		ajaxGet('info.htm?cmd=%23021%3Bgain' + cam + '%3B1%3BConstantValue%3B'+ $("#divSlideBarGain")[0].innerHTML +'%23');
		}
	);

	shutterSlider = new Dragdealer('shutter-slider', {
		steps :100/STEP_SIZE_SHUTTER,
		speed: 100,
		snap: true,
		animationCallback: function(x,Y){
			$("#divSlideBarShutter")[0].innerHTML = Math.round(x*this.steps)*STEP_SIZE_SHUTTER;
			if (Math.round(x*100) < 20){
				$("#divSlideBarShutter").attr('class', 'norm handle bar');
			}
			else if (Math.round(x*100) < 80){
				$("#divSlideBarShutter").attr('class', 'good handle bar');
			}
			else{
				$("#divSlideBarShutter").attr('class', 'norm handle bar');
			}
		}
	});
	/* event to actually send the slider value to the server 
	$("#divSlideBarShutter").mouseup(function(){
		ajaxGet('info.htm?cmd=%23021%3Bshutter' + cam + '%3B1%3BConstantValue%3B'+ $("#divSlideBarShutter")[0].innerHTML +'%23');
		}
	);
	
	
	/* load ini file and call iniResponse function 
	ajaxGet("cfg.ini",iniResponse);
	
	img = $("#imgSnapshot")[0].src = "/snapshot";

	/* by cookies update state is passed between pages 
	if(getCookie("live") == 1){
		intervalUpdateStart();
	}
	
	*/

}

/* does the ini file trick to set some initial values on the page, slider position for example */
function iniResponse(){
	if (xhr.readyState != 4)  { return; }
	var resp = xhr.responseText;
	
	var val = getIniStr("cam" + cam,"shutter" + cam,resp);
	shutterSlider.setStep(parseInt(val)/STEP_SIZE_SHUTTER +1);  //because steps start with "0"
	val = getIniStr("cam" + cam,"gain" + cam,resp);
	gainSlider.setStep(parseInt(val)/STEP_SIZE_GAIN +1);  //because steps start with "0"
	//alert(val);
}

function getImgSize(inWidth, inHeight){
		IMG_WIDTH = inWidth;
		IMG_HEIGHT = inHeight;
		setGlobalScale();
		//var canvasNode = document.getElementById('canvas2');
		//canvasNode.width  = IMG_WIDTH; // in pixels
		//canvasNode.height = IMG_HEIGHT; // in pixels
		
		
	}

var responseCount = 0;
function getValueFrominiFile()
{
	if (xhr.readyState != 4)  {
		responseCount++;
		if(responseCount > 2){
			ajaxGet("cfg.ini", getValueFrominiFile);
			responseCount = 0;
		}
		return; 
	}
		//console.log("ready state");
		var resp = xhr.responseText;
		globalResult = getIniStr("cam1", "result1", resp);
		
		$("#resultDisplay").val(globalResult);
		
				
		var cookieName = queryString["tool"] + queryString["toolNo"];
				
		setCookie(cookieName,globalResult,1);
		
		responseCount = 0;
}

function getCodeValueFrominiFile()
{
	if (xhr.readyState != 4)  {
		if(xhr.readyState == 1)
			responseCount++;
		if(responseCount > 2){
				ajaxGet("cfg.ini", getCodeValueFrominiFile);
				responseCount = 0;
		}
		return; 
	}
		var resp = xhr.responseText;
		globalResult = getIniCodeStr("coderesult1=", resp);
		
		$("#resultDisplay").val(globalResult);
		
		var cookieName = queryString["tool"] + queryString["toolNo"];
				
		setCookie(cookieName,globalResult,1);
}



/* called to update the live image into the canvas */
function updateHelper(){
	updateImg("#imgSnapshot","/snapshot");
}

function setImgActualSize(width, height){
	IMG_ACT_WIDTH = width;
	IMG_ACT_HEIGHT = height;
}
function setGlobalScale(){
	GLOBAL_SCALE = IMG_ACT_WIDTH/IMG_WIDTH;
}

function hideSelectedAreaBox(){
	$("#selectionArea").css("display","none");
}
function showSelectedAreaBox(){
	$("#selectionArea").css("display","block");
	$("#selectionArea").css("border-radius","0%");

        $("#selectionArea")
         .draggable({
            containment: '#imgSnapshot',
            drag: function(){
                var offset = $(this).position();
                var xPos = offset.left;
                var yPos = parseInt(offset.top)-27;
                var w = $(this).width();
                var h = $(this).height();
                $("#xvalue").val(xPos);
                $("#yvalue").val(yPos);
                $("#wvalue").val(w);
                $("#hvalue").val(h);
            }
         })
         .resizable({
            containment: "#imgSnapshot",
            resize: function(event, ui){
                var offset = $(this).position();
                var xPos = offset.left;
                var yPos = parseInt(offset.top)-27;
                var w = $(this).width();
                var h = $(this).height();
                $("#xvalue").val(xPos);
                $("#yvalue").val(yPos);
                $("#wvalue").val(w);
                $("#hvalue").val(h);
            } 

         })
		 .resize(function(){
			 
			 var cw = $("#selectionArea").height();
				$("#selectionArea").css({'height':cw+'px'});
			}
		)
		 ;
}

function hideSelectedAreaCircle(){
	$('#selectionArea').css("display","none");
}

function showSelectedAreaCircle(){
	
	$("#selectionArea").css("display","block");
	$("#selectionArea").css("border-radius","50%");
	
		$("#selectionArea")
         .draggable({
            containment: '#imgSnapshot',
            drag: function(){
				
				var offset = $(this).position();
				var xPos = offset.left;
				var yPos = parseInt(offset.top)-27;
				var w = $(this).width();
				var h = $(this).height();
				var centriodx = (w / 2) + xPos;
				var centriody = (h / 2) + yPos;
				$("#xvalue").val(centriodx);
				$("#yvalue").val(centriody);
				$("#startvalue").val(0);
				$("#anglevalue").val(360);
				$("#outervalue").val(w);
				$("#innervalue").val(0);
            }
         })
         .resizable({
            containment: "#imgSnapshot",
            resize: function(event, ui){
				
				var offset = $(this).position();
				var xPos = offset.left;
				var yPos = parseInt(offset.top)-27;
				var w = $(this).width();
				var h = $(this).height();
				var centriodx = (w / 2) + xPos;
				var centriody = (h / 2) + yPos;
				$("#xvalue").val(centriodx);
				$("#yvalue").val(centriody);
				$("#startvalue").val(0);
				$("#anglevalue").val(360);
				$("#outervalue").val(w);
				$("#innervalue").val(0);
				
            } 

         })
		 
		 .resize(function(){
				var cw = $("#selectionArea").height();
				
				$("#selectionArea").css({'width':cw+'px'});
			}
		);
}

function showCodeType(radioVal){
            if(radioVal === "abarcode" ){
                document.getElementById("anybarcode").style.display="none";
            }else{
                document.getElementById("anybarcode").style.display="block";
            }
}

/* edited */
function showWindowConfig(radioVal){
            if(radioVal === "full"){
                document.getElementById("windowBoundary").style.display="none";
            }else{
                document.getElementById("windowBoundary").style.display="block";
            }
}

function showCharWindowConfig(){
	document.getElementById("characterBoundary").style.display="none";
	
    if(document.getElementById("characterSize").checked){
        document.getElementById("characterBoundary").style.display="block";
    }
}

function clickedImgBtn(clickedImageId){
	document.getElementById(clickedImageId).style.borderColor="green";
	var filename = "";
	document.getElementById(clickedImageId).src=filename+clickedImageId+"Selected.jpg"
	setTimeout(function(){
		document.getElementById(clickedImageId).style.borderColor="gray";
		document.getElementById(clickedImageId).src=filename+clickedImageId+".jpg"
	}, 150);
	
	switch(clickedImageId){
		case "circleImgBtn":
			location.href = 'circlewidth.htm';
		break;
		case "widthImgBtn":
			location.href = 'width.html';
		break;
		case "ptpImgBtn":
			location.href = 'p_to_p.html';
		break;
		case "ptlImgBtn":
			location.href = 'p_to_l.html';
		break;
		case "ptcImgBtn":
			location.href = 'p_to_c.htm';
		break;
		case "ctcImgBtn":
			location.href = 'c_to_c.htm';
		break;
		case "ctlImgBtn":
			location.href = 'l_to_c.htm';
		break;
		default:
			
		break;
	}
}

function clickCheckedBoxes(clickedCb){
	switch(clickedCb.id){
		case "cbCircleSetting":
			if(clickedCb.checked){
				//document.getElementById("circleDetail").style.display="block";
				$("#circleDetail").show(100);
			}else{
				//document.getElementById("circleDetail").style.display="none";
				$("#circleDetail").hide(100);
			}
		break;
		
		case "cbRectSetting":
			if(clickedCb.checked){
				$("#rectDetail").show(100);
			}else{
				$("#rectDetail").hide(100);
			}
		break;
		
		case "cbTolSetting":
			if(clickedCb.checked){
				$("#tolDetail").show(100);
			}else{
				$("#tolDetail").hide(100);
			}
		break;
		
		case "cbResultSetting":
			if(clickedCb.checked){
				$("#resultDetail").show(100);
			}else{
				$("#resultDetail").hide(100);
			}
		break;
		
		case "cbPointSetting":
			if(clickedCb.checked){
				$("#pointDetail").show(100);
			}else{
				$("#pointDetail").hide(100);
			}
		break;
		
		case "cbLineSetting":
			if(clickedCb.checked){
				$("#lineDetail").show(100);
			}else{
				$("#lineDetail").hide(100);
			}
		break;
		
		case "cbWidthSetting":
			if(clickedCb.checked){
				$("#evoWidthSettings").show(100);
			}else{
				$("#evoWidthSettings").hide(100);
			}
		break;
		
	}
}

var radioNames =[];
var radioValues = [];
function saveRadioButtons(){
	var elems = document.getElementsByTagName('input');
	//var str = "";
	for(var i=0; i < elems.length; i++){
		if(elems[i].type=="radio"){
			radioNames[i] = elems[i].id;
			radioValues[i] = elems[i].checked;
			//str += elems[i].id + ": " + elems[i].checked + "\n";
		}
	}
	//alert(str);
}

function restoreRadioButtons(){
	for(var i=0; i < radioNames.length; i++){
		var radioButt = document.getElementById(radioNames[i]);
		if(radioButt !== null){
			radioButt.checked = radioValues[i];
		}
	}
}
function saveScreenshot(){
	//html2canvas has limitation which has to go back to origin point, therefore scroll to top
	var leftScroll = $(window).scrollLeft();
	var topScroll = $(window).scrollTop();
	$(window).scrollLeft(0);
	$(window).scrollTop(0);
	
	//html2canvas will cause radiobuttons' values disappear in mobile, therefore fixed the bug
	//save radiobuttons values
	saveRadioButtons();
	html2canvas(document.getElementById("imageArea")).then(function(canvas) {
		
		if (queryString["tool"] != null && queryString["toolNo"] != null) {
			var dataURL = canvas.toDataURL();
			localStorage.setItem("shot" + queryString["tool"] + queryString["toolNo"], dataURL);
		}
		
		
	});
	//reload radiobuttons values
	restoreRadioButtons();
	
	$(window).scrollLeft(leftScroll);
	$(window).scrollTop(topScroll);
}

function setCalibrationFromCookie(){
	var calX = getCookie("calX");
	var calY = getCookie("calY");
	
	if(calX !== null  && calX !== 0)
		GLOBAL_SCALE_X = calX;
	if(calY !== null  && calY !== 0)
		GLOBAL_SCALE_Y = calY;
}

function disableBtn(btnId) {
	var btn = document.getElementById(btnId);
	if(btn !== null){
		btn.disabled = true;
		btn.style.color="gray";
	}
}

function undisableBtn(btnId) {
	var btn = document.getElementById(btnId);
	if(btn !== null){
		document.getElementById(btnId).disabled = false;
		document.getElementById(btnId).style.color="#00628B";
	}
}

function saveProgram(cookieName){
	var fileName = getCookie(cookieName);
	ajaxGet('info.htm?cmd=%23024'+ fileName +'.ckp%23');
	alert(fileName + ' program saved');
}
