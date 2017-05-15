
function outboundRequest(endpoint, params, success, failure, count, jqXHR, status) {
		
		
		if(!count)
			count = 1;
		
		console.log('try ' + count);
			
	    if(count == 3) {
			console.log('tried three times. failure.');
			failure.call(jqXHR, status);
		}
		else {
			
			count++;
			
			jQuery.ajax({
			    type: "POST",
			    url: urlBase() + endpoint,
			    data: JSON.stringify(params),
			    contentType: "application/json; charset=utf-8",
			    dataType: "json",
			    success: function(data, status, jqXHR) {
					console.log("success");
				
					if(data["meta"]["status"] == "authorized")
					{
						console.log("authorized");
						success.call(data, status, jqXHR);
					}
					else
						failure.call(jqXHR, status);
				
				},
			    error: function(jqXHR, status) {
					outboundRequest(endpoint, params, success, failure, count, jqXHR, status)
				}
			});
			
		}

}