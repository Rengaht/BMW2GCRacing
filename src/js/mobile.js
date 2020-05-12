var invalid_device=false;

function isFacebookApp() {
    var ua = navigator.userAgent || navigator.vendor || window.opera;	    
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
}
function isWebview() {
    var useragent = navigator.userAgent;
    var rules = ['WebView','(iPhone|iPod|iPad)(?!.*Safari\/)','Android.*(wv|\.0\.0\.0)'];
    var regex = new RegExp(`(${rules.join('|')})`, 'ig');
    return Boolean(useragent.match(regex));
}

function checkDevice(){

	// $('#_hint_webview').removeClass('hidden');			
	// $('#_hint_webview').removeClass('close');


	var md = new MobileDetect(window.navigator.userAgent);
	
	if(!md.mobile()){
		invalid_device=true;
		window.stop();

		window.location.href="desktop.html";
	}

	if(/Line/.test(window.navigator.userAgent)){
		invalid_device=true;
		window.stop();
		
		location.href=location.href+'?openExternalBrowser=1';
	}else if(isWebview()){			

		
		$('#_hint_webview').removeClass('hidden');			
		$('#_hint_webview').removeClass('close');
		
		invalid_device=true;
		// window.stop();
	}


	


	return invalid_device;
}