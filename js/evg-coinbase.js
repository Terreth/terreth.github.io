function loadCoinbaseButtonWhileBroken(evgAmount, regionalCurrPurchaseAmount) {

	var datacode = "1b94b83dfeffabf81c59c369e06aeac7";

	$("#bitcoin").show();
	
	//Static coding
	//a class="coinbase-button" data-code="1b94b83dfeffabf81c59c369e06aeac7" data-button-style="none" data-custom="facebook:123453" href="https://coinbase.com/checkouts/1b94b83dfeffabf81c59c369e06aeac7">Pay With Bitcoin</a><script src="https://coinbase.com/assets/button.js" type="text/javascript"></script>						</div> -->
	// $("#coinbase-button").html("<a class=\"coinbase-button\" data-code=\"" + data["button"]["code"] +"\"  data-button-style=\"none\"></a>");

	$("#coinbase-button").html("<a class=\"coinbase-button\" data-code=\"" + datacode +"\"  data-button-style=\"none\"></a>");
	
	$("#coinbase-button").show();
	
	var url = "https://coinbase.com/assets/button.js";
	var script = document.createElement( 'script' );
	script.type = 'text/javascript';
	script.src = url;
	$("#coinbase-button").append( script );
	
	//TODO: potentially need a delay
	
	//"$(document).trigger('coinbase_show_modal', \"" + datacode + "\");"
	
}


function loadCoinbaseButton(evgAmount, regionalCurrPurchaseAmount) {
	
	//"meta" : generateMeta(),

	updateLog(JSON.stringify(params));
	
	var params = { 
							"name": evgAmount + " greenz",
						    "type": "buy_now",		    
							"callback_url" :  urlBase() + "coinbase_purchase/item/42",
							// "callback_url" :  urlBase() + "coinbase_cash_in",
			 				"description" : evgAmount + " greenz via Bitcoin",
						    "price_string": regionalCurrPurchaseAmount,
						    "price_currency_iso": secondaryCurrencyCode,
						    "description": "Greenz",
							"custom": activeUserId,
						    "type": "buy_now",
						    "style": "none",
						    "include_email": false
					
					};

	 jQuery.ajax({
	     type: "POST",
	     url:  urlBase() + "coinbase_button",  // was https://coinbase.com/api/v1/buttons
	     data: JSON.stringify(params),
	     contentType: "application/json; charset=utf-8",
	     dataType: "json",
	     success: function (data, status, jqXHR) {
		
		     updateLog(params);
		
			// {"success":true,
			//   "button":
			//       {"text":"Pay With Bitcoin",
			//       "cancel_url":null,"variable_price":false,"
			//        include_address":false,
			//         "info_url":null,
			//         "include_email":true,
			//        "name":"test","style":"custom_large","success_url":null,
			//       "auto_redirect":false,"code":"3790fcff2602c958e3daf40bec9a5716",
			//      "type":"buy_now","choose_price":false,"price":{"cents":123,"currency_iso":"USD"},
			//      "callback_url":"http://www.example.com/my_custom_button_callback",
			//      "custom":"Order123","description":"Sample description"}}
		

			updateLog(data);
			
			var datacode = data["button"]["code"];
			$("#coinbase-button").html("<a class=\"coinbase-button\" data-code=\"" + datacode +"\"  data-button-style=\"none\"></a>");
			$("#coinbase-button").show();
			
			var url = "https://coinbase.com/assets/button.js";
			var script = document.createElement( 'script' );
			script.type = 'text/javascript';
			script.src = url;
			$("#coinbase-button").append( script );
			
			coinbaseButtonShown = false;
			
			//TODO: this is a bad way of doing this. improve
			setTimeout(function(){$(document).trigger('coinbase_show_modal', datacode);}, 3000);
			
			
			//<script src="https://coinbase.com/assets/button.js" type="text/javascript"></script>
			// $("#coinbase-button-href").attr("data-code",data["button"]["code"]);
			
			

	     },
	     error: function (jqXHR, status) {            
			updateLog("fails");

			updateStatus('Error loading button');
			updateLog(jqXHR);
			updateLog(status);

	     }

	 });
	
	
	
	
	
	
}

function revealButton() {
	
}

function coinbaseConfirmationPoller() {
	
	if(!paymentConfirmed) {
	
	var params = { "meta" : generateMeta() } ;

		 jQuery.ajax({
		     type: "POST",
		     url: urlBase() + "account_info",
		     data: JSON.stringify(params),
		     contentType: "application/json; charset=utf-8",
		     dataType: "json",
		     timeout: 4000,
		     complete: coinbaseConfirmationPoller,
		     success: function (data, status, jqXHR) {

				updateLog(jqXHR);
								  
				if(data["meta"]["account_balance"] > lastKnownAccountBalance) {
					
					paymentConfirmed = true;
					lastKnownAccountBalance = data["meta"]["account_balance"];
					//$('#wallet-evergreen-balance').html(lastKnownWalletBalance);
			        $('#account-evergreen-balance').html(lastKnownAccountBalance);
					statusflash($('#account-evergreen-balance'));
					
				}

		     },
		     error: function (jqXHR, status) {            

				updateStatus('Error in coinbaseConfirmationPoller');
				updateLog(jqXHR);
		     }

		 });
	}	
	
}
