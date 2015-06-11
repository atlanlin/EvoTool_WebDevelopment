/*
this file contains the following functions:
 initRubberband(idX, idY, idWidth, idHeight)
 doDrawStart(event)
 doDrawUpdate(event) 
 doDrawStop(event)
 doRedraw()
 intervalUpdateStart()
 intervalUpdateStop()
 canvasUpdate(imgSrc,w,h)
 updateImg(imgId,imgSrc)
 ajaxGet(file,callBackFck)
 getIniStr(section,key,fileStr)
 setCookie(name,value,days)
 getCookie(name)
 deleteCookie(name)
*/



var img;
var canvas;
var ctx;
var refreshrate;

var startX;
var startY;
var endX;
var endY;
 
var iData;

var sx;
var sy;
var width;
var height;
var scaleHeight = 1;
var scaleWidth = 1;

var oInterval;

var interval = 44;
var IMG_UPDATE_INTERVAL = 100;
var counter = 1;
var rand = 1;
var timestempold;

var xhr;

var timeout;
var count;
var oImg;


/* Rubberbandrectangle ***************************************/ 
/*
	used globals: var startX; var startY; var endX; var endY;
				  var iData;
				  var sx; var sy; var width; var height;
				  var scaleHeight; var skaleWidth;
	initRubberband to define the input type=text boxes where the values of the rectangle are displayed
	<your element>.addEventListener("mousedown", doDrawStart, false);
*/

function initRubberband(idX, idY, idWidth, idHeight)
{
	sx = $("#"+idX)[0];
	sy = $("#"+idY)[0];
	width = $("#"+idWidth)[0];
	height = $("#"+idHeight)[0];
}

function doDrawStart(event)
{
	if(iData){
		ctx.putImageData(iData, 0, 0);
	}
	iData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	
	startX = (event.pageX - $(canvas).offset().left);
	startY = (event.pageY - $(canvas).offset().top);

	startX = Math.round(startX);
	startY = Math.round(startY);
	
	endX = Math.round(startX);
	endY = Math.round(startY);

	canvas.addEventListener("mousemove", doDrawUpdate, true);
	canvas.addEventListener("mouseup", doDrawStop, true);
}

 
function doDrawUpdate(event) {
	
	endX = (event.pageX - $(canvas).offset().left);
	endY = (event.pageY - $(canvas).offset().top);
		
	endX = Math.round(endX);
	endY = Math.round(endY);
	
	ctx.putImageData(iData, 0, 0);
	ctx.strokeStyle = "#05f";
	ctx.strokeRect(startX + 1, startY + 1,
	endX - startX - 1, endY - startY - 1 );
	
	if(startX < endX){
		sx.value = Math.round(startX * scaleWidth);
		width.value = Math.round((endX - startX) * scaleWidth);
	}
	else{
		sx.value = Math.round(endX * scaleWidth);
		width.value = Math.round((startX - endX) * scaleWidth);
	}
	if(startY < endY){
		sy.value = Math.round(startY * scaleWidth);;
		height.value = Math.round((endY - startY) * scaleWidth);
	}
	else{
		sy.value = Math.round(endY * scaleWidth);
		height.value = Math.round((startY - endY) * scaleWidth);
	}
	
}
 
function doDrawStop(event) {
	if (startX < 1) startX = 1;
	if (startY < 1) startY = 1;
	if (startX > canvas.width) startX = canvas.width - 1;
	if (startY > canvas.height) startY = canvas.height - 1;

	endX = (event.pageX - $(canvas).offset().left);
	endY = (event.pageY - $(canvas).offset().top);
	
	endX = Math.round(endX);
	endY = Math.round(endY);
	
	if (endX < 1) endX = 1;
	if (endY < 1) endY = 1;
	if (endX > canvas.width) endX = canvas.width - 1;
	if (endY > canvas.height) endY = canvas.height - 1;
 
	canvas.removeEventListener("mousemove", doDrawUpdate, true);
	canvas.removeEventListener("mouseup", doDrawStop, true);

	ctx.putImageData(iData, 0, 0);
 
	if (startX == endX || startY == endY) {
		return;
	}
	
	ctx.strokeRect(startX + 1, startY + 1,
					endX - startX - 1, endY - startY - 1);
	
	if(startX < endX){
		sx.value = Math.round(startX * scaleWidth);
		width.value = Math.round((endX - startX) * scaleWidth);
	}
	else{
		sx.value = Math.round(endX * scaleWidth);
		width.value = Math.round((startX - endX) * scaleWidth);
	}
	if(startY < endY){
		sy.value = Math.round(startY * scaleWidth);
		height.value = Math.round((endY - startY) * scaleWidth);
	}
	else{
		sy.value = Math.round(endY * scaleWidth);
		height.value = Math.round((startY - endY) * scaleWidth);
	}
	
	/*SetCmdValues();
	*/
}


