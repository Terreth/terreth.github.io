	
function initializeCurrencyDefaults() {
	
	if(!secondaryCurrencyCode)
	   secondaryCurrencyCode = "USD";
	if(!secondaryCurrencyRate)
	   secondaryCurrencyRate = 0.0022;
	if(!secondaryCurrencySymbol)
	   secondaryCurrencySymbol = "$";
	if(!lastKnownAccountBalance)
	   lastKnownAccountBalance = 0;
	if(!lastKnownWalletBalance)
	   lastKnownWalletBalance = 0;


}


function currencyModuleInit() {
	
	updateLog("currencyModuleInit");
	
	EvergreenStorageGet(["secondaryCurrencySymbol", "secondaryCurrencyRate", "secondaryCurrencyCode"], function(items) {

		secondaryCurrencySymbol = items["secondaryCurrencySymbol"];
		secondaryCurrencyRate = items["secondaryCurrencyRate"];
		secondaryCurrencyCode = items["secondaryCurrencyCode"];
	});
		
	initializeCurrencyDefaults();
	
	
}

// ;; Exchange Rates
// 
//   "/exchange_rates"
//   { "meta" request-meta}


function getExchangeRates() {

var params = { "meta" : generateMeta() } ;

 jQuery.ajax({
     type: "POST",
     url: urlBase() + "exchange_rates",
     data: JSON.stringify(params),
     contentType: "application/json; charset=utf-8",
     dataType: "json",
     success: function (data, status, jqXHR) {

			  updateLog(data);
			  exchangeRates = data["exchange_rates"];
						
			  $("#currency-list").html('');

			  for(var i = 0; i < exchangeRates.length; i++)
			  {
				if(exchangeRates[i]["code"] == secondaryCurrencyCode)
					$("#currency-list").append("<li id=\"" +  exchangeRates[i]["code"] + "\" class=\"active currency\"><a href=\"#\">Check</a>  "  + exchangeRates[i]["name"] + " | " + exchangeRates[i]["rate"]  + " </li>");			
				else	
					$("#currency-list").append("<li id=\"" +  exchangeRates[i]["code"] + "\" class=\"currency\"><a href=\"#\">Check</a>  "  + exchangeRates[i]["name"] + " | " + exchangeRates[i]["rate"]  + " </li>");			
				
				$( "#" + exchangeRates[i]["code"] ).bind( "click", function() {
					
					changeCurrency( $(this).attr("id") );

				});
			  
			
			}

			
				
			  updateRatesEmpty();
		
     },
     error: function (jqXHR, status) {            

		updateStatus('Error in exchange rate retrieval');
		updateLog(jqXHR);
     }

 });

}

function changeCurrency(code) {

	  for(var i = 0; i < exchangeRates.length; i++)
	  {
	  			if(exchangeRates[i]["code"] == code) {

					 $('.curr-list li').removeClass("active");
					 $('#' + code).toggleClass("active");
	
	  				 secondaryCurrencySymbol = exchangeRates[i]["symbol"];
	  				 secondaryCurrencyRate = exchangeRates[i]["rate"]
	  				 secondaryCurrencyCode = code;
				  	 EvergreenStorageSet({"secondaryCurrencySymbol" : secondaryCurrencySymbol, "secondaryCurrencyRate" : secondaryCurrencyRate, "secondaryCurrencyCode" : secondaryCurrencyCode});
					
	  				 $('#selected-currency-name').html(exchangeRates[i]["name"]);
	  				 $('#selected-currency-rate').html(exchangeRates[i]["rate"]);
					
	  				 updateRatesEmpty();
	  			}
	  }
	 
	updateStatus('Currency successfully changed');
	$('#currency-selector-box').hide();
	
}

function convertToSecondaryCurrency(evgAmount) {

	 var regCurrAmount = parseFloat(evgAmount) * parseFloat(secondaryCurrencyRate);
	
	 var regCurrAmountAsString;
	
	 if(regCurrAmount > .01)
	 	regCurrAmountAsString = regCurrAmount.toFixed(2);
	else 
		regCurrAmountAsString = regCurrAmount.toFixed(3);
	
	 return secondaryCurrencySymbol + regCurrAmountAsString;

}

function updateRates(evgWalletBalance, evgAccountBalance) {


	initializeCurrencyDefaults();
	
	if(evgWalletBalance && evgAccountBalance) {
	
	  var regCurrWalletBalance = parseFloat(evgWalletBalance) * parseFloat(secondaryCurrencyRate);
	  $('#wallet-regional-currency-symbol').html(secondaryCurrencySymbol);
	  $('#wallet-regional-currency-balance').html(regCurrWalletBalance.toFixed(2));
	  $('#wallet-regional-currency-code').html(secondaryCurrencyCode);

	  	updateLog(" secondaryCurrencyRate:" + secondaryCurrencyRate);

	  var regCurrAccountBalance = parseFloat(evgAccountBalance) * parseFloat(secondaryCurrencyRate);
	  $('#account-regional-currency-symbol').html(secondaryCurrencySymbol);
	  $('#account-regional-currency-balance').html(regCurrAccountBalance.toFixed(2));
	  $('#account-regional-currency-code').html(secondaryCurrencyCode);
	
	  $('#regionalCurrencyPurchaseAmount').html(secondaryCurrencySymbol + "0.00");

		if (evgDevMode)
		{
			updateLog("updating evg wallet");
			updateLog(evgWalletBalance);
	
			updateLog("updating balance");
			updateLog(regCurrWalletBalance.toFixed(2));
		}
	
	}
	
}

function updateRatesEmpty() {

	updateRates($('#wallet-evergreen-balance').html(), $('#account-evergreen-balance').html());
}



