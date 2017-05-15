// var metaEvgAuthToken;
// wallet_uid

function urlBase() {
	
	// return "http://play.evr.gr/rest/v01/";
	 return activeServerUrl;
	
}



function getWalletUID() {
	
	// alert("start:" + wallet_uid);
	
	if(wallet_uid)
	 	return wallet_uid;		
			
	wallet_uid = walletPrefix + genUid();
	EvergreenStorageSet({"wallet-uid" : wallet_uid});
	// alert("newly generated:" + wallet_uid);
	// alert("finish " + wallet_uid);

	return wallet_uid;
	
}



function genUid(separator) {
    /// <summary>
    ///    Creates a unique id for identification purposes, in this case requests.
    /// </summary>
    /// <param name="separator" type="String" optional="true">
    /// The optional separator for grouping the generated segmants: default "-".    
    /// </param>

    var delim = separator || "-";

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
};

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


function initMeta() {
	
	// alert("initMeta");
	updateLog("initMeta");
	
	if(!evgAuthToken || !wallet_uid)
	{
		// alert("initMetaSuccss");

		EvergreenStorageGet([ "evg_auth_token",  "wallet-uid", "evg_facebook_auth_token" ], function(items) {
		
				// alert("initMetaInner");
				evgAuthToken = items["evg_auth_token"];
				updateLog("evgAuthToken:" + evgAuthToken);
				wallet_uid = items["wallet-uid"];
				facebookAuthToken = items["evg_facebook_auth_token"];
			 
		});
	}
	
	// alert("finishInitMeta");
	
}



