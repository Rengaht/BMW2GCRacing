var cur_page='HOME';

function gotoPage(page_){
	
	if(cur_page===page_) return;

	switch(page_){
		case '_home':
			break;
		case '_driver':
			$('#_input_driver').focus();
			break;
		case '_color':
			break;
		case '_game':
			setupGame();
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
	item_.children().not("#_button_record").removeClass('close');
	
	setTimeout(function(){		
		item_.removeClass('hidden');		
		item_.children().not("#_button_record").removeClass('hidden');
	},10);
}