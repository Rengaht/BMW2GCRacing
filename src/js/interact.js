var _cur_page='HOME';
var _driver_name;
var _driver_color='blue';

function gotoPage(page_){
	
	if(_cur_page===page_) return;

	switch(page_){
		case '_home':
			showItem($('#_button_rank'));
			$('#_input_driver').val("");
			_driver_name="";
			break;
		case '_driver':
			hideItem($('#_button_rank'));			
			$('#_input_driver').focus();
			break;
		case '_color':
			setDriverColor('blue');
			hideItem($('#_button_rank'));
			break;
		case '_game':
			hideItem($('#_button_rank'));
			hideItem($('#_score'));			
			if(_cur_page==='_color') setupGame();			
			break;
		case '_rank':
		case '_lottery':
			hideItem($('#_button_rank'));
			break;
	}

	hideItem($('#'+_cur_page));
	showItem($('#'+page_));

	_cur_page=page_;

}


function hideItem(item_){
	
	if(item_.hasClass('hidden')) return;	
	
	item_.find('Button').addClass('Disable');

	item_.addClass('hidden');
	item_.children().addClass('hidden');
	
	setTimeout(function(){
		item_.addClass('close');
		item_.children().addClass('close');
	
	},600);
}
function showItem(item_){
	
	if(!item_.hasClass('hidden')) return;
	
	item_.removeClass('close');
	item_.children().not("#_score").removeClass('close');
	
	setTimeout(function(){		
		item_.removeClass('hidden');		
		item_.children().not("#_score").removeClass('hidden');
	},10);
}

function onDriverNameClick(){

	let val=$('#_input_driver').val();
	if(val.length<1) return;

	setDriverName(val);
	gotoPage('_color');
}

function setDriverName(set_){
	_driver_name=set_;
	$('#_driver_name_in_game').text(_driver_name);
	$('#_driver_name_complete').text(_driver_name);
}
function setDriverColor(set_){

	if(set_===_driver_color) return;

	hideItem($('#_button_'+_driver_color+'_selected'));
	hideItem($('#_img_car_color_'+_driver_color));
	
	showItem($('#_button_'+set_+'_selected'));
	showItem($('#_img_car_color_'+set_));
	
	_driver_color=set_;

}
function setDriverScore(set_){

	// TODO: upload score & get rank

	$('#_score_complete').text(set_);	

}
function sendInfo(){



}