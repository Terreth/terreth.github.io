var exchangeRates;
var secondaryCurrencySymbol;
var secondaryCurrencyRate;
var secondaryCurrencyCode;

// ;; Exchange Rates
// 
//   "/exchange_rates"
//   { "meta" request-meta}

function currencyModuleInit() {
	
	EvergreenStorageGet(["secondaryCurrencySymbol", "secondaryCurrencyRate", "secondaryCurrencyCode"], function(items) {
		secondaryCurrencySymbol = items["secondaryCurrencySymbol"];
		secondaryCurrencyRate = items["secondaryCurrencyRate"];
		secondaryCurrencyCode = items["secondaryCurrencyCode"];
	});
	
}
function getExchangeRates() {

if(!secondaryCurrencyCode)
   secondaryCurrencyCode = "USD";
if(!secondaryCurrencyRate)
   secondaryCurrencyRate = "0.0022";

var params = { "meta" : generateMeta() } ;

 jQuery.ajax({
     type: "POST",
     url: urlBase() + "exchange_rates",
     data: JSON.stringify(params),
     contentType: "application/json; charset=utf-8",
     dataType: "json",
     success: function (data, status, jqXHR) {

			  console.log(data);
			  exchangeRates = data["exchange_rates"];
						
			  $("#currency-list").html('');

			  for(var i = 0; i < exchangeRates.length; i++)
			  {
				
				$("#currency-list").append("<li id=\"" +  exchangeRates[i]["code"] + "\" class=\"currency\">"  + exchangeRates[i]["name"] + " | " + exchangeRates[i]["rate"]  + " <a>select</a></li>");			
				
				$( "#" + exchangeRates[i]["code"] ).bind( "click", function() {
					
					changeCurrency( $(this).attr("id") );

				});
			  
			
			}

			
				
			  updateRatesEmpty();
		
     },
     error: function (jqXHR, status) {            

		$('#status').html('Error in exchange rate retrieval');
		console.log(jqXHR);
     }

 });

}

function changeCurrency(code) {

	  for(var i = 0; i < exchangeRates.length; i++)
	  {
	  			if(exchangeRates[i]["code"] == code) {
	  				
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


function updateRates(evgWalletBalance, evgAccountBalance) {


	  var regCurrWalletBalance = parseFloat(evgWalletBalance) * parseFloat(secondaryCurrencyRate);
	  $('#wallet-regional-currency-symbol').html(secondaryCurrencySymbol);
	  $('#wallet-regional-currency-balance').html(regCurrWalletBalance.toFixed(2));
	  $('#wallet-regional-currency-code').html(secondaryCurrencyCode);

	  var regCurrAccountBalance = parseFloat(evgAccountBalance) * parseFloat(secondaryCurrencyRate);
	  $('#account-regional-currency-symbol').html(secondaryCurrencySymbol);
	  $('#account-regional-currency-balance').html(regCurrAccountBalance.toFixed(2));
	  $('#account-regional-currency-code').html(secondaryCurrencyCode);
	
		if (evgDevMode)
		{
			console.log("updating evg wallet");
			console.log(evgWalletBalance);
		
			console.log("updating balance");
			console.log(regCurrWalletBalance.toFixed(2));
		}
	
}

function updateRatesEmpty() {

	updateRates($('#wallet-evergreen-balance').html(), $('#account-evergreen-balance').html());
}



