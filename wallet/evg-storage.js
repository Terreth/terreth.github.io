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

	if(chrome && chrome.storage)
	 {
	
		return chrome.storage.sync.get(keys, passedFunction);
		
	 } else if (supports_html5_storage) {
	
		//return localStorage.getItem(keys);
		
	 }
		
}

function EvergreenStorageSet(keys, passedFunction) {

	if(chrome && chrome.storage)
	 {
	
		return chrome.storage.sync.set(keys, passedFunction);
		
	 } else {
	
		//return localStorage.setItem(keys);
	
  	}
		
}