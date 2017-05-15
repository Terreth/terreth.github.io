
function statusflash(element)  {

	return element.fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
	
}


function updateStatus(message, priority) {
	
	console.log("updating status");
	
	console.log(message);
    
	if(!priority)
		priority = EvgStatusEnum.NORMAL;

	console.log(priority);
		
	switch(priority) {
	    case EvgStatusEnum.NORMAL: {
		
	        $('#status').html(message);
	
	        break;
	    }
	    case EvgStatusEnum.DEBUG: {
		 	
	        $('#secondaryStatus').html(message);
	
	
	        break;
	    }
	    case EvgStatusEnum.MEDIUMHIGH: {
		
		 	$('#status').html(message);
			statusflash($('#status'));
	        break;
	    }
	    case EvgStatusEnum.HIGH: {
		
		 	$('#status').html(message);
		 	$('#status').css("color", "red");
			statusflash($('#status'));
	        break;
	    }
	    default: {
		console.log('oo');
        
	    }
	}
	
	
}