var invalid_device=false;


function get(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}
function checkVender() {
    var url = new URL(window.location.href);
    console.log('vender= '+get("vender"));
    return get("vender");    
}

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

	var host="https://event.bmw.com.tw/campaign/2020/the2_racing_challenge/m/";

	var md = new MobileDetect(window.navigator.userAgent);
	if(checkVender()){
		console.log("vender!");
		
		window.stop();
		
		window.location.href=host+"vender/index.html?vender=true";
		return true;
	}

	if(!md.mobile()){

		console.log("desktop!");

		invalid_device=true;		
		if(window.location.href!==(host+'index.html')){
				window.stop();
				window.location.href=host+"index.html";
		}
	}else{

		console.log("mobile!");
		
		if(/Line/.test(window.navigator.userAgent)){

			console.log("line!");		
			invalid_device=true;
			window.stop();
			
			location.href=host+"m/index.html"+'?openExternalBrowser=1';

		}else if(isWebview()){			

			console.log("webview!");		
			
			if(window.location.href!==(host+'m/webview.html')){
				window.stop();
				window.location.href=host+"m/webview.html";
			}
			
			invalid_device=true;
			
		}else{

			if(window.location.href!==(host+'m/index.html')){
					window.stop();
					window.location.href=host+"m/index.html";
			}
		}
	}
	return invalid_device;
}