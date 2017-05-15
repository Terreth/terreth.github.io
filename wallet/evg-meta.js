var metaEvgAuthToken;

function urlBase() {
	
	return "http://play.evr.gr/rest/v01/";
	
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

//Deprecated
// function initMeta() {
// 	
// 	EvergreenStorageGet([ "evg_auth_token" ], function(items) {
// 	
// 			 metaEvgAuthToken = items["evg_auth_token"];
// 			
// 	});
// 	
// }
// 
// function generateMetaMeta() {
// 	
//    var newMeta =  { "uuid" : "chrome-wallet-test0r",
// 			        "platform" : "chrome-extension",
// 			        "request_id" : genUid() 
// 		  };
// 	
// 	if(metaEvgAuthToken)
// 		newMeta["evg_auth_token"] = metaEvgAuthToken;
// 	else
// 		alert('you must login to use this');
// 	
// 	return newMeta;
// 		
// 	
// }