/*used to redraw the overlay, needed because there may be an image update during you drawing use of the rubberband
*/
function doRedraw() {
	
	iData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	
	if(iData){
		ctx.putImageData(iData, 0, 0);
	}
	var x = Math.round(parseInt(sx.value) / scaleWidth);
	var y = Math.round(parseInt(sy.value) / scaleWidth);
	var w = Math.round(parseInt(width.value) / scaleWidth);
	var h = Math.round(parseInt(height.value) / scaleWidth);

	ctx.strokeStyle = '#05f';
	ctx.strokeRect(x, y, w, h);
}




function intervalUpdateStart(){
	var undefined;
	if(oInterval === undefined){oInterval = 0;}
	if(oInterval === 0){
		oInterval = setInterval("updateHelper()",IMG_UPDATE_INTERVAL);
		setCookie("live",1,30);
	}
}

function intervalUpdateStop(){
	clearInterval(oInterval);
	oInterval = 0;
	setCookie("live",0,0);
}



function canvasUpdate(imgSrc,w,h){
	var undefined;

	if (timeout === undefined) {timeout = 0;} else {timeout += 1;}
	if (count === undefined) {count = 0;}
	if (oImg === undefined) {oImg = new Image();};
	

	if(oImg.complete){
		//canvas.setAttribute("width",  oImg.width + "px", false);
		//canvas.setAttribute("height", oImg.height + "px", false);
		if (oImg.width >  0){
			ctx.drawImage(oImg,0,0,w,h);
			doRedraw(); //redraw the overlay
		}
		oImg = new Image();
		count += 1;
		oImg.src = imgSrc + "?" + count;
		timeout = 0;
	}
	else if(timeout > 10){
		count += 1;
		oImg.src = imgSrc + "?" + count;
		alert("timeout");
		timeout = 0;
	}
}

function updateImg(imgId,imgSrc){
	var undefined;

	if (timeout === undefined) {timeout = 0;} else {timeout += 1;}
	if (count === undefined) {count = 0;}
	if (oImg === undefined) {oImg = new Image();};
	
	//alert("updateImg");
	if(oImg.complete){
		$(imgId)[0].src = imgSrc + "?" + count;
		oImg = new Image();
		count += 1;
		oImg.src = imgSrc + "?" + count;
		timeout = 0;
	}
	else if(timeout > 10){
		count += 1;
		oImg.src = imgSrc + "?" + count;
		alert("timeout");
		timeout = 0;
	}
}

/* helper funtion for ajax, 
callback function is optional,
if this function is called before a previous returned the older callback funtion will not execute.
*/
function ajaxGet(file,callBackFck){
	var undefined;
	
	xhr = new XMLHttpRequest();
	xhr.overrideMimeType('text/plain; charset=x-user-defined');
	xhr.open("GET", file, true);
	
	if(callBackFck && callBackFck != undefined) xhr.onreadystatechange = callBackFck;
	
	xhr.send(null);
}


function getIniStr(section,key,fileStr)
{
	var substr = fileStr.split("\r\n");
	var flag = 0;
	for (i in substr){
		if(substr[i] == '['+section+']'){
			flag = 1;
			continue;
		}
		else if(substr[i] == "["){
			flag = 0;
		}
		if (flag == 0){
			continue;
		}
		
		keyVal = substr[i].split("=");
		if (keyVal[0] == key){
			return keyVal[1];
		}
	}

}

function setCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function deleteCookie(name) {
    setCookie(name,"",-1);
}

