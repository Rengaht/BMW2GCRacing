var cur_page='HOME';

function gotoPage(page_){
	
	if(cur_page===page_) return;

	switch(page_){
		case '_home':
			showItem($('#_button_rank'));
			break;
		case '_driver':
			hideItem($('#_button_rank'));
			$('#_input_driver').focus();
			break;
		case '_color':
			hideItem($('#_button_rank'));
			break;
		case '_game':
			hideItem($('#_button_rank'));
			hideItem($('#_score'));			
			setupGame();
			break;
		case '_rank':
		case '_lottery':
			hideItem($('#_button_rank'));
			break;
	}

	hideItem($('#'+cur_page));
	showItem($('#'+page_));

	cur_page=page_;

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

function setCarColor(set_){

}

function sendInfo(){



}