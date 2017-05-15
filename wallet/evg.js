// Requires:
//   - evg-meta.js

var lastKnownWalletBalance;
var lastKnownAccountBalance;
var suggestedStores;
var suggestedStoreIndex;
var evgAuthToken;
var activeUserId;
var wallet_uid;
var loggedIn = false;

EvgStatusEnum = {
    DEBUG : 1,
    NORMAL : 2,
    MEDIUMHIGH : 3,
    HIGH : 4
}


// Imported from Clojure Schema

//  "/register_user"
//  { "meta" (dissoc request-meta "evg_auth_token")
//        "pin" pin
//        "user_id" user-id
//        "referrer" (sch/optional non-empty-string?)
//        "name" (sch/optional non-empty-string?)
//        "passphrase" (sch/optional password?)
//        "email" (sch/optional email)
//        "qr_code" (sch/optional qr)}

function getWalletUID() {
	
	console.log("start:" + wallet_uid);
	
	if(wallet_uid)
	 	return wallet_uid;		
			
	wallet_uid = walletPrefix + genUid();
	EvergreenStorageSet({"wallet-uid" : wallet_uid});
	console.log("newly generated:" + wallet_uid);
	console.log("finish " + wallet_uid);

	return wallet_uid;
	
}

function generateMeta() {
	
   
   var newMeta =  { "uuid" : getWalletUID(),
			        "platform" : "chrome-extension",
			        "request_id" : genUid() 
		  };
	
	// chrome.storage.sync.get([ "evg_auth_token" ], function(items) {
	// 
	// 		 metaEvgAuthToken = items["evg_auth_token"];
	// 		
	// });
	
	if(evgAuthToken)
		newMeta["evg_auth_token"] = evgAuthToken;
	
	return newMeta;
		
	
}


function init() {
	
	console.log('initializing...');
	
	currencyModuleInit();
	if(evgDevMode)
		$('#devFooter').show();
		
	EvergreenStorageGet([ "evg_auth_token", "lastKnownWalletBalance", "lastKnownAccountBalance", "activeUserId", "wallet-uid" ], function(items) {
			 
		 	 console.log(items);
			 wallet_uid = items["wallet-uid"];
			 evgAuthToken = items["evg_auth_token"];

			 activeUserId = items["activeUserId"];
 			 lastKnownWalletBalance = items["lastKnownWalletBalance"];
		     lastKnownAccountBalance = items["lastKnownAccountBalance"];
			 $('#wallet-evergreen-balance').html(lastKnownWalletBalance);
		     $('#account-evergreen-balance').html(lastKnownAccountBalance);
			 updateRates(lastKnownWalletBalance, lastKnownAccountBalance);
	   
			//Auto-login if authtoken is present
			//TODO: force refresh if > 30 days.
			if(evgAuthToken) {
				loggedIn = true;
				showBalanceAndTransactions();
				updateStatus("Logged in as " + activeUserId);
				$('#logoutButton').show();
			}
	
		  });
	
		$("#loginForm").validate({
			
			  //Don't actually process submit, handle through other means 
			  submitHandler: function(form) {

			  }
		 });
    
}


function logout() {
	
	evgAuthToken = "";
	metaEvgAuthToken = "";
	EvergreenStorageSet({"evg_auth_token" : ""}, function() {
		
		    console.log('AuthToken thrown away');
	});
	
	$('#login-box').show();
	$('#footer').hide();
	$('#balance-box').hide();
	$('#payment-box').hide();
	$('#account-box').hide();
	$('#name').hide(); 
	$('#pin').hide(); 
	$('#status').html('Successfully logged out.');
	$("#transaction-box").hide();
	$("#message-box").hide();
	
	
}

function postLoginInit(data) {
     
	  evgAuthToken = data["evg_auth_token"];
	  lastKnownWalletBalance = data["meta"]["wallet_balance"];
	  lastKnownAccountBalance = data["meta"]["account_balance"];
	  console.log(lastKnownAccountBalance);
	  console.log(lastKnownWalletBalance);
	
	  EvergreenStorageSet({"evg_auth_token": evgAuthToken, "lastKnownWalletBalance" : lastKnownWalletBalance, "lastKnownAccountBalance" : lastKnownAccountBalance  }, function() {
		
		    // Notify that we saved.
		    console.log('Settings saved');
		  });

      showBalanceAndTransactions();
	
}

