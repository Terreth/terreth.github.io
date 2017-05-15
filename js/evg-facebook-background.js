var successURL = 'https://www.facebook.com/connect/login_success.html';

// standard format: 
// https://www.facebook.com/connect/login_success.html#access_token=CAA ... gIZD&expires_in=7179


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {


	if (tab.url.indexOf(successURL) == 0) {

        var params = tab.url.split('#')[1];
        var tokenParams = params.split('&')[0];
        var token = tokenParams.split('=')[1];
		// alert(token);
		
		EvergreenStorageSet({"evg_facebook_auth_token": token}, function() {
		
			// alert("saved");
			// console.log("saved");
			
			chrome.tabs.remove(tabId);
			// Sadly can't programatically open chrome extension 
			chrome.tabs.create({url : "../evg-wallet.html"}); 
			
		});
		
        //chrome.tabs.onCreated.removeListener(onFacebookLogin);
        return;
    }

});
