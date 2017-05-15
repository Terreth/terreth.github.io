
    var port = chrome.runtime.connect();

	window.addEventListener("message", function(event) {
	  // We only accept messages from ourselves
	  if (event.source != window)
	    return;

	  if (event.data.type && (event.data.type == "FROM_PAGE")) {
	    console.log("Content script received: " + event.data.text);
		// alert('data made its way to content script');

		var payload = {
		    user_id: event.data.text
		};

	    chrome.extension.sendRequest(payload, function(response) {});
		
	    //port.postMessage(event.data.text);
	  }
	}, false);

	console.log('hello im scanning');

	// alert('scanning');
	
	$('a[href*="facebook.com/"]').each(function( index ) {
		
		  console.log( index + ": " + $( this ).text() );
		  var url = $( this ).attr('href');
		  var currIndex = url.indexOf("com/");
		  console.log(currIndex);
		  var textId = url.substring(currIndex + 4,url.length);
		  console.log(textId);
		  // console.log($( this ).after('<img src="http://www.evr.gr/img/logo.png" textid="' + textId + '" width="18px"/>'));
		
	      if (textId.length > 4 && textId.indexOf('?') == -1  && textId.indexOf('/') == -1 )
		  	  $( this ).after('<img src="http://www.evr.gr/img/small_transparent_logo.gif" textid="' + textId + '" width="14px"/>').next().click(
					function() {
						
							// alert($(this).attr("textid"));
							window.postMessage({ type: "FROM_PAGE", text : $(this).attr("textid") },"*");
													
					});

		  	// $( this ).after('<a onclick="chrome.extension.sendRequest(\'' + textId + '\', function(response) {})"<img src="http://www.evr.gr/img/logo.png" width="15px"/></a>');
	
	});
	
	// <meta name="greenz" amount="1" payee="jb@evr.gr">
	// <meta name="greenz" amount="1" time="10s" payee="fb:jimmy.wales">
    
	if($('meta[name=greenz]')) 
	{
		var payload = {
			
		    user_id: $('meta[name=greenz]').attr("payee"),
		    amount: $('meta[name=greenz]').attr("amount")
		
		    // time: $('meta[name=greenz]').attr("time")
			// ideas:
			//   10s : every 10s (drip) 
			//   5s+ : single payment after 5s
			// time: $('meta[name=greenz]').attr("domain")
			//    * : all pages at this domain
			//    

		};

		chrome.extension.sendRequest(payload, function(response) {});
	}

