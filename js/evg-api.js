
//  "/register_user"
//  { "meta" (dissoc request-meta "evg_auth_token")
//        "pin" pin
//        "user_id" user-id
//        "referrer" (sch/optional non-empty-string?)
//        "name" (sch/optional non-empty-string?)
//        "passphrase" (sch/optional password?)
//        "email" (sch/optional email)
//        "qr_code" (sch/optional qr)}


function registerUser() {
	
	updateLog('regUSer');
	
	if( $('#name').val() != "" && $('#name').val() != "name" && $('#pin').val()  != "" )
	{
		updateLog('regSer Name Valid');
		
		var params = { 	"meta" : generateMeta(),
					    "name" : $('#name').val(),
				        "pin" : $('#pin').val(),
					    "email" : $('#username').val() } ;
					
		if($('#username').attr("userId"))
			params["user_id"] = "facebook:" + $('#username').attr("userId");
		else
		{
			params["passphrase"] = $('#password').val();
			params["user_id"] = "email:" + $('#username').val();
		}
	
		 updateStatus('registering...');
	
	     jQuery.ajax({
		
	         type: "POST",
	         url: urlBase() + "register_user",
	         data: JSON.stringify(params),
	         contentType: "application/json; charset=utf-8",
	         dataType: "json",
	         success: function (data, status, jqXHR) {
		
				  updateLog(data);
				  loggedIn = true;
				  if(facebookAuthToken)
				  {
					registerDevice($('#username').attr("userId"),facebookAuthToken);
					
				  } else {
					
					  updateStatus('you are registered and logged in');
					  EvergreenStorageSet({"activeUserId": $('#username').val()  }, function() {

						 	// Notify that we saved.
						    updateLog('Settings saved');

					  });
		            
					
				  }
				  
				  
	
				  postLoginInit(data);
	
	         },

	         error: function (jqXHR, status) {            

				updateLog(jqXHR);
	         }
	     });
	
	} else {
		
		updateStatus('Please enter your name and 5 digit PIN'); 
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


function registerDevice(facebookId, facebookToken) {
	
		updateStatus('Logging in...');
	
	
	    activeUserId = "email:" + $('#username').val();
		
		if(facebookId)
			activeUserId = "facebook:" + facebookId;			
			
		var params = { 	"meta" : generateMeta(),
					    "user_id" : activeUserId,
					    "email" : $('#username').val() } ;
		if(facebookToken)
			params["facebook_auth_token"] = facebookToken;
		else
			params["passphrase"] = $('#password').val();
				      
		 updateLog('registerDevice');
		 updateLog(params);

	     jQuery.ajax({
	         type: "POST",
	         url: urlBase() + "register_device",
	         data: JSON.stringify(params),
	         contentType: "application/json; charset=utf-8",
	         dataType: "json",
	         success: function (data, status, jqXHR) {
		
				  updateLog(data);
				
				  if(data["status"] == "authorized")
				  {
					if(activeUserName)
						updateStatus('Logged in as ' + activeUserName);
					else
						updateStatus('Logged in as ' + activeUserId);
						
					loggedIn = true;
					$('#logoutButton').show();
				  
					EvergreenStorageSet({"activeUserId": activeUserId  }, function() {

					 	// Notify that we saved.
					    updateLog('Settings saved');

				  	}); 
				  
		            postLoginInit(data);				
				  } 
				  else {
					
						updateStatus('Error in logging in. Check you have the right password');
					
						updateStatus('Please enter your 5 digit PIN', EvgStatus.MEDIUMHIGH); 
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
	
				  updateLog(data);
	         },

	         error: function (jqXHR, status) {            

				updateStatus('Error in logging in');
				updateLog(jqXHR);
	         }

	     });
}

//   "/withdraw"
//   { "meta" request-meta
//     "amount" amount
//     "pin" pin}


function processWithdrawal (contact) {

 		updateStatus('withdrawing...');
		
		if($('#withdrawalPin').val().length != 5) {
			
			updateStatus('You must enter a five digit pin.',EvgStatus.HIGH);
			
		} else  {
    
			var params = { 	"meta" : generateMeta(),
						    "pin" : $('#withdrawalPin').val(),
							"amount" : $('#withdrawalAmount').val()
						 } ;
			 
						// updateLog($('#withdrawalPin').val());
			
			 updateLog(params);
		

		     jQuery.ajax({
		         type: "POST",
		         url: urlBase() + "withdraw",
		         data: JSON.stringify(params),
		         contentType: "application/json; charset=utf-8",
		         dataType: "json",
		         success: function (data, status, jqXHR) {
			
			
					  updateLog(data);
					
					  if(data["status"] == "wrong_pin")
					  {
						updateStatus('Wrong pin. Try again.',EvgStatus.HIGH);
					  }
					  else if(data["meta"]["status"] == "authorized") 
					  {
						updateStatus('Withdrawal successful. New balance ' + data["meta"]["wallet_balance"] + ' greenz');
						updateBalance(data);
					
					
					  } 
					  else {
						
							updateStatus('Error on withdrawal');
							updateStatus(data["status"], EvgStatus.DEBUG);
					  
					  }
			
					  if(evgDevMode)
					  		updateLog(data);
		         },

		         error: function (jqXHR, status) {            

					updateStatus('Error on withdrawal');
					updateStatus(status, EvgStatus.DEBUG);
			
					updateLog(jqXHR);
		         }

		     });
		
		} // end else
		
		   $('#withdrawalPin').val(''),
		   $('#withdrawalAmount').val('')
		

	} // end function
	

	//  "/make_payment"
	//  { "meta" request-meta
	//    "transaction_id" (sch/optional string?)
	//    "amount" amount
	//    "payee" user-id
	//    "request_description" (sch/optional string?)
	//      "item_ids" (sch/optional (sch/coll-of string?))}
	// 

	function makePayment() {
	
	    var payee = $('#payee').attr("userId") || $('#payee').val();
	
		var params = { 	"meta" : generateMeta(),
					    "amount" : $('#amount').val(),
						"payee" : formatUserId(payee),
						"display_name" : payee,
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


					  if(evgDevMode)
						  		updateLog(data);

					  if(data["status"] == "invalid_account")
					  {

						updateStatus(data["status_message"]);

					  } else if(data["status"] == "insufficient_funds") {
					
						updateLog(data["status"])
					  	updateStatus('Insufficient funds!', EvgStatus.HIGH);
					
					  } else {

						updateStatus('Payment to ' + $('#payee').val() + ' was successful', EvgStatus.NORMAL);
						paymentSound.play();
						currentTransactionItemsToShow = 3;
						transactionList();
						if(evgGameMode)	
					    	updateScore();

					  }


			         },

			         error: function (jqXHR, status) {            

						updateStatus('Error on payment');
						updateLog(jqXHR);
			         }

			     });
}

function buyItem(payee, amount, itemId, itemDescription, videoUrl, imageUrl) {
	
	var params = { 	"meta" : generateMeta(),
				    "amount" : amount,
					"payee" : payee,
					"request_description" : itemDescription,
					"item_ids" : [ itemId ]
				 };
				
				// 	"payee" : formatUserId($('#payee').val()),

			     jQuery.ajax({
			         type: "POST",
			         url: urlBase() + "make_payment",
			         data: JSON.stringify(params),
			         contentType: "application/json; charset=utf-8",
			         dataType: "json",
			         success: function (data, status, jqXHR) {


					  if(evgDevMode)
						  		updateLog(data);

					  if(data["status"] == "invalid_account")
					  {
						
						updateStatus(data["status_message"]);

					  } else if(data["status"] == "insufficient_funds") {
					
						updateLog(data["status"])
					  	updateStatus('Insufficient funds!', EvgStatus.HIGH);
					
					  } else {

						paymentSound.play();
						updateStatus('Payment to ' + $('#payee').val() + ' was successful', EvgStatus.NORMAL);
						if(videoUrl)
							loadVideo( videoUrl );
						if(imageUrl)
							loadImage( imageUrl );
							
						currentTransactionItemsToShow = 3;	  	
						transactionList();	

					  }


			         },

			         error: function (jqXHR, status) {            

						updateStatus('Error on payment');
						updateLog(jqXHR);
			         }

			     });


	
}

function deleteItem(itemId) {
	
	var params = { 	"meta" : generateMeta(),
				    "amount" : amount,
					"payee" : payee,
					"request_description" : itemDescription,
					"items" : [ { "id" : itemId, "delete" : "true" } ]
				 };
				

			     jQuery.ajax({
			         type: "POST",
			         url: urlBase() + "items",
			         data: JSON.stringify(params),
			         contentType: "application/json; charset=utf-8",
			         dataType: "json",
			         success: function (data, status, jqXHR) {

					  if(evgDevMode)
						  		updateLog(data);

					  if(data["status"] == "invalid_account")
					  {
						
						updateStatus(data["status_message"]);

					  }  
					


			         },

			         error: function (jqXHR, status) {            

						updateStatus('Error on payment');
						updateLog(jqXHR);
			         }

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

		  updateLog(data);
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

		updateStatus('Error in exchange rate retrieval');
		updateLog(jqXHR);
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


function searchUsers(query) {

	var params = { "meta" : generateMeta(),
				    "query" : $('#payee').val() } ;
				
		 // 				   "meta": { ... },
		 // 			       "results":
		 // 				   [
		 // 				    {
		 // "name": "Dave Kammeyer",
		 // "user_id": "facebook:1234121232",
		 // "image": "https://s3.aws.com/9583ksajka8493.jpg",
		 // "positive_rating": 80,
		 // "negative_rating": 0
		 // 
		 // 				    },
		 // 			    

	jQuery.ajax({
	     type: "POST",
	     url: urlBase() + "search_users",
	     data: JSON.stringify(params),
	     contentType: "application/json; charset=utf-8",
	     dataType: "json",
	     success: function (data, status, jqXHR) {

			updateLog(data);
			var users = data["results"];
			updateBalance(data);

			$("#user-list").html("");
			$("#user-box").show();

			for(var i = 0; i < users.length; i++)
			{
				  $("#user-list").append("<li id=\"user" + i + "\" name=\"" + users[i]["name"] + "\" userId=\"" + users[i]["user_id"] + "\" class=\"user\">"  + users[i]["name"]  + "&nbsp;&nbsp;&nbsp;&nbsp;<img src=\"" + users[i]["image"] + "\"/></li>");			
				  $( "#user" + i ).bind( "click", function() {

					    $("#user-box").hide();
						loadUser( $(this).attr("id"));
						
				   });
			
			}
		
	     },
	     error: function (jqXHR, status) {            

			updateStatus('Error in in transaction list retrieval');
			updateLog(jqXHR);
	     }

	 });
	
		
}

function loadUser(elementId, userId) {
	
	$('#payee').val($("#" + elementId).attr("name"));	
	$('#payee').attr("userId", $("#" + elementId).attr("userId"));	
	$( "#paymentButton").html("Send");

	// $(elementId).hide();
	
}

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

			updateLog(data);
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

			updateStatus('Error in in transaction list retrieval');
			updateLog(jqXHR);
	     }

	 });


}



//   "/transaction_list"
//   { "meta" request-meta
//     "start_position" (sch/optional number?)
//     "num_items" (sch/optional number?)}

function transactionList() {

	
	var numItemsToShow = currentTransactionItemsToShow;
	
	if(!numItemsToShow)
		numItemsToShow = 3;
	
	if(!pollingHalted) {
		
		var openTransIds = new Array();

		var transactionDetails = $('.transaction-item-detail:visible').each(function () {
				
			updateLog($(this));
			updateLog($(this).attr("transactionId"));
			
			openTransIds.push($(this).attr("transactionId"));
			
		})
		updateLog(transactionDetails);
		updateLog(openTransIds);

	
		var params = { "meta" : generateMeta(),
					    "num_items" : numItemsToShow } ;

		 jQuery.ajax({
		     type: "POST",
		     url: urlBase() + "transaction_list",
		     data: JSON.stringify(params),
		     contentType: "application/json; charset=utf-8",
		     dataType: "json",
		     // TODO: polling time does not work correctly for unknown reasons. 
		     // complete: transactionList,
		     // timeout: 5000,
		     success: function (data, status, jqXHR) {

				  updateLog(data);
				  var transactions = data["transactions"];
				  updateBalance(data);
			
				  $("#transaction-list").html("");
				  updateLog(transactionDetails);
				  $("#transaction-box").show();
		
				  for(var i = 0; i < transactions.length; i++)
				  {
					  var tid = transactions[i]["transaction_id"].split(' ').join('-');
					  // $("#transaction-list").append("<li id=\"ti" + tid + "\" transactionId=\"" + tid + "\" class=\"transaction-item\"><a id=\"ati" + tid + "\" href=\"#\" class=\"expander\">Expand</a>"  + transactions[i]["payor_name"] + " <i>to</i> " + transactions[i]["payee_name"]  + " <strong>" + transactions[i]["amount"] + "</strong></li>");			
					  $("#transaction-list").append("<li id=\"ti" + tid + "\" transactionId=\"" + tid + "\" class=\"transaction-item\"><a id=\"ati" + tid + "\" href=\"#\" class=\"expander\">Expand</a>"  + transactions[i]["payor_name"] + " <i>to</i> " + transactions[i]["payee_name"]  + " <strong>" + convertToSecondaryCurrency(transactions[i]["amount"]) + "</strong></li>");			
					  
					 //if(openTransIds.contains(transactions[i]));
					
					  $( "#ti" + tid ).bind( "click", function() {

							toggleTransactionDetail( $(this).attr("transactionId") );
						
					   });
					
					
  
				  }
				
					 for(var j = 0; j < openTransIds.length; j++) {
					
						toggleTransactionDetail(openTransIds[j]);
					
					}
				
			
				//TODO: Could be a problem if toggling number of items between polling, or initiating multiple polling threads 
				// if(!alreadyPollingTransactions)  {
				// 	
				// 	setTimeout(transactionList(numItemsToShow), 10000000000);
				// 	//alreadyPollingTransactions = true;
				// 	
				// }
 		
		     },
		     error: function (jqXHR, status) {            

				updateStatus('Error in in transaction list retrieval');
				updateLog(jqXHR);
		     }

		 });
	
	} else {
		
		  $("#transaction-box").hide();
		
	}


}

function toggleTransactionDetail(transactionId) {
	
		updateLog("toggling");
		
		$( "#ati" + transactionId ).toggleClass("on");
		
            // if ($(this).hasClass("on")) {
            //     $(this).removeClass("on").parent().find(".expanded").slideUp();
            // } else {
            //     $(this).parent().siblings().find(".on").removeClass("on");
            //     $(this).parent().siblings().find(".expanded").slideUp();
            //     $(this).addClass("on").parent().find(".expanded").slideDown();
            // }
            // e.preventDefault();
        
		
		if($("#tid" + transactionId).length) 
			$("#tid" + transactionId).slideToggle("slow");
		else 
			transactionDetail(transactionId);
			
}


//   "/transaction_detail"
//   { "meta" request-meta
//     "transaction_id" non-empty-string?}

function transactionDetail(transactionId) {
	
	updateLog("detail");

	
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
						updateLog(data);
						
						statusArea.html('success!');
						$("#transaction-box").show();
					  	$("#ti" + transactionId).after("<div id=\"tid" + transactionId + "\" transactionId=\"" + transactionId +"\" class=\"transaction-item-detail\" style=\"display:none\"><p>"  + data["request_description"] + "</p><p><span class=\"date-label\">Date:</span> " + data["payment_date"]  + "<span style=\"float:right\"><span class=\"status-label\">Status:</span> " + data["transaction_status"] + "</span></p></div>");			
					  	$("#tid" + transactionId).slideDown();
						$( "#tid" + transactionId ).bind( "click", function() {
								$(this).slideUp();
						 });

				     },
				     error: function (jqXHR, status) {            

						updateStatus('Error in in transaction detail retrieval');
						updateLog(jqXHR);
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

	suggestedStoreIndex += 1;
	
	if(suggestedStoreIndex >= suggestedStores.length)
		suggestedStoreIndex = 1;
		
	$('#otherStoreEmail').val(suggestedStores[suggestedStoreIndex - 1]["name"]); 
	
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

				  updateLog(data);
				  suggestedStores = data["stores"];
				  if(suggestedStores && suggestedStores[0] && suggestedStores[0]["name"]) {
						$('#otherStoreEmail').val(suggestedStores[0]["name"]); 
						suggestedStoreIndex = 1;
					}
			

		     },
		     error: function (jqXHR, status) {            

				updateStatus('Error in in transaction list retrieval');
				updateLog(jqXHR);
		     }

		 });
	
	} else {
		
		incrementSuggestedStoreIndex();
	}
	


}


    function loadTopVideos() {
	
	    updateLog('topvideos');
		$('#storeTitle').html('Top Videos');
    
		var params = { "meta" : generateMeta() } ;

		 jQuery.ajax({
		     type: "POST",
		     url: urlBase() + "top_videos",
		     data: JSON.stringify(params),
		     contentType: "application/json; charset=utf-8",
		     dataType: "json",
		     success: function (data, status, jqXHR) {
			    updateLog('topvideossuccess');

				  updateLog(data);
				  activeStoreItems = data["videos"];
				  populateStoreItems(activeStoreItems);

		     },
		     error: function (jqXHR, status) {            

				updateStatus('Error in video');
				updateLog(jqXHR);
		     }

		 });
	
	
    }

    function loadImage(imageUrl) {
	
	    updateLog('loadImage');
	    updateLog(imageUrl);
	
		if(imageUrl) {
		   
			// 		 	var urls = videoUrl.split('v=');
			// if(urls.length == 2)
			// 	parsedVideoUrl = urls[1];
			// else 
			// 	parsedVideoUrl = videoUrl;

		  	//$('#video-player').attr('src', 'http://www.youtube.com/watch?v=j6cxZp4ii6c');
		
			updateLog('whoing');
			
			 $("#image-box").show();
		  	 $('#activeImage').attr('src', imageUrl);
			
		} else {
			
			 $("#image-box").hide();
			
		}
		
	
	}


    function loadVideo(videoUrl) {
	
	    updateLog('vid');
	    updateLog(videoUrl);
	
		if(videoUrl && videoUrl.indexOf("youtube.com") != -1) {
		   
		 	var urls = videoUrl.split('v=');
			if(urls.length == 2)
				parsedVideoUrl = urls[1];
			else 
				parsedVideoUrl = videoUrl;

		  	//$('#video-player').attr('src', 'http://www.youtube.com/watch?v=j6cxZp4ii6c');
		
			// updateLog('whoing');
			
			 $("#video-box").show();
			
		  	 $('#video-player').attr('src', 'http://www.youtube.com/embed/' + parsedVideoUrl + '?autoplay=1');
			
		} else {
			
			 $("#video-box").hide();
			
		}
		
		
	
	}
	
	//Make automatic micropayment	
	function initializeCashOut(amount) {

	    //  "/make_payment"
	    //  { "meta" request-meta
	    //    "transaction_id" (sch/optional string?)
	    //    "amount" amount
	    //    "payee" user-id
	    //    "request_description" (sch/optional string?)
	    //      "item_ids" (sch/optional (sch/coll-of string?))}

		if(!amount)
			amount = "1";

		if(amount < 2500)
		{
			
			updateGrowl("You need to have at least 2500 greenz before you can cash out");
			
			
		} else {
		    var params = {
		        "meta": generateMeta(),
		        "amount": amount.toString(),
		        "payee": "facebook:1001170",
		        "request_description": "Request for cash out."
		    };

			// alert("params");
			// alert(JSON.stringify(params));

		    console.log(params);

			jQuery.ajax({
			        type: "POST",
			        url: urlBase() + "make_payment",
			        data: JSON.stringify(params),
			        contentType: "application/json; charset=utf-8",
			        dataType: "json",
			        success: function (data, status, jqXHR) {

			            				console.log(data);
										// alert(JSON.stringify(data));

							            if (data["status"] == "success") {

											updateGrowl("Cash out of " + amount + " greenz initialized. Expected completion in 24hrs.");

							            } else if (data["status"] == "insufficient_funds") {

											updateGrowl("Insufficient funds. Load your wallet.", "ERROR");

							            } else if (data["status"] == "failure") {

											updateGrowl(data["status_message"], "ERROR");

							            } else if (data["status"] == "invalid_account") {

											updateGrowl("Invalid account", "ERROR");

										} else {

											updateGrowl("Failure to make payment. Contact customer support", "ERROR");

										}

										updateGrowl("Current wallet balance is " + data["meta"]["wallet_balance"] + " greenz (" +  convertToSecondaryCurrency(data["meta"]["wallet_balance"])  + ")");
										showBottomStatusBar("Balance: " + data["meta"]["wallet_balance"] + " greenz (" +  convertToSecondaryCurrency(data["meta"]["wallet_balance"])  + ")");

			        },

			        error: function (jqXHR, status) {

			            // alert(status);
			            // 
			            // alert('error');
			            // alert(JSON.stringify(jqXHR));
						updateGrowl("Please login before attempting a payment", "ERROR");

			            console.log(jqXHR);

			        }

			    });
			}
	}
	

	function helloMonkey() {
		
		$(document).trigger('coinbase_show_modal', "1b94b83dfeffabf81c59c369e06aeac7");
		
	}
	
