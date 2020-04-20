var _cur_page='_home';
var _pre_page='_home';
var _driver_name;
var _driver_color='blue';
var _uuid;

var _trial_selected=true;
const ClickBorder=0.5;


function gotoPage(page_,sound_){
	
	if(_cur_page===page_) return;

	switch(_cur_page){
		case '_home':
			if(page_!=='_rank') movePage($('#'+_cur_page),'pageToTop');
			break;
		case '_lottery':
		case '_rank':
			movePage($('#'+_cur_page),'pageToRight');
			break;
		case '_driver':
			if(page_!=='_home') movePage($('#'+_cur_page),'pageToTop');
			break;
		case '_color':
			if(page_==='_game') movePage($('#'+_cur_page),'pageToTop');
			else movePage($('#'+_cur_page),'pageToBottom');
			break;
		case 'game':
			if(page_==='home'){
				hideItem($('#_score'));
				movePage($('#_score_board'),'pageToTop');	
			} 
	  		break;
	}

	switch(page_){
		case '_home':
			if(_cur_page!=='_rank')
				movePage($('#'+page_),'pageFromTop');

			showItem($('#_button_rank'));
			hideItem($('#_button_back'));
			
			resetDriverColor();
			setTimeout(function(){
				$('#_input_driver').val("");			
				_driver_name="";
			},700);
			break;
		case '_driver':
			if(_cur_page==='_home')
				movePage($('#'+page_),'pageFromBase');
			else
				movePage($('#'+page_),'pageFromTop');
			
			hideItem($('#_button_rank'));			
			showItem($('#_button_back'));
			
			$('#_input_driver').focus();
			break;
		case '_color':
			movePage($('#'+page_),'pageFromBottom');
			showItem($('#_button_back'));
			hideItem($('#_button_rank'));
			
			setTimeout(function(){
				setDriverColor('blue');
			},700);
			break;
		case '_game':				
			movePage($('#'+page_),'pageFromBase');
			hideItem($('#_button_back'));
			
			if(_cur_page==='_color'){
				hideItem($('#_button_rank'));
				hideItem($('#_score'));	
				movePage($('#_score_board'),'pageToTop');
	  			showItem($('#_hint'));
	
				setupGame();			
			}else{
				showItem($('#_button_rank'));
				showItem($('#_score'));
				movePage($('#_score_board'),'pageFromBase');
	  
			}
			break;
		case '_rank':
			movePage($('#'+page_),'pageFromRight');
			hideItem($('#_button_rank'));
			showItem($('#_button_back'));
			break;
		case '_lottery':
			onClickGotoTrial(true);
			movePage($('#'+page_),'pageFromRight');
			hideItem($('#_button_rank'));
			showItem($('#_button_back'));
			break;
	}

	switch(sound_){
		case 'bb':
			_sound_fx['button_large'].play();
			break;
		case 'sb':
			_sound_fx['button_small'].play();
			break;
	}

	// hideItem($('#'+_cur_page));
	// showItem($('#'+page_));


	_pre_page=_cur_page;
	_cur_page=page_;

}


function hideItem(item_){
	
	if(item_.hasClass('hidden') && item_.hasClass('close')) return;	
	
	item_.find('.Button').addClass('Disable');
	
	item_.addClass('hidden');
	item_.children().addClass('hidden');
	
	setTimeout(function(){
		item_.addClass('close');
		item_.children().addClass('close');
	},600);
}
function showItem(item_){
	
	if(!item_.hasClass('hidden') && !item_.hasClass('close')) return;
	
	item_.removeClass('close');
	item_.children().removeClass('close');
	
	setTimeout(function(){		
		item_.removeClass('hidden');		
		item_.children().removeClass('hidden');
	},10);
}

function movePage(page_,direction){
	
	animEndEventName='animationend';
	// if(!page_.hasClass(direction)) page_.removeClass(direction);

	// if(direction.indexOf('From')>-1){
	if(page_.hasClass('close')) page_.removeClass('close');
	page_.find('.Button').addClass('Disable');
	

	page_.addClass(direction);
	setTimeout(function(){
		page_.off(animEndEventName);

		if(direction.indexOf('From')==-1){
			if(!page_.hasClass('close')) page_.addClass('close');
		}
		
		page_.removeClass(direction);// endCurrPage = true;
		page_.find('.Button').removeClass('Disable');

	},700);
}


function onDriverNameClick(){

	if($('#_button_ok').hasClass('Disable')) return;

	let val=$('#_input_driver').val();
	if(val.length<1){
		_sound_fx['button_disable'].play();
		return;
	}

	setDriverName(val);
	gotoPage('_color','bb');
}

function setDriverName(set_){
	_driver_name=set_;
	$('#_driver_name_in_game').text(_driver_name);
	$('#_driver_name_complete').text(_driver_name);
}
function setDriverColor(set_){

	if($('#_button_'+set_).hasClass('Disable')) return;

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
	if($('#_button_go').hasClass('Disable')) return;
	gotoPage('_game','bb');
}

function setDriverScore(set_){

	// TODO: upload score & get rank

	$('#_score_complete').text(set_);	

}
function sendScore(){

	$.ajax({
		url:'https://script.google.com/macros/s/AKfycbzQvLdIIL5UHhEOH8Yu3yMoYpFG30WfeKI8V8whH2p2_7oCD1H1/exec',
		data:{
			"player":_driver_name,
			"color":_driver_color,
			"score":_score,			
		},
		success:function(response){
			_uuid=response;
			console.log('get uuid= ',response);
		}
	});

}
function sendInfo(){

	if($('#_button_send').hasClass('Disable')) return;

	
	// $.ajax({
	// 	url:'https://script.google.com/a/mmlab.tw/macros/s/AKfycbzTi1GAFLpblMLuUP7rfK-KO3F7L6I2SbDDXb95YA/exec',
	// 	data:{
	// 		"uuid":_uuid,
	// 		"name":$('#_input_lottery_name').val(),
	// 		"gender":$('#_input_lottery_gender').val(),
	// 		"age":$('#_input_lottery_age').val(),
	// 		"phone":$('#_input_lottery_phone').val(),
	// 		"email":$('#_input_lottery_email').val(),
	// 		"trial":_trial_selected,
	// 		"store":$('#_input_lottery_store').val()
	// 	},
	// 	success:function(response){
	// 		console.log(response);
	// 	}
	// });

	gotoPage('_game','bb');

}

function onButtonBackClick(){

	if($('#_button_back').hasClass('Disable')) return;

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
	}
}

function onGameClick(event){
	
	if(!isPlaying) return;

	var x=event.offsetX/width;
    // var y=event.offsetY/height;
    // console.log(x/width+","+y/height);

    if(x<ClickBorder) keyLeft=true;
  	else if(x>1.0-ClickBorder) keyRight=true;
}
function onGameMouseUp(event){
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



