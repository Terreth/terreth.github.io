
// 
//    ;; Items
//     "/items"
//     (sch/either
//       {"meta" request-meta
//        "payee" user-id
//        "items" sch/nothing}
//       {"meta" request-meta
//        "payee" sch/nothing
//        "items" (sch/optional 
//                  (sch/coll-of 
//                    (sch/either
//                      {"id" (sch/optional string?)
//                       "description" string?
//                       "amount" amount}
//                      {"id" string?
//                       "deleted" #"true"})))})})

	
    function loadStoreItemsByIndex(index) {
	
	
		loadStoreItems(suggestedStores[index - 1]["user_id"]);
		$( "#storeTitle" ).html(suggestedStores[index - 1]["name"] + " store");
		
		
	}
	
    function loadStoreItems(payee) {
	
		var params = { "meta" : generateMeta() } ;
		var myStore = false;
		
		if(payee) {
			payee = formatUserId(payee);
			params["payee"] = payee;
			$( "#store-item-add-box" ).hide();
			
		} else {
			// It's my store!
			var myStore = true;
			payee = formatUserId(activeUserId);
		    $( "#store-item-add-box" ).show();
		    $( "#edit-transactions" ).show();
		    $( "#storeTitle" ).html('My items');

		}
  
		 jQuery.ajax({
		     type: "POST",
		     url: urlBase() + "items",
		     data: JSON.stringify(params),
		     contentType: "application/json; charset=utf-8",
		     dataType: "json",
		     success: function (data, status, jqXHR) {

				  updateLog(data);
				  activeStoreItems = data["items"];
				  populateStoreItems(activeStoreItems, payee);			

		     },
		     error: function (jqXHR, status) {            

				updateStatus('Error in in transaction list retrieval');
				updateLog(jqXHR);
		     }

		 });
	
	
    }

function populateStoreItems(items, payee, editMode) {
	
	  $("#store-item-list").html("");
	  $("#store-box").show();
	  if(items) {

		  for(var i = 0; i < items.length; i++)
		  {
				if(!editMode) {
					 var tempPayee = payee;
				
					 if(items[i]["user_id"])
						tempPayee = items[i]["user_id"];
									
					 if(items[i]["video_url"]) {
				
					  		$("#store-item-list").append("<li class=\"store-item\" id=\"si" + items[i]["id"] + "\" itemId=\"" + items[i]["id"] + "\"  payee=\"" + tempPayee + "\" amount=\"" + items[i]["amount"]  + "\" videoUrl=\""+ items[i]["video_url"] + "\" description=\"" +  items[i]["description"] + " x 1\">"  + items[i]["description"] + " <strong>" + items[i]["amount"] + "</strong><img src=\"img/video-play-3-24-green.png\"/></li>");	
			 
					 } else if (items[i]["image_url"]) {
				
							$("#store-item-list").append("<li class=\"store-item\" id=\"si" + items[i]["id"] + "\" itemId=\"" + items[i]["id"] + "\"  payee=\"" + tempPayee + "\" amount=\"" + items[i]["amount"]  + "\" imageUrl=\""+ items[i]["image_url"] + "\" description=\"" +  items[i]["description"] + " x 1\">"  + items[i]["description"] + " <strong>" + items[i]["amount"] + "</strong><img class=\"store-item-img\" src=\"img/video-play-3-24-green.png\"/></li>");	

					 } else
					 	$("#store-item-list").append("<li class=\"store-item\" id=\"si" + items[i]["id"] + "\" itemId=\"" + items[i]["id"] + "\"  payee=\"" + tempPayee + "\" amount=\"" + items[i]["amount"]  + "\" description=\"" +  items[i]["description"] + " x 1\">"  + items[i]["description"] + " <strong>" + items[i]["amount"] + "</strong><a>buy</a></li>");	
		  		
					$( "#si" + items[i]["id"] ).bind( "click", function() {

						buyItem( $(this).attr("payee"), $(this).attr("amount"), $(this).attr("itemId"), $(this).attr("description"), $(this).attr("videoUrl"), $(this).attr("imageUrl")  );
				
					});
				} else {
					
				 	$("#store-item-list").append("<li class=\"store-item\" id=\"si" + items[i]["id"] + "\" itemId=\"" + items[i]["id"] + "\"  payee=\"" + tempPayee + "\" amount=\"" + items[i]["amount"]  + "\" description=\"" +  items[i]["description"] + " x 1\">"  + items[i]["description"] + " <strong>" + items[i]["amount"] + "</strong><a>delete</a></li>");	
			  		$( "#si" + items[i]["id"] ).bind( "click", function() {

						deleteItem( $(this).attr("itemId") );
				
					});
					
					
				}
				
			}
		  
		
		}
	
}
	
function addStoreItem() {

	
	var params = { "meta" : generateMeta(),
				    "items" : [{	    
				    	    "description" : $('#new-item-description').val(),
				   	        "amount" : $('#new-item-amount').val()
					           }]
				 };
				
    var url = $('#new-item-url').val();
	if(url) {
		
	    if(url.indexOf('youtube') != -1  || url.indexOf('vimeo') != -1 ) {
			params["items"][0]["video_url"] = url;
			// params["image_url"] = "dummy";
			// params["long_description"] = "dummy";
		}	
	    else if(url.indexOf('.png') != -1  || url.indexOf('.jpg') != -1 || url.indexOf('.gif') != -1 ) {
			params["items"][0]["image_url"] = url;
			// params["long_description"] = " ";
			// params["video_url"] = " ";
			}
	    else 
	{
			params["items"][0]["long_description"] = url;
			// params["image_url"] = " ";
			// params["video_url"] = " ";
			
			}
	}
	
	 updateLog("params");
	 updateLog(params);
	
	 jQuery.ajax({
	     type: "POST",
	     url: urlBase() + "items",
	     data: JSON.stringify(params),
	     contentType: "application/json; charset=utf-8",
	     dataType: "json",
	     success: function (data, status, jqXHR) {

			  updateLog(data);
			  var items = data["items"];
			  populateItems(items);
			
			  updateStatus('Item successfully added');


	     },
	     error: function (jqXHR, status) {            

			updateStatus('Error in item add');
			updateLog(jqXHR);
	     }

	 });


}
