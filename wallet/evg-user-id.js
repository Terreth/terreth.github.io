function formatUserId(unformattedID) {

	if (unformattedID.indexOf('email:') == 0) {

	    return unformattedID;
    
	} else if (unformattedID.indexOf('facebook:') == 0) {

	    return unformattedID;

	} else if (unformattedID.indexOf('@') != -1) {

	    return "email:" + unformattedID;

	}
	 else {
	    
	    jQuery.ajax({
	        type: "GET",
	        url: "http://graph.facebook.com/" + unformattedID,
	        data: "",
	        contentType: "application/json; charset=utf-8",
	        dataType: "json",
	        success: function (data, status, jqXHR) {
    	
	            // alert(data["id"]);

				if(data["id"]) {
				
	                var formattedId = "fb:" + data["id"];
	                return formattedId;

				} else {
				
					alert('no id found. not proceeding with payment');
				}

	        },
	        error: function (jqXHR, status) {
	            console.log(jqXHR);
				alert('no id found. not proceeding with payment');
				return null;
	        }
    
	    });

	}
	
}