function updateBalance(data) {
	
	  lastKnownWalletBalance = data["meta"]["wallet_balance"];
	  lastKnownAccountBalance = data["meta"]["account_balance"];
      $('#wallet-evergreen-balance').html(lastKnownWalletBalance);
      $('#account-evergreen-balance').html(lastKnownAccountBalance);
	  updateRates(lastKnownWalletBalance, lastKnownAccountBalance);
	
}

function showBalanceAndTransactions() {

	$('#loginButton').show();
	$('#login-box').hide();	
	$('#footer').show();
	$('#balance-box').show();
	$('#payment-box').show();
    $('#evergreen-balance').html(lastKnownWalletBalance);
	getExchangeRates();
	transactionList(3);
	if(showMessages)
		messageList(3);
	
}



function registerUser() {
	
	console.log('regUSer');
	
	if( $('#name').val() != "" && $('#name').val() != "name" )
	{
		console.log('regSer Name Valid');
		
		var params = { 	"meta" : generateMeta(),
					    "user_id" : "email:" + $('#username').val(),
		   				"passphrase" : $('#password').val(),
					    "name" : $('#name').val(),
				        "pin" : $('#pin').val(),
					    "email" : $('#username').val() } ;
	
		 $('#status').html('registering...');
	
	     jQuery.ajax({
		
	         type: "POST",
	         url: urlBase() + "register_user",
	         data: JSON.stringify(params),
	         contentType: "application/json; charset=utf-8",
	         dataType: "json",
	         success: function (data, status, jqXHR) {
		
				  console.log(data);
				  loggedIn = true;
				
	              $('#status').html('you are registered and logged in');
				  EvergreenStorageSet({"activeUserId": $('#username').val()  }, function() {
					   
					 	// Notify that we saved.
					    console.log('Settings saved');
					
				  });
				  
	
				  postLoginInit(data);
	
	         },

	         error: function (jqXHR, status) {            
	             alert(status);
				console.log(jqXHR);
	         }
	     });
	
	} else {
		
		$('#status').html('Please enter your name and 5 digit PIN'); 
		$('#name').show(); 
		$('#pin').show(); 
		$('#loginButtons').hide(); 
		$('#registerButtons').show(); 
		$('#loginTitle').html('Register');
		
		$("#loginForm").validate({
			  //Don't actually process submit, handle through other means 
			  submitHandler: function(form) {
		
			  }
		 });
		
		
	}
}

//  "/register_device"
//  [{"meta" (dissoc request-meta "evg_auth_token")
//    "user_id" user-id}
//     (sch/either
//       {"facebook_auth_token" non-empty-string?}
//       {"passphrase" string?
//        "email" email})]
// 


function registerDevice() {
	
	 	$('#status').html('logging in...');
	
	    activeUserId = $('#username').val();
	
		var params = { 	"meta" : generateMeta(),
					    "user_id" : "email:" + activeUserId,
						"passphrase" : $('#password').val(),
					    "email" : $('#username').val() } ;
					
		 console.log(params);

	     jQuery.ajax({
	         type: "POST",
	         url: urlBase() + "register_device",
	         data: JSON.stringify(params),
	         contentType: "application/json; charset=utf-8",
	         dataType: "json",
	         success: function (data, status, jqXHR) {
		
				  if(data["status"] == "authorized")
				  {
					updateStatus('Logged in  as ' + activeUserId);
					loggedIn = true;
					
					EvergreenStorageSet({"activeUserId": activeUserId  }, function() {

					 	// Notify that we saved.
					    console.log('Settings saved');

				  	});
				  
		            postLoginInit(data);				
				  } 
				  else {
					$('#status').html('Error in logging in. Check you have the right password');
					
				  }
	
				  console.log(data);
	         },

	         error: function (jqXHR, status) {            

				$('#status').html('Error in logging in');
				console.log(jqXHR);
	         }

	     });
}

//   "/withdraw"
//   { "meta" request-meta
//     "amount" amount
//     "pin" pin}


function processWithdrawal (contact) {

 	$('#status').html('withdrawing...');

	var params = { 	"meta" : generateMeta(),
				    "pin" : $('#withdrawalPin').val(),
					"amount" : $('#withdrawalAmount').val()
				 } ;
				
	 console.log(params);

     jQuery.ajax({
         type: "POST",
         url: urlBase() + "withdraw",
         data: JSON.stringify(params),
         contentType: "application/json; charset=utf-8",
         dataType: "json",
         success: function (data, status, jqXHR) {
	
			  if(data["meta"]["status"] == "authorized")
			  {
				updateStatus('Withdrawal successful');
				updateBalance(data);

			  } 
			  else {
				$('#status').html('Error on withdrawal');
				updateStatus(data["status"], EvgStatusEnum.DEBUG);
				
			  }
			
			  if(evgDevMode)
			  		console.log(data);
         },

         error: function (jqXHR, status) {            

			$('#status').html('Error on withdrawal');
			updateStatus(status, EvgStatusEnum.DEBUG);
			
			console.log(jqXHR);
         }

     });

}

//  "/make_payment"
//  { "meta" request-meta
//    "transaction_id" (sch/optional string?)
//    "amount" amount
//    "payee" user-id
//    "request_description" (sch/optional string?)
//      "item_ids" (sch/optional (sch/coll-of string?))}
// 

function makePayment() {
	
	var params = { 	"meta" : generateMeta(),
				    "amount" : $('#amount').val(),
					"payee" : formatUserId($('#payee').val()),
					"request_description" : $('#note').val()
				 };
				
				// 	"payee" :

		     jQuery.ajax({
		         type: "POST",
		         url: urlBase() + "make_payment",
		         data: JSON.stringify(params),
		         contentType: "application/json; charset=utf-8",
		         dataType: "json",
		         success: function (data, status, jqXHR) {

				  if(data["status"] == "invalid_account")
				  {

					updateStatus(data["status_message"]);

				  } else if(data["status"] == "insufficient_funds") {
					
					console.log(data["status"])
				  	updateStatus('Insufficient funds!', EvgStatusEnum.HIGH);
					
				  } else {

					updateStatus('Payment to ' + $('#payee').val() + 'was successful', EvgStatusEnum.NORMAL);
				  	transactionList(3);	

				  }


				  if(evgDevMode)
					  		console.log(data);
		         },

		         error: function (jqXHR, status) {            

					$('#status').html('Error on payment');
					console.log(jqXHR);
		         }

		     });

	
}

function buyItem(payee, amount, itemId, itemDescription) {
	
	var params = { 	"meta" : generateMeta(),
				    "amount" : amount,
					"payee" : payee,
					"request_description" : itemDescription,
					"item_ids" : [ itemId ]
				 };
				
				// 	"payee" : formatUserId($('#payee').val()),

		 outboundRequest("make_payment", params, 
			//success
			function (data, status, jqXHR) {
	
			  if(data["status"] == "invalid_account")
			  {
				
				$('#status').html(data["status_message"]);
				
			  } else {
				
				$('#status').html('success!');
				
			  }
			  transactionList(3);	

			  console.log(data);
         },
		//failure
        function (jqXHR, status) {            

			$('#status').html('Error');
			console.log(jqXHR);
         });

	
}


function loadWallets() {

var params = { "meta" : generateMeta() } ;

 jQuery.ajax({
     type: "POST",
     url: urlBase() + "wallets",
     data: JSON.stringify(params),
     contentType: "application/json; charset=utf-8",
     dataType: "json",
     success: function (data, status, jqXHR) {

		  console.log(data);
		  var wallets = data["wallets"];
		  $("#wallet-list").html("");
		  $("#wallet-box").show();
		  if(wallets) {

			  for(var i = 0; i < wallets.length; i++)
			  {
				  $("#wallet-list").append("<div class=\"wallet\">"  + wallets[i]["id"] + " " + wallets[i]["balance"] + "<img src=\"img/evg-credit-1-large-shadow.png\" width=\"16px\" /></div>");			
			  }
	   	  }
		
		
     },
     error: function (jqXHR, status) {            

		$('#status').html('Error in exchange rate retrieval');
		console.log(jqXHR);
     }

 });


}


//  "/register_merchant"
//  { "meta" request-meta
//        "description" string?
//        "is_merchant" #"true|t|TRUE|false|f|FALSE"
//    "user_id" non-empty-string?}
// 
// 
//  "/account_info"
//  { "meta" request-meta}
// 
//  "/change_account_info"
//  { "meta" request-meta
//    "user_id" user-id
//    "name" (sch/optional non-empty-string?)
//    "new_passphrase" (sch/optional password?)
//    "old_passphrase" (sch/optional string?)
//    "email" (sch/optional email)}  
// 
//  "/change_pin"
//  { "meta" request-meta
//    "old_pin" pin
//    "new_pin" pin }
// 
//    "/cash_in"
//    { "meta" request-meta
//    "amount" amount
//      "currency" non-empty-string?}
//
//    "/confirm_cash_in"
//    { "meta" request-meta
//    "payment_data" string?
//      "confirmation_token" string?}
// 
//    "/christmas_cash"
//    { "meta" request-meta
//  "amount" amount
//      "currency" non-empty-string?}
// 
//    "/confirm_christmas_cash_in"
//    { "meta" request-meta
//    "payment_data" string?
//      "confirmation_token" string?}
// 
//    ;; Payments
// 
//  "/suggested_payors"
//  { "meta" request-meta}
// 
//  "/search_users"
//  { "meta" request-meta
//    "query" string?}
// 
//  "/request_payment"
//  { "meta" request-meta
//    "payor" user-id
//    "amount" amount
//    "request_description" string?
//      "item_ids" (sch/optional (sch/coll-of string?))}
// 
//  ; NYI: "/cancel_request"
// 
//   "/reject_payment"
//   { "meta" request-meta
//     "transaction_id" non-empty-string?}
// 
//     "/rollback_payment"
//   {"meta" request-meta
//      "transaction_id" non-empty-string?
//      "amount" amount
//      "request_description" (sch/optional string?)}
// 
//  ;; ATM Functionality 
// 
// 
//   "/deposit"
//   { "meta" request-meta
//     "amount" amount}
// 



function messageList(numItemsToShow) {

	var params = { "meta" : generateMeta(),
				    "num_items" : numItemsToShow } ;

	jQuery.ajax({
	     type: "POST",
	     url: urlBase() + "messages",
	     data: JSON.stringify(params),
	     contentType: "application/json; charset=utf-8",
	     dataType: "json",
	     success: function (data, status, jqXHR) {

			console.log(data);
			var messages = data["messages"];
			updateBalance(data);

			$("#message-list").html("");
			$("#message-box").show();

			for(var i = 0; i < messages.length; i++)
			{
				  var mid = messages[i]["transaction_id"].split(' ').join('-');
				  $("#message-list").append("<li id=\"mi" + mid + "\" messageId=\"" + mid + "\" class=\"message\">"  + messages[i]["payor_name"] + ": " + messages[i]["request_description"] + "</li>");			
			}
		
	     },
	     error: function (jqXHR, status) {            

			$('#status').html('Error in in transaction list retrieval');
			console.log(jqXHR);
	     }

	 });


}



//   "/transaction_list"
//   { "meta" request-meta
//     "start_position" (sch/optional number?)
//     "num_items" (sch/optional number?)}

function transactionList(numItemsToShow) {

	var params = { "meta" : generateMeta(),
				    "num_items" : numItemsToShow } ;

	 jQuery.ajax({
	     type: "POST",
	     url: urlBase() + "transaction_list",
	     data: JSON.stringify(params),
	     contentType: "application/json; charset=utf-8",
	     dataType: "json",
	     success: function (data, status, jqXHR) {

			  console.log(data);
			  var transactions = data["transactions"];
			  updateBalance(data);
			
			  $("#transaction-list").html("");
			  $("#transaction-box").show();
		
			  for(var i = 0; i < transactions.length; i++)
			  {
				  var tid = transactions[i]["transaction_id"].split(' ').join('-');
				  $("#transaction-list").append("<li id=\"ti" + tid + "\" transactionId=\"" + tid + "\" class=\"transaction-item\">"  + transactions[i]["payor_name"] + " <i>to</i> " + transactions[i]["payee_name"]  + " <strong>" + transactions[i]["amount"] + "</strong> <a>details</a></li>");			
			
				  $( "#ti" + tid ).bind( "click", function() {

						toggleTransactionDetail( $(this).attr("transactionId") );
						
				   });
  
			  }
		
	     },
	     error: function (jqXHR, status) {            

			$('#status').html('Error in in transaction list retrieval');
			console.log(jqXHR);
	     }

	 });


}

function toggleTransactionDetail(transactionId) {
	
		console.log("toggling");
		
		if($("#tid" + transactionId).length)
			$("#tid" + transactionId).toggle();
		else 
			transactionDetail(transactionId);
			
}


//   "/transaction_detail"
//   { "meta" request-meta
//     "transaction_id" non-empty-string?}

function transactionDetail(transactionId) {
	
	console.log("detail");

	
	var params = { "meta" : generateMeta(),
				    "transaction_id" : transactionId } ;

				 jQuery.ajax({
				     type: "POST",
				     url: urlBase() + "transaction_detail",
				     data: JSON.stringify(params),
				     contentType: "application/json; charset=utf-8",
				     dataType: "json",
				     success: function (data, status, jqXHR) {

						 // From docs
						 // "transaction_id": "3895askjfka838dkf",
						 // "transaction_status": "requested",
						 // "request_date": "2013-03-21T14:21:33Z"
						 // "payment_date": "2013-03-21T18:25:43Z"
						 // "amount": "200",
						 // "payor_id": "facebook:1234121232",
						 // "payor_name": "Dave Kammeyer",
						 // "payor_image": "https://s3.aws.com/9583ksajka8493.jpg",
						 // "payee_id": "facebook:123412124",
						 // "payee_name": "Joel Dietz",
						 // "payee_image": "https://s3.aws.com/i388d0d983ks34.jpg",
						 // "request_description": "Payment for rideshare to Rome.",
						 // "feedback_status": "negative",
						 // "feedback_description": "Goods Not Delivered"
						console.log(data);
						
						statusArea.html('success!');
						$("#transaction-box").show();
					  	$("#ti" + transactionId).after("<div id=\"tid" + transactionId + "\" class=\"transaction-item-detail\"><p>Description: "  + data["request_description"] + "</p><p>Date: " + data["payment_date"]  + "</p><p>Status: " + data["transaction_status"] + "</p></div>");			
						$( "#tid" + transactionId ).bind( "click", function() {
								$(this).hide();
						 });

				     },
				     error: function (jqXHR, status) {            

						$('#status').html('Error in in transaction detail retrieval');
						console.log(jqXHR);
				     }

				 });

}




//   "/leave_feedback"
//   { "meta" request-meta
//     "transaction_id" non-empty-string?
//     "feedback_type" #"positive|negative"
//     "feedback_description" (sch/optional string?)}
// 
// ;; Merchant 
// 
//  "/suggested_merchants"
//  { "meta" request-meta}
// 
// 
//   "/qr_status"
//   { "meta" request-meta
//     "qr_code" qr}
// 
//  "/analytics"
//  { "meta" request-meta}
// 

function incrementSuggestedStoreIndex() {
	
	if(suggestedStoreIndex >= suggestedStores.length)
		suggestedStoreIndex = 0;
		
	$('#otherStoreEmail').val(suggestedStores[suggestedStoreIndex - 1]["name"]); 
	suggestedStoreIndex += 1;
	
}

function loadSuggestedStores() {

	var params = { "meta" : generateMeta() } ;
	if(!suggestedStoreIndex)
	{
		 suggestedStoreIndex = 0;
		 jQuery.ajax({
		     type: "POST",
		     url: urlBase() + "suggested_stores",
		     data: JSON.stringify(params),
		     contentType: "application/json; charset=utf-8",
		     dataType: "json",
		     success: function (data, status, jqXHR) {

				  console.log(data);
				  suggestedStores = data["stores"];
				  if(suggestedStores && suggestedStores[0] && suggestedStores[0]["name"]) {
						$('#otherStoreEmail').val(suggestedStores[0]["name"]); 
						suggestedStoreIndex = 1;
					}
			
				
					// 			  $("#store-item-list").html("");
					// 			  $("#store-box").show();
					// 			  if(items) {
					// 
					//   for(var i = 0; i < items.length; i++)
					//   {
					// 	  $("#store-item-list").append("<div class=\"store-item\" id=\"si" + items[i]["id"] + "\" itemId=\"" + items[i]["id"] + "\"  payee=\"" + payee + "\" amount=\"" + items[i]["amount"]  + "\" description=\"" +  items[i]["description"] + " x 1\">"  + items[i]["description"] + " |" + items[i]["amount"] + "<img src=\"img/evg-credit-1-large-shadow.png\" width=\"16px\" /> <- buy now</div>");			
					// 
					// 		$( "#si" + items[i]["id"] ).bind( "click", function() {
					// 
					// 			buyItem( $(this).attr("payee"), $(this).attr("amount"), $(this).attr("itemId"), $(this).attr("description") );
					// 
					// 		});
					//   
					// 
					// }
					// 		   	  }

		     },
		     error: function (jqXHR, status) {            

				$('#status').html('Error in in transaction list retrieval');
				console.log(jqXHR);
		     }

		 });
	
	} else {
		
		incrementSuggestedStoreIndex();
	}
	


}


// 
//    ;; Items
//     "/items"
//     (sch/either
//       {"meta" request-meta
//        "payee" user-id
//        "items" sch/nothing}
//       {"meta" request-meta
//        "payee" sch/nothing
//        "items" (sch/optional 
//                  (sch/coll-of 
//                    (sch/either
//                      {"id" (sch/optional string?)
//                       "description" string?
//                       "amount" amount}
//                      {"id" string?
//                       "deleted" #"true"})))})})

	
    function loadStoreItemsByIndex(index) {
	
	
		loadStoreItems(suggestedStores[index - 1]["user_id"]);
		$( "#storeTitle" ).html(suggestedStores[index - 1]["name"] + " store");
		
		
	}
	
    function loadStoreItems(payee) {
	
		var params = { "meta" : generateMeta() } ;
		
		if(payee) {
			payee = formatUserId(payee);
			params["payee"] = payee;
			$( "#store-item-add-box" ).hide();
			
		} else {
			// It's my store!
		    $( "#store-item-add-box" ).show();
			$( "My store");
		}
  
		 jQuery.ajax({
		     type: "POST",
		     url: urlBase() + "items",
		     data: JSON.stringify(params),
		     contentType: "application/json; charset=utf-8",
		     dataType: "json",
		     success: function (data, status, jqXHR) {

				  console.log(data);
				  var items = data["items"];
				  $("#store-item-list").html("");
				  //$("#store-box").show();
				  if(items) {

					  for(var i = 0; i < items.length; i++)
					  {
						  $("#store-item-list").append("<li class=\"store-item\" id=\"si" + items[i]["id"] + "\" itemId=\"" + items[i]["id"] + "\"  payee=\"" + payee + "\" amount=\"" + items[i]["amount"]  + "\" description=\"" +  items[i]["description"] + " x 1\">"  + items[i]["description"] + " <strong>" + items[i]["amount"] + "</strong> <a>buy now</a></li>");			

							$( "#si" + items[i]["id"] ).bind( "click", function() {

								buyItem( $(this).attr("payee"), $(this).attr("amount"), $(this).attr("itemId"), $(this).attr("description") );

							});
					  
					
					}
			   	  }

		     },
		     error: function (jqXHR, status) {            

				$('#status').html('Error in in transaction list retrieval');
				console.log(jqXHR);
		     }

		 });
	
	
    }

    function addStoreItem() {
	
		var params = { "meta" : generateMeta(),
					    "items" : [{	    
					    	    "description" : $('#new-item-description').val(),
					   	        "amount" : $('#new-item-amount').val()
						           }]
					 };
		
		 console.log(params);
		
		 jQuery.ajax({
		     type: "POST",
		     url: urlBase() + "items",
		     data: JSON.stringify(params),
		     contentType: "application/json; charset=utf-8",
		     dataType: "json",
		     success: function (data, status, jqXHR) {

				  console.log(data);
				  var items = data["items"];
				  $("#store-item-list").html("");
				  $("#store-box").show();
				  if(items) {
				
					  for(var i = 0; i < items.length; i++)
					  {
						  $("#store-item-list").append("<li class=\"store-item\">"  + items[i]["description"] + " <strong>" + items[i]["amount"] + "</strong></li>");			
					  }
				  }

		     },
		     error: function (jqXHR, status) {            

				$('#status').html('Error in in transaction list retrieval');
				console.log(jqXHR);
		     }

		 });
	
	
    }


	document.addEventListener('DOMContentLoaded', function () {

		$( "#register" ).bind( "click", function() {
			
	      registerUser();
	
		});

		$( "#registerButton" ).bind( "click", function() {
			
	      registerUser();
	
		});
		
		
		$( "#loginButton" ).bind( "click", function() {

	      registerDevice();
	
		});

		$( "#logoutButton" ).bind( "click", function() {

	      logout();
	
		});
		// 
		// $( "#loadStoreButton" ).bind( "click", function() {
		// 	
		// 	      loadStoreItems();
		// 	      loadSuggestedStores();
		//    	 	  $( "#loadStoreButton" ).hide();
		//    	 	  $( "#closeStoreButton" ).show();
		// 
		// });

		$( "#registerBack" ).click( function() {
			
			$('#name').hide(); 
			$('#pin').hide(); 
			$('#registerButtons').hide(); 
			$('#loginButtons').show(); 
			$('#loginTitle').html('Login'); 
			updateStatus('Please login.'); 
			
		});

		$( ".ico-cart" ).click( function() {
		
			if(loggedIn)
			{
				
			  $(this).toggleClass("active");
		      loadStoreItems();
		      loadSuggestedStores();
			  $( "#store-box" ).toggle();
	   	 	  $( "#switch-store-box" ).toggle();
	
			} else {
				updateStatus("Please login first.", EvgStatusEnum.MEDIUMHIGH);
			}
			
		  // $( "#loadStoreButton" ).toggle();
   	 	  // $( "#closeStoreButton" ).toggle();

		});
		

		$( "#loadStoreButton" ).bind( "click", function() {
			
		   loadStoreItemsByIndex(suggestedStoreIndex);
		   incrementSuggestedStoreIndex();
		
		});
		

		$( "#addStoreItem" ).bind( "click", function() {

	       addStoreItem();
	
		});
		
		$( '#all-transactions').click(function() {
			
			transactionList(20);
			$( '#all-transactions').hide();
			$( '#recent-transactions').show();
		
		});

		$( '#recent-transactions').click(function() {
			
			transactionList(3);
			$( '#recent-transactions').hide();
			$( '#all-transactions').show();

		});
		
		$( '#all-messages').click(function() {
			
			messageList(20);
			$( '#all-messages').hide();
			$( '#recent-messages').show();
		
		});

		$( '#recent-messages').click(function() {
			
			messageList(3);
			$( '#recent-messages').hide();
			$( '#all-messages').show();

		});
		
		
		$( "#closeStoreButton" ).bind( "click", function() {

   	 	  $( "#loadStoreButton" ).show();
   	 	  $( "#closeStoreButton" ).hide();
   	 	  $( "#store-box" ).hide();
	
		});

		$( "#paymentButton" ).bind( "click", function() {
	      
			makePayment();
	
		});
		
		$( "#currency-selector" ).click( function() {

   	 	    $( "#currency-selector-box" ).toggle();

		});
		
		$( ".ico-lock" ).click( function() {
			
			if(loggedIn)
			{
			    $(this).toggleClass("active");
				if(showWallet) {
					loadWallets();				
				}
				$( "#loadWalletsButton" ).toggle();
	   	 	    $( "#closeWalletsButton" ).toggle();
	   	 	    $( "#account-box" ).toggle();
			} else {
				updateStatus("Please login first.", EvgStatusEnum.MEDIUMHIGH);
			}



		});
	
		$( "#withdrawalButton" ).click( function() {

			processWithdrawal();

		});


		$( "#loadWalletsButton" ).bind( "click", function() {
	      
			loadWallets();
			$( "#loadWalletsButton" ).hide();
   	 	    $( "#closeWalletsButton" ).show();
   	 	    $( "#account-box" ).show();
   	 	  
		});

		$( "#closeWalletsButton" ).bind( "click", function() {
	      
			$( "#loadWalletsButton" ).show();
   	 	    $( "#closeWalletsButton" ).hide();
   	 	    $( "#account-box" ).hide();
	
		});

		// $( '#username').focus(function() {
		// 	$( '#username').val('');
		// });
		// 
		// $( '#password').focus(function() {
		// 	$( '#password' ).val('');
		// });
		// 
		// $('#name').focus(function() {
		// 	$( '#name' ).val('');
		// });
		// 
		// $('#pin').focus(function() {
		// 	$( '#pin' ).val('');
		// });
		// 
		// $('#payee').focus(function() {
		// 	$( '#payee' ).val('');
		// });
		// 
		// $('#note').focus(function() {
		// 	$( '#note' ).val('');
		// });
		// 
		// $('#amount').focus(function() {
		// 	$( '#amount' ).val('');
		// });

		$('#new-item-description').focus(function() {
			$( '#new-item-description' ).val('');
		});

		$('#new-item-amount').focus(function() {
			$( '#new-item-amount' ).val('');
		});

		$( "#fbLogin" ).bind( "click", function() {
		  alert( "User clicked on 'fbLogin.'" );
		});
			
	    init();
	
	
	});

