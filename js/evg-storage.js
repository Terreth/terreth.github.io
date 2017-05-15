function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}


// interface Storage {
//   getter any getItem(in DOMString key);
//   setter creator void setItem(in DOMString key, in any data);
// };


function EvergreenStorageGet(keys, passedFunction) {

	var is_chrome = /chrome/i.test( navigator.userAgent );
	
	if(is_chrome && chrome && chrome.storage)
	{

	
		return chrome.storage.sync.get(keys, passedFunction);
		
	 } else if (supports_html5_storage) {
		
		// updateLog("getting...");
		
		var data = { };
		if(Object.prototype.toString.call( keys ) === '[object Array]')
		{
			
			for(var i = 0; i < keys.length; i++) {
				
				// updateLog(keys[i]);
				// updateLog(localStorage.getItem(keys[i]));
				data[keys[i]] = localStorage.getItem(keys[i]);
				
			}
			// updateLog("found data");
			// 
			// updateLog(data);
			// //There must be a better way of doing this
			if(passedFunction(data) != null)
				return data;
			else
				return data;
		} else {

			data = localStorage.getItem(keys.hash);
			if(passedFunction(data) != null)
				return data;
			else
				return data;


		}
		
	 }
		
}

function EvergreenStorageSet(data, passedFunction) {

    // var chrome = false;
    // updateLog("setting");
    // alert("setting");

	var is_chrome = /chrome/i.test( navigator.userAgent );

	if(is_chrome && chrome && chrome.storage)
	 {
		// updateLog("chrome");
	    
		return chrome.storage.sync.set(data, passedFunction);
		
	 } else if (supports_html5_storage) {
		
		updateLog("html5storage");
		
		// updateLog("setting.");
		var keys = Object.keys(data);
		 
		if(Object.prototype.toString.call( keys ) === '[object Array]')
		{
			for(var i = 0; i < keys.length; i++) {
				// updateLog(keys[i]);
				// updateLog(data[keys[i]]);

				localStorage.setItem(keys[i],data[keys[i]]);
				
			}
			
				
		} else {
			
			localStorage.setItem(data.hash,data.value);
			
			
		}
		if(passedFunction)
			passedFunction(data);
		
	
  	}
		
}

