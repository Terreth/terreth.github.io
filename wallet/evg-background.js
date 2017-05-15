

// alert('listening');

// needs to be persisted to local storage
var promptedForApproval = false;


function onRequest(request, sender, sendResponse) {
	
    // alert('req received');
    // alert('id is ' + request.user_id);
 

	if(!promptedForApproval && request.user_id && request) {
		
		var myMessage = "Would you like to approve a payment of " + request.amount + " to " + request.user_id + "?";
		
	 			if (confirm(myMessage)) {
			
			processPayment(request);
			
			//display popup in lower right corner
			
		} else {
			
			
	
		}
		promptedForApproval = true;
				
	}

    console.log(request);
    console.log('request received');


    // Return nothing to let the connection be cleaned up.
    sendResponse({});
};



function processPayment(request) {
	
	if (request.user_id.indexOf('email:') == 0) {

        makePayment(request.user_id);
        
    } else if (request.user_id.indexOf('fb:') == 0) {

        makePayment(request.user_id);

    } else if (request.user_id.indexOf('@') != -1) {
	
	    makePayment("unformattedID" + request.user_id);
    
	}
     else {
		    
        jQuery.ajax({
            type: "GET",
            url: "http://graph.facebook.com/" + request.user_id,
            data: "",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data, status, jqXHR) {
        	
                // alert(data["id"]);

				if(data["id"]) {
					
	                var formattedId = "fb:" + data["id"];
	                makePayment(formattedId);
	
				} else {
					
					alert('no id found. not proceeding with payment');
				}

            },
            error: function (jqXHR, status) {
                console.log(jqXHR);
				alert('no id found. not proceeding with payment');
            }
        
        });

    }
    
	
}

function makePayment(formattedUserId) {
	
	
	//Make automatic micropayment	
	
    //  "/make_payment"
    //  { "meta" request-meta
    //    "transaction_id" (sch/optional string?)
    //    "amount" amount
    //    "payee" user-id
    //    "request_description" (sch/optional string?)
    //      "item_ids" (sch/optional (sch/coll-of string?))}
    
    var params = {
        "meta": generateMetaMeta(),
        "amount": "1",
        "payee": formattedUserId,
        "request_description": "microtip"
    };

    console.log(params);

	jQuery.ajax({
	        type: "POST",
	        url: urlBase() + "make_payment",
	        data: JSON.stringify(params),
	        contentType: "application/json; charset=utf-8",
	        dataType: "json",
	        success: function (data, status, jqXHR) {
	
	            console.log(data);
	
	            if (data["status"] == "success") {
	
	                alert('Payment of 1 Evergreen successfully completed');
	
	            } else if (data["status"] == "insufficient_funds") {
	
	                alert('Insufficient funds');
	
	            } else if (data["status"] == "failure") {
	
	                alert('failed');
	                alert(data["status_message"]);
	
	            } else if (data["status"] == "invalid_account") {
	
				alert('This user does not yet have an Evergreen account. Sorry.');
	                
			} else {
				
				alert('failed in some unknown way');
	            
			}
	    
	
	        },
	
	        error: function (jqXHR, status) {
	
	            alert('error');
	            console.log(jqXHR);
	
	        }
	
	    });
    
}


// Listen for the content script to send a message to the background page.
chrome.extension.onRequest.addListener(onRequest);