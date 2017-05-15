// Requires:
//   - evg-meta.js



// Imported from Clojure Schema



function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

//alert(query.foo);



function init() {
	
	updateLog('initializing...');

	$("#ajax-loader").show();
	$("#login-box").hide();

	setupUserInterface();
	currencyModuleInit();
	
	// EvergreenStorageGet([ "evg_auth_token", "evg_auth_token_age", "lastKnownWalletBalance", "lastKnownAccountBalance", "activeUserId", "wallet-uid", "evg_facebook_auth_token"], function(items) {
	
	EvergreenStorageGet([ "evg_auth_token", "lastKnownWalletBalance", "lastKnownAccountBalance", "activeUserId", "wallet-uid", "evg_facebook_auth_token"], function(items) {
			
		 	 updateLog(items);
			 wallet_uid = items["wallet-uid"];
			 evgAuthToken = items["evg_auth_token"];				
			 facebookAuthToken = items["evg_facebook_auth_token"];
			 activeUserId = items["activeUserId"];
 			 lastKnownWalletBalance = items["lastKnownWalletBalance"];
		     lastKnownAccountBalance = items["lastKnownAccountBalance"];

			// If params are passed over the web use these instead
			// Only case for this is
			
			if(evgEnvironment == EvgEnvironment.WEB) {
				 var params = getQueryParams(document.location.search);
				 if(params.facebookAuthToken)
					facebookAuthToken = params.facebookAuthToken;
				 // if(params.activeUserId)
				 // 					facebookAuthToken = params.facebookAuthToken;

			}

			 // var fbAuthTokenAge = items["evg_auth_token_age"];
			 // var evgAuthTokenAge = items["evg_auth_token_age"];
			// if(evgAuthTokenAge < Time.now + 30 days)
			// 	forceRegisterDevice;
			
			
			 $('#wallet-evergreen-balance').html(lastKnownWalletBalance);
		     $('#account-evergreen-balance').html(lastKnownAccountBalance);
			 updateRates(lastKnownWalletBalance, lastKnownAccountBalance);
			 updateLog("facebookAuthToken");
			 updateLog(facebookAuthToken);
			 updateLog("evgAuthToken");
			 updateLog(evgAuthToken);
			
			if (facebookAuthToken) {
				
	            var graphUrl = "https://graph.facebook.com/me?access_token=" + facebookAuthToken; // + "&callback=displayUser";
				
				updateLog(graphUrl);

				var params = { "access_token" : facebookAuthToken };
					    
					    jQuery.ajax({
					        type: "GET",
					        url: graphUrl,
					        data: "",
					        contentType: "application/json; charset=utf-8",
					        dataType: "json",
					        success: function (data, status, jqXHR) {
						
								updateLog(data);

								if(data["id"]) {
									
									activeUserName = data["name"];
									$('#name').val(data["name"]); 
									$('#username').val(data["email"]); 
									$('#username').attr("userId", data["id"]);
									$('#password').hide(); 
									
									registerDevice(data["id"], facebookAuthToken);			
								
								} else {
												
									updateStatus('No id in response. Unable to login.', EvgStatus.DEBUG);
								}

					        },
					        error: function (jqXHR, status) {
					            updateLog(jqXHR);
								updateStatus('Error on facebook login');
								return null;
					        }
    
					    });
					
	        } else if(evgAuthToken) {
		
				//Auto-login if authtoken is present
				//TODO: force refresh if > 30 days.
				
				loggedIn = true;
				pollingHalted = false;
				showBalanceAndTransactions();
				if(showTopVideos)
					loadTopVideos();

				updateStatus("Logged in as " + activeUserId);
				$('#logoutButton').show();
				
			} else {
				
				logout();
				
			}
	
		  });
	
		$("#loginForm").validate({
			
			  //Don't actually process submit, handle through other means 
			  submitHandler: function(form) {

			  }
		 });
		
	  if(evgEnvironment == EvgEnvironment.ONECLICKTIP)
	  {
		updateLog("ONECLICKTIP INIT")
		if(loggedIn) {
			//$( "#loginModal" ).dialog( "close" );
			
			showBottomStatusBar("Logged in as " + activeUserId);
		}
		else
			showBottomStatusBar("Please login");

	  } 
	  
    
}

function setupUserInterface() {
	
	if(!facebookLoginEnabled)
		$("#facebook-connect-link").hide(); 
	if (activeServerUrl == playServerUrl)
		$("#playMode").css("color","blue");
	else if (activeServerUrl == productionServerUrl)
		$("#productionMode").css("color","blue");
		
	if (evgDevMode)
		updateStatus('Running in Dev Mode', EvgStatus.DEBUG);
	
	
}

function updateScore() {

	var params = { 	"meta" : generateMeta() } ;
	
     jQuery.ajax({
         type: "POST",
         url: urlBase() + "score",
         data: JSON.stringify(params),
         contentType: "application/json; charset=utf-8",
         dataType: "json",
         success: function (data, status, jqXHR) {
	
			  updateLog(data);
			  if(data["meta"]["status"] == "authorized")
			  {
				
				var actionsPerLevel = 3;
				var score = parseInt(data["score"]["count"]);
				updateLog(score);
				updateLog((score / actionsPerLevel) + 1);
				updateLog(score % actionsPerLevel);
				updateLog((( score % actionsPerLevel ) / actionsPerLevel));


				var level = Math.floor((score / actionsPerLevel) + 1);
				
				if(!lastLevel)
					lastLevel = level;
					
				var status = (( score % actionsPerLevel ) / actionsPerLevel ) * 100;

				var actionsNeeded = (actionsPerLevel - ( score % actionsPerLevel ));

				switch(level)
				{
				case 2:
				  updatePopup('Impressed. You made it to level 2!');
				  break;
				case 3:
				  updatePopup('Level 3. That\'s Sick!');
				  break;
				case 5:
				  updatePopup('You are a tiger! Level 5!');
				  break;
				case 10:
				  updatePopup('You are a polar bear! Wow');
				  break;
				default:
				  updatePopup('Howdy');
				}
				
				
				if(level > lastLevel)  {
					
					updateStatus("Congrats. You've leveled up!",EvgStatus.GAMEHIGH);
					
				}
				else if (actionsNeeded == 1) {
					
					updateStatus("Only " + actionsNeeded + " more action needed for next level",EvgStatus.GAME);
				
				} else {
					
					updateStatus("Only " + actionsNeeded + " more actions needed for next level",EvgStatus.GAME);
					
				}
				
				
				lastLevel = level;	

				$('#currentLevel').html('Level ' + level);
				updateLevelProgress(status);
								
			  } 
			  else {
				
				updateStatus('Unable to retrieve score.');
				
			  }

			  updateLog(data);
         },

         error: function (jqXHR, status) {            

			updateStatus('Error in score retrieval');
			updateLog(jqXHR);
         }

     });


}


function updateLevelProgress(currentLevelProgress) {

    $( "#levelProgress" ).progressbar({
      value: currentLevelProgress
    });	

}

function logout() {
	
	loggedIn = false;
	pollingHalted = true;
	evgAuthToken = "";
	metaEvgAuthToken = "";
	facebookAuthToken = "";
			
	EvergreenStorageSet({"evg_auth_token" : "", "evg_facebook_auth_token" : "", "lastKnownWalletBalance" : lastKnownWalletBalance, "lastKnownAccountBalance" : lastKnownAccountBalance}, function() {
		
		    updateLog('AuthTokens thrown away');
	});
	
	$("#ajax-loader").hide();
	$('#login-box').show();
	$('#footer').hide();
	$('#balance-box').hide();
	$('#info-bar').hide();
	$('#payment-box').hide();
	$('#account-box').hide();
	$('#video-box').hide();
	$('#username').show();
	$('#password').show(); 
	$('#loginButtons').show(); 
	$('#registerButtons').hide(); 
	$('#logoutButton').hide(); 
	$('#name').hide(); 
	$('#pin').hide(); 
	$("#store-wrapper" ).hide();
	updateStatus('Successfully logged out.');
	$("#transaction-box").hide();
	$("#message-box").hide();
	
	
}

function postLoginInit(data) {
     
		
	  $("#ajax-loader").show();
	  pollingHalted = false;
	  evgAuthToken = data["evg_auth_token"];
	  lastKnownWalletBalance = data["meta"]["wallet_balance"];
	  lastKnownAccountBalance = data["meta"]["account_balance"];
	  updateLog(lastKnownAccountBalance);
	  updateLog(lastKnownWalletBalance);
	  $('#logoutButton').show();
	
	  //var evg_auth_token_age = Time.now(); 
	  //EvergreenStorageSet({"evg_auth_token": evgAuthToken, "evg_auth_token_age" : evg_auth_token_age,  "lastKnownWalletBalance" : lastKnownWalletBalance, "lastKnownAccountBalance" : lastKnownAccountBalance  }, function() {
	
	  EvergreenStorageSet({"evg_auth_token": evgAuthToken, "lastKnownWalletBalance" : lastKnownWalletBalance, "lastKnownAccountBalance" : lastKnownAccountBalance  }, function() {
		
		    // Notify that we saved.
		    updateLog('Settings saved');
		  });

      showBalanceAndTransactions();

	  if(evgEnvironment == EvgEnvironment.ONECLICKTIP)
	  {
		updateLog("ONECLICKTIP POSTLOGININIT")
		if(loggedIn) {
			$( "#loginModal" ).dialog( "close" );
			showBottomStatusBar("Logged in as " + activeUserId);
		}
		else
			showBottomStatusBar("Please login");

	  } 





	
}

function updateBalance(data) {
	
	  lastKnownWalletBalance = data["meta"]["wallet_balance"];
	  lastKnownAccountBalance = data["meta"]["account_balance"];
      $('#wallet-evergreen-balance').html(lastKnownWalletBalance);
      $('#account-evergreen-balance').html(lastKnownAccountBalance);
	  updateRates(lastKnownWalletBalance, lastKnownAccountBalance);
	  if(evgEnvironment == EvgEnvironment.ONECLICKTIP && lastKnownWalletBalance > 0)
	  {
		updateGrowl("Current wallet balance " + lastKnownWalletBalance + " greenz (" +  convertToSecondaryCurrency(lastKnownWalletBalance)  + ")") ;
	  }
	  
	
}

function showBalanceAndTransactions() {

	$('#loginButton').show();
	$('#login-box').hide();	
	$('#footer').show();
	$('#balance-box').show();
		
	$('#payment-box').show();
    $('#evergreen-balance').html(lastKnownWalletBalance);
	getExchangeRates();
	currentTransactionItemsToShow = 3;
	transactionList();	
	if(showMessages)
		messageList(3);
	if(evgGameMode) {
		$('#info-bar').show();
		updateScore();
	}
	$("#ajax-loader").hide();
	
}



	document.addEventListener('DOMContentLoaded', function () {

	   if(evgEnvironment == EvgEnvironment.ONECLICKTIP)
	   {
			$('<style>').html(grzCSS).appendTo('body');

			$('<div>').css("display","none").html(grzTipTemplate).appendTo('body');
	   }
	
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

			  $('#video-box').hide();
			  $(this).toggleClass("active");
			  $( "#switch-store-box" ).toggle();
			  $( "#store-item-add-box" ).toggle();
			  $( "#store-box" ).toggle();
	   	 	  $( "#store-wrapper" ).toggle();
			  if( $( "#store-wrapper" ).is(':visible') ) {
					
				  loadStoreItems();
			      loadSuggestedStores();
			      $(  "#account-box" ).hide();
			   }
	
			} else {
				updateStatus("Please login first.", EvgStatus.MEDIUMHIGH);
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
			
			currentTransactionItemsToShow = 20;
			transactionList();
			$( '#all-transactions').hide();
			$( '#recent-transactions').show();
		
		});

		$( '#recent-transactions').click(function() {
			
			currentTransactionItemsToShow = 3;
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
		  //$( "#c" ).hide();
		
		});

		$( "#payee" ).keypress( function() {
			
			if(!validateEmail($("#payee").val()))
			{
				if ($("#payee").attr("userId"))
					$( "#paymentButton").html("Send");
				else	
					$( "#paymentButton").html("Search");
				
				if($("#payee").val().length > 2)
					searchUsers();
		      	
			} else {
				
				$( "#paymentButton").html("Send");
				
			}
	
		});
		
		$( "#regionalCurrencyCashOutAmount" ).keyup(function() {
			
			var currVal = $( this ).val(); 
			if(currVal.length > 0 && isNaN(currVal[0]) )
				currVal = currVal.substring(1,currVal.length);
			var grzAmount = parseFloat(currVal) / secondaryCurrencyRate;
			$("#cashOutAmount").val(grzAmount.toFixed(0));
			$( this ).val( secondaryCurrencySymbol + currVal );
			
	
		});
	
		$( "#cashOutAmount" ).keyup(function() {
			
			var regionalCurrencyPurchaseAmount = ( $( this ).val() *  secondaryCurrencyRate ) ;
			if(regionalCurrencyPurchaseAmount > 0.01)
				$("#regionalCurrencyCashOutAmount").val(secondaryCurrencySymbol +  regionalCurrencyPurchaseAmount.toFixed(2) ) ;
			else
				$("#regionalCurrencyCashOutAmount").val(secondaryCurrencySymbol +  regionalCurrencyPurchaseAmount.toFixed(3) ) ;
	
		});
	
		$( "#cashOutbutton" ).click(function() {

			updateLog( $( "#cashOutAmount" ).val() );
			initializeCashOut($( "#cashOutAmount" ).val());
			if(evgEnvironment == EvgEnvironment.ONECLICKTIP)
		    {
				$('#cashOutModal').dialog( "close" );
		    } 
			$( "#cashOutAmount" ).val('');
			$("#regionalCurrencyCashOutAmount").val('');
			
			
		});
		

		$( "#regionalCurrencyPurchaseAmount" ).keyup(function() {
			
			var currVal = $( this ).val(); 
			if(currVal.length > 0 && isNaN(currVal[0]) )
				currVal = currVal.substring(1,currVal.length);
			var grzAmount = parseFloat(currVal) / secondaryCurrencyRate;
			$("#purchaseAmount").val(grzAmount.toFixed(0));
			$( this ).val( secondaryCurrencySymbol + currVal );
			
	
		});

		$( "#purchaseAmount" ).keyup(function() {
			
			var regionalCurrencyPurchaseAmount = ( $( this ).val() *  secondaryCurrencyRate ) + 0.01 ;
			$("#regionalCurrencyPurchaseAmount").val(secondaryCurrencySymbol +  regionalCurrencyPurchaseAmount.toFixed(2) ) ;
	
		});

		$( "#purchaseCreditsButton" ).click(function() {

			updateLog( $( "#purchaseAmount" ).val() );
			loadCoinbaseButton($( "#purchaseAmount" ).val(), $("#regionalCurrencyPurchaseAmount").val());
			// loadCoinbaseButtonWhileBroken($( "#purchaseAmount" ).val(), $("#regionalCurrencyPurchaseAmount").val());
			if(evgEnvironment == EvgEnvironment.ONECLICKTIP)
		    {
				$('#orderModal').dialog( "close" );
		    } 
		    $( "#purchaseAmount" ).val('');
		    $( "#regionalCurrencyPurchaseAmount" ).val('');
		
			
		});
		
		$( "#edit-transactions" ).click(function() {

			$( "#edit-transactions" ).hide();
			populateStoreItems(activeStoreItems,activeUserId,true);
			$( "#view-transactions" ).show();
			
		});

		$( "#view-transactions" ).click(function() {
			
			$( "#edit-transactions" ).show();
			populateStoreItems(activeStoreItems,activeUserId,false);
			$( "#view-transactions" ).hide();
			
		});

		$( "#paymentButton" ).click(function() {
			
	      	if(($("#payee").attr("userId") && $("#payee").attr("userId").indexOf(":") != -1) || validateEmail($("#payee").val()))
				makePayment();
			else
				searchUsers();
	
		});

		$( "#facebook-connect-link" ).bind( "click", function() {
			
	      	if(evgEnvironment == EvgEnvironment.CHROME)
				chrome.tabs.create({url:"https://www.facebook.com/dialog/oauth?client_id=349260755195287&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=user_about_me&display=popup&response_type=token"});
			
		});
		
		
		$( "#currency-selector" ).click( function() {

   	 	    $( "#currency-selector-box" ).toggle();

		});
		
		$( ".ico-user" ).click( function() {
			
			
			if(loggedIn)
			{
				$('#video-box').hide();
			    $(this).toggleClass("active");
				if(showWallet) {
					loadWallets();				
				}
				$( "#loadWalletsButton" ).toggle();
	   	 	    $( "#closeWalletsButton" ).toggle();
	   	 	    $( "#account-box" ).toggle();
				if( $( "#account-box" ).is(':visible') )
						$( "#store-wrapper" ).hide();
	
			} else {
				updateStatus("Please login first.", EvgStatus.MEDIUMHIGH);
			}



		});
	
		$( "#withdrawalButton" ).click( function() {

			processWithdrawal();
			
		  if(evgEnvironment == EvgEnvironment.ONECLICKTIP)
		  {
			// alert("oneclick");
			$('#withdrawModal').dialog( "close" );
		  } 
		  

		});

		$( "#helloMonkey" ).click( function() {

			helloMonkey();

		});

		$( "#playMode" ).click( function() {

			activeServerUrl = playServerUrl;
			$( this ).css("color", "blue");
			$( "#productionMode" ).css("color", "grey");
			
			logout();

		});

		$( "#productionMode" ).click( function() {
			
			$( this ).css("color", "blue");
			$( "#playMode" ).css("color", "grey");
			activeServerUrl = productionServerUrl;
			logout();

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
		  // alert( "User clicked on 'fbLogin.'" );
		});
		
		$(document).on('coinbase_payment_complete', function(event, code){
	      updateLog("Payment completed for button "+code);
		  paymentConfirmed = false;
		  coinbaseConfirmationPoller();
	      //window.location = "/confirmation.html";
	    });
	    
			
	    init();
	
	
	});

//Validation, should be broken out

	function validateEmail(email) { 
	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	} 

