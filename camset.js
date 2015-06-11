/* this file uses jquery.js framework */
/* this file uses evt.js */
/* this file uses dragdeal.js framework */

var gainSlider;
var shutterSlider;
var STEP_SIZE_GAIN = 1;
var STEP_SIZE_SHUTTER = 1;
var cam = 1;

/*make sure we are in the right mode*/
//ajaxGet("info.htm?cmd=%23021%3Bchoice%3B1%3BConstantValue%3B2%23");

/* init() needs to access some dom elements, so the complete page needs to be loaded before */
$(document).ready(function(){
	init();
    
});

/* bind events to button elements initialize the sliders... */
function init(){
	
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
		//ajaxGet("info.htm?cmd=%23021%3BEVO BarCode%3B1%3BPosX%3B316.94%23");
		ajaxGet("info.htm?cmd=%23002%23");
		intervalUpdateStart();
		}
	);


	$("#btnStop").click(function(){
		ajaxGet("info.htm?cmd=%23004%23");
		intervalUpdateStop();
		}
	);
	
	
	document.getElementById("circleDetail").style.display="none";
	document.getElementById("rectDetail").style.display="none";
	document.getElementById("tolDetail").style.display="none";
	
	
	
	
	
	/*
	$("input[name='toolChoice']").change(function(){
		if($("input[name='toolChoice']:radio:checked").val()=="evoWidth"){
			$("#evoWidthSettings").show(100);
			$("#evoCircleSettings").hide(100);
			//$("#evoWidthSettings").css("display", "block");
			hideSelectedAreaCircle();
			showSelectedAreaBox();
		}
		else if($("input[name='toolChoice']:radio:checked").val()=="evoCircle"){
			$("#evoWidthSettings").hide(100);
			$("#evoCircleSettings").show(100);
			hideSelectedAreaBox();
			showSelectedAreaCircle();
			
			
		}else{
			$("#evoWidthSettings").hide(100);
			$("#evoCircleSettings").hide(100);
			hideSelectedAreaBox();
			hideSelectedAreaCircle();
		}
	});	
	*/
    $("#tabs_container").tabs();

    //$("#searchWindow").click(function(){
        

    //});
   
 

     $('#completeWindow').click(function(){
        $('#selectionArea').css("display","none");
     });
	 
	 


	

	
	

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
	/* event to actually send the slider value to the server */
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
	/* event to actually send the slider value to the server */
	$("#divSlideBarShutter").mouseup(function(){
		ajaxGet('info.htm?cmd=%23021%3Bshutter' + cam + '%3B1%3BConstantValue%3B'+ $("#divSlideBarShutter")[0].innerHTML +'%23');
		}
	);
	
	/* load ini file and call iniResponse function */
	ajaxGet("cfg.ini",iniResponse);
	
	img = $("#imgSnapshot")[0].src = "/snapshot";

	/* by cookies update state is passed between pages */ 
	if(getCookie("live") == 1){
		intervalUpdateStart();
	}
	
	

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

/* called to update the live image into the canvas */
function updateHelper(){
	updateImg("#imgSnapshot","/snapshot");
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
		 
				/* var offset = $(this).position();
				var xPos = offset.left;
				var yPos = parseInt(offset.top)-27;
				var w = $(this).width();
				var h = $(this).height();
				var centriodx = w;
				var centriody = h;
				$("#xvalue").val(centriodx);
				$("#yvalue").val(centriody);
				$("#startvalue").val(w);
				$("#anglevalue").val(h); */
				
				$("#selectionArea").css({'width':cw+'px'});
			}
		);
}

 function showCodeType(){
            if(document.getElementById("acode").checked){
                document.getElementById("anybarcode").style.display="none";
            }
            if(document.getElementById("mcode").checked){
                document.getElementById("anybarcode").style.display="block";
            }

}

/* edited */
function showWindowConfig(){
            if(document.getElementById("wholeWindow").checked){
                document.getElementById("windowBoundary").style.display="none";
            }
            if(document.getElementById("defineWindow").checked){
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
	var filename = "tools_images/";
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
			location.href = 'measurement.html';
		break;
		case "ptlImgBtn":
			location.href = 'pointtoline.html';
		break;
		case "ptcImgBtn":
			location.href = 'p_to_c.htm';
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