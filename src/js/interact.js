var _cur_page='_home';
var _pre_page='_home';
var _next_page;
var _driver_name;
var _driver_color='blue';
var _uuid;
var _agree=false;

var _trial_selected=true;
const ClickBorder=0.5;
var _isVender;
var _inTransition=false;

var RankCount=50;

function closePage(page_,next_page){
	console.log('close '+page_);
	
	// $('#'+page_).find('.Button').addClass('Disable');
	switch(page_){
		case '_home':
			hideItem($('#_button_rank'));			
			
			if(next_page==='_driver') $('#'+page_).removeClass('pageToBase');
			
			break;
		case '_lottery':
			if(next_page==='_game'){
				hideItem($('#_button_back'));
				$('#'+page_).removeClass('pageToBase');	
			}
			break;
		case '_rank':
			hideItem($('#_button_back'));
			$('#'+page_).removeClass('pageToBase');	
			break;
		case '_driver':
			
			if(next_page==='_color'){

				$('#'+page_).removeClass('pageToBase');
				$('#'+page_).addClass('pageToTop');
			}
			if(next_page==='_home'){
				hideItem($('#_button_back'));
				$('#'+page_).removeClass('pageToTop');				
			}
			break;
		case '_color':
			
			if(next_page==='_game'){
				$('#'+page_).removeClass('pageToBase');
				$('#'+page_).removeClass('pageToBottom');
				$('#'+page_).addClass('pageToTop');
				hideItem($('#_button_back'));
			} 
			if(next_page==='_driver'){
				$('#'+page_).removeClass('pageToBase');				
			} 
			
			break;
		case '_game':
			hideItem($('#_button_rank'));
			if(next_page==='home'){
				hideItem($('#_score'));
			} 
	  		break;
	  	case '_campaign':
	  		$('#'+page_).removeClass('pageToBase');		
	  		break;
	}
}
function setupPage(page_){

	console.log('setup '+page_);

	if(page_!=='game'){		
		if(!_sound_bgm.playing()){
			_sound_bgm.play();
			_sound_bgm.fade(0.0,1.0,2000);
		}
	}

	// $('#'+page_).removeClass('close');
	// $('#'+page_).addClass('pageToBase');

	switch(page_){
		case '_home':
			
			$('#_button_start').removeClass('Click');			
			$('#'+page_).addClass('pageToBase');

			ga('send','back');
			break;
		case '_driver':
			$('#_button_ok').removeClass('Click');
			$('#_button_back').removeClass('Click');
			$('#_input_driver').blur();
			
			if(_cur_page==='_home'){
				$('#_input_driver').val("");			
				_driver_name="";
			}
			if(_cur_page==='_color'){
				$('#'+page_).removeClass('pageToTop');
			}
			break;
		case '_color':
			//resetDriverColor();
			$('#_button_go').removeClass('Click');
			$('#_button_back').removeClass('Click');
			
			// movePage($('#'+page_),'pageFromBottom');
			$('#'+page_).addClass('pageToBase');
			break;
		case '_game':				
			
			if(_cur_page==='_color'){
				hideItem($('#_button_rank'));
				hideItem($('#_score'));	
				movePage($('#_score_board'),'pageToTop');
	  			
				showItem($('#_rule'));	
				movePage($('#_rule_board'),'pageToTop');
				// setTimeout(function(){			
	  	// 			movePage($('#_rule_board'),'pageFromTop');
	  	// 		},700);
				$('#_button_lottery').removeClass('Disable');
				setupGame();			
			}else{
				showItem($('#_button_rank'));
				showItem($('#_score'));
			}

			movePage($('#'+page_),'pageFromBase');
			
			break;
		case '_rank':			
			hideItem($('#_button_rank'));
			$('#_button_back').removeClass('Click');			
			$('#'+page_).addClass('pageToBase');
			// $('#'+page_).removeClass('pageToRight');	
			// $('#'+page_).removeClass('pageToRight');
			break;
		case '_lottery':
			
			if(_cur_page==='_game') clearInfo();

			onClickGotoTrial(true);
			$('#_button_send').removeClass('Click');    
			$('#_button_back').removeClass('Click');
			hideItem($('#_button_rank'));
			
			$('#'+page_).addClass('pageToBase');
			
			ga('send','Participate');

			break;
		case '_campaign':
			$('#'+page_).addClass('pageToBase');		
			break;
	}

	
}

function gotoPage(page_,sound_){
	
	if(_cur_page===page_) return;
	if(_inTransition) return;

	_inTransition=true;

	try{
		switch(sound_){
			case 'bb':
				_sound_fx['button_large'].play();
				break;
			case 'sb':
				_sound_fx['button_small'].play();
				break;
		}
	}catch(e){
		console.log(e);
	}

	closePage(_cur_page,page_);
	setupPage(page_);

	// _pre_page=_cur_page;
	_next_page=page_;


	setTimeout(function(){
		onPageTransitionEnd();
	},500);


	// hideItem($('#'+_cur_page));
	// showItem($('#'+page_));
}
function onPageTransitionEnd(){

	_inTransition=false;

	_pre_page=_cur_page;
	_cur_page=_next_page;
	console.log('page transition end! cur='+_cur_page+' pre= '+_pre_page);

	// $('#'+_pre_page).addClass('close');
	$('#_button_back').removeClass('Click');
				
	switch(_cur_page){
			case '_home':			
				showItem($('#_button_rank'));

				// reset pages;
				$('#_driver').removeClass('pageToTop');
				$('#_driver').addClass('pageToBase');
				$('#_color').removeClass('pageToTop');
				$('#_color').addClass('pageToBottom');

				resetDriverColor();						
				break;
			case '_driver':
				showItem($('#_button_back'));
				break;
			case '_color':	
				break;		
			case '_game':
				if(_pre_page==='_color'){
					setupGame();			
					showItem($('#_rule'));	
					movePage($('#_rule_board'),'pageFromTop');
				}else{
					movePage($('#_score_board'),'pageFromBase');
				}
				break;
			case '_lottery':
				showItem($('#_button_back'));
				break;
			case '_rank':
				// $('#'+_cur_page).removeClass('pageToRight');
				showItem($('#_button_back'));	
				updateRank();
				break;
			case '_campaign':
				showItem($('#_button_back'));		
				break;
	}
	// $('#'+_cur_page).find('.Button').removeClass('Disable');

}


function hideItem(item_){
	
	if(item_.hasClass('hidden') && item_.hasClass('close')) return;	
	
	// item_.find('.Button').addClass('Disable');
	
	item_.addClass('hidden');
	//item_.children().addClass('hidden');
	
	setTimeout(function(){
		item_.addClass('close');
		//item_.children().addClass('close');
	},600);
}
function showItem(item_){
	
	if(!item_.hasClass('hidden') && !item_.hasClass('close')) return;
	
	item_.removeClass('close');
	//item_.children().removeClass('close');
	
	setTimeout(function(){		
		item_.removeClass('hidden');		
		//item_.children().removeClass('hidden');
	},10);
}
function movePage(page_,direction,callback){
	
	console.log('move '+page_+' '+direction);
	
	var dir=direction;
	setTimeout(function(){
		page_.addClass(direction);
	},100);
	
	setTimeout(function(){
		
		page_.removeClass(dir);// endCurrPage = true;
	
	},600);
	

}
function onButtonStartClick(){


	if(_inTransition) return;

	$('#_button_start').addClass('Click');
	gotoPage('_driver','bb');


}
function onDriverNameClick(){

	if(_inTransition) return;

	if(!checkNameInput()){
		_sound_fx['button_disable'].play();
		return;
	}

	$('#_button_ok').addClass('Click');
		
	setDriverName($('#_input_driver').val());
	gotoPage('_color','bb');
}

function setDriverName(set_){
	_driver_name=set_;
	$('#_driver_name_in_game').text(_driver_name);
	$('#_driver_name_complete').text(_driver_name);
}
function setDriverColor(set_){

	if(_inTransition) return;

	if(set_===_driver_color) return;

	_sound_fx['button_small'].play();

	hideItem($('#_button_'+_driver_color+'_selected'));
	hideItem($('#_img_car_color_'+_driver_color));
	
	showItem($('#_button_'+set_+'_selected'));
	showItem($('#_img_car_color_'+set_));

	$('#_car_complete').attr('src','asset/img/ui/frontcar_'+set_+'.png');
	
	_driver_color=set_;

}
function resetDriverColor(){

	var set_='blue';
	$('#_button_'+_driver_color+'_selected').addClass('hidden');
	$('#_button_'+_driver_color+'_selected').addClass('close');

	$('#_img_car_color_'+_driver_color).addClass('hidden');
	$('#_img_car_color_'+_driver_color).addClass('close');
	
	$('#_button_'+set_+'_selected').removeClass('hidden');
	$('#_button_'+set_+'_selected').removeClass('close');
	
	$('#_img_car_color_'+set_).removeClass('hidden');
	$('#_img_car_color_'+set_).removeClass('close');

	$('#_car_complete').attr('src','asset/img/ui/frontcar_'+set_+'.png');
	
	_driver_color=set_;
}
function onButtonGoClick(){
	
	if(_inTransition) return;

	$('#_button_go').addClass('Click');

	gotoPage('_game','bb');
}

function onButtonRuleOkClick(){
	
	if(_inTransition) return;

	_sound_fx['button_large'].play();
	_sound_bgm.fade(1.0,0.0,2000);
	
	// movePage($('#_rule_board'),'moveToTop');
	hideItem($('#_rule'));

	setTimeout(function(){
		showItem($('#_hint'));
	},800);
}

function setDriverScore(set_){

	// TODO: upload score & get rank

	$('#_score_complete').text(set_);	

}
function onButtonLotteryClick(){
	if($('#_button_lottery').hasClass('Disable')) return;
	if(_inTransition) return;

	$('#_button_lottery').addClass('Click');
	gotoPage('_lottery','bb');
}
function onButtonHomeClick(){
	
	if(_inTransition) return;

	$('#_button_home').addClass('Click');

	gotoPage('_home','bb');
}



// function sendScore(callback){

// 	let data={
// 		"player":_driver_name,
// 		"color":_driver_color,
// 		"score":score
// 	};
// 	$.ajax({
// 		url:'https://script.google.com/macros/s/AKfycbzQvLdIIL5UHhEOH8Yu3yMoYpFG30WfeKI8V8whH2p2_7oCD1H1/exec',
// 		data:data,
// 		success:function(response){

// 			var data=JSON.parse(response);
// 			_uuid=data.uid;
// 			_rank=data.rank;

// 			$('#_rank_complete').text(_rank);
			
// 			console.log('update score'+response);
// 			callback();
// 		},
// 		error:function(jqXHR, textStatus, errorThrown){
// 			alert('something wrong^^');
// 			console.log(jqXHR);
// 		}
// 	});

// }

function showScore(){

	
  	$('#_rank_to_show').addClass('hidden');

	showItem($('#_score'));
	showItem($('#_button_rank'));
	
	$('#_button_home').removeClass('Click');
	$('#_button_lottery').removeClass('Click');
	$('#_button_lottery').removeClass('Disable');

	setTimeout(function(){
		movePage($('#_score_board'),'pageFromTop');
   	},100);	
}

function clearInfo(){
	$('#_input_lottery_name').val("");
	$('#_input_lottery_gender').val("男");
	$('#_input_lottery_age').val("20-");
	$('#_input_lottery_phone').val("");
	$('#_input_lottery_email').val("");
	
	$('#_button_goto_trial_yes').addClass('checked');
	$('#_button_goto_trial_no').removeClass('checked');
	$('#_input_lottery_score').val("台北汎德 - 天母");

	_agree=false;
	$('#_button_agree').removeClass('checked');

	$('#_lottery_input_error').text('');
	toggleLotteryError(false);
}
function sendInfo(callback){

	if($('#_button_send').hasClass('Disable')) return;
	if(_inTransition) return;
	
	_inTransition=true;

	// check empty
	if(!checkLotteryInput()){
		_sound_fx['button_disable'].play();
		return;
	}

	toggleLotteryError(true,'傳送中...');
    $('#_button_send').addClass('Click');
    
    _sound_fx['button_large'].play();

	let data={
		// "uuid":_uuid,
		"player":_driver_name,
		"color":_driver_color,
		"score":score,
		"name":$('#_input_lottery_name').val(),
		"gender":$('#_input_lottery_gender').val(),
		"age":$('#_input_lottery_age').val(),
		"phone":$('#_input_lottery_phone').val(),
		"email":$('#_input_lottery_email').val(),
		"trial":_trial_selected,
		"store":$('#_input_lottery_store').val(),
		"vender":_isVender?"TRUE":""
	};
	
	$.ajax({
		// url:'https://script.google.com/macros/s/AKfycbyZQlqqINqx89iets9atIF4YATr52gytQuGHzPFnCUkqyKN0np3/exec',
		url:'https://script.google.com/macros/s/AKfycbxPGSHSW3HBjJ4WPmAXtTgUX2SKa6t0lH7M4zwQTcOYKaXGzzE9/exec',
		data:data,
		success:function(response){			
			console.log('update info: '+response);
			var data=JSON.parse(response);
			_inTransition=false;
				
			if(data.result==='success'){
				toggleLotteryError(true,'成功!');
				ga('send','complete');

				// update rank
				_rank=data.rank;
				$('#_rank_complete').text(_rank);
				$('#_rank_to_show').removeClass('hidden');
				$('#_button_send').addClass('Disable');
				
				setTimeout(function(){
					$('#_button_lottery').addClass('Disable');
					if(callback) callback();			
					gotoPage('_game','bb');			
				},300);

			}else{
				$('#_button_send').removeClass('Click');
				$('#_button_send').removeClass('Disable');
				toggleLotteryError(true,'something wrong^^');				
			}
		},
		error:function(jqXHR, textStatus, errorThrown){
			alert('something wrong^^');
			console.log(jqXHR);
		}
	});

	

}

function onButtonBackClick(){

	if(_inTransition) return;

	$('#_button_back').addClass('Click');
	// gotoPage(_pre_page,'sb');
			
	switch(_cur_page){
		case '_rank':
			gotoPage(_pre_page,'sb');
			break;
		case '_driver':
			gotoPage('_home','sb');
			break;
		case '_color':
			gotoPage('_driver','sb');
			break;
		case '_lottery':
			gotoPage('_game','sb');
			break;
		case '_campaign':
			gotoPage('_lottery','sb');
			break;
	}
}

function onGameClick(event){
	event.preventDefault(); 
	if(!isPlaying) return;

	var x=event.offsetX/width;
    // var y=event.offsetY/height;
    // console.log(x/width+","+y/height);

    if(x<ClickBorder) keyLeft=true;
  	else if(x>1.0-ClickBorder) keyRight=true;
}
function onGameMouseUp(event){
	event.preventDefault(); 
	keyLeft=0;
	keyRight=0;
}

function onClickGotoTrial(set_){
	if(set_){
		$('#_button_goto_trial_yes').addClass('checked');
		$('#_button_goto_trial_no').removeClass('checked');
	}else{
		$('#_button_goto_trial_yes').removeClass('checked');
		$('#_button_goto_trial_no').addClass('checked');
	}
	_trial_selected=set_;
}
function onClickAgree(){
	if($('#_button_agree').hasClass('checked')){
		$('#_button_agree').removeClass('checked');
		_agree=false;
	}else{
		$('#_button_agree').addClass('checked');
		_agree=true;
	}
}

function updateRank(callback){

	var data={count:RankCount};
	$.ajax({
		url:'https://script.google.com/macros/s/AKfycbzQIXck9QaCW1k5VmgW6WFOm5yQ35K2ULryaW8ilJ4K-uadGCI/exec',
		data:data,
		success:function(response){

			$('#_rank_info').empty();

			var data=JSON.parse(response);
			var count=1;
			for(var i in data){
				
				let user=data[i];
				if(user[2]==="") break;

				let row=$('<div></div>');
				$('<sapn></span>').text(count+'.').appendTo(row);
				$('<sapn></span>').text(user[0]).appendTo(row);
				$('<sapn></span>').text(user[2]).appendTo(row);
				
				row.addClass('RankItem');
				
				row.addClass('hidden');
				setTimeout(function(){
					row.removeClass('hidden');
				},i*100);

				row.appendTo($('#_rank_info'));

				count++;
			}
			console.log('update rank!');
			if(callback) callback();
		},
		error:function(jqXHR, textStatus, errorThrown){
			alert('something wrong^^');
			console.log(jqXHR);
		}
	});
}

function checkNameInput(){
	var error_text="";
	if($('#_input_driver').val().length<1) error_text=error_text+"*不可空白";
	
	$('#_input_driver').val($('#_input_driver').val().replace(/ /g,'').toUpperCase());
	
	toggleNameError(error_text.length>0,error_text);
	return error_text.length==0;
}
function toggleNameError(show_,text_){
	if(show_){
		$('#_driver_input_error').text(text_);
		$('#_driver_input_error').removeClass('hidden');
		$('#_button_ok').addClass('Disabled');
	}else{
		$('#_driver_input_error').addClass('hidden');
		$('#_button_ok').removeClass('Disabled');
	}
}

function checkLotteryInput(){
	var error_text="";
	if($('#_input_lottery_name').val().length<1) error_text=error_text+"*姓名不可空白\n";

	var mobileReg = /^09\d{2}-\d{3}-\d{3}$/;
	// var phoneReg = /^\d{7,12}$/;
	var input_phone_=$('#_input_lottery_phone').val();
	if(input_phone_.length<12 || !mobileReg.test(input_phone_)) error_text=error_text+"*手機格式錯誤\n";

	var emailRegx=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	var input_email=$('#_input_lottery_email').val().toLowerCase();
    if(!emailRegx.test(input_email)) error_text=error_text+"*email格式錯誤\n";

    if(!_agree) error_text+="*請同意個人資料使用";

	toggleLotteryError(error_text.length>0,error_text);
	return error_text.length==0;
}
function toggleLotteryError(show_,text_){
	if(show_){
		$('#_lottery_input_error').text(text_);
		$('#_lottery_input_error').removeClass('hidden');
		$('#_button_ok').addClass('Disabled');
	}else{
		$('#_lottery_input_error').addClass('hidden');
		$('#_button_ok').removeClass('Disabled');
	}
}

function getUrlParameter() {
    var url = new URL(window.location.href);
    _isVender = get("vender");
    console.log('vender= '+_isVender);
}

function get(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

getUrlParameter();

function onClickCampaignInfo(){	
	gotoPage('_campaign');
}