(function(window) {
				
	function init2() {
				
		$("#barcode").click(function(){
			ajaxGet('info.htm?cmd=%23021%3BEVO%20BarCode%3B2%3BGeneral.Enabled%3B1%23');
		});
		
		$("#_2dbarcode").click(function(){
			ajaxGet('info.htm?cmd=%23021%3BEVO%20DataCode%3B2%3BGeneral.Enabled%3B1%23');
		});
		
		$("#ocrcode").click(function(){
			ajaxGet('info.htm?cmd=%23021%3BEVO%20OCR%3B2%3BGeneral.Enabled%3B1%23');
		});
				
	}	// end init2

	window.init2 = init2;
})(window);