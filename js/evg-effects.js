
function statusflash(element)  {

	return element.fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
	
}

function updateLog(message) {
	if(evgDevMode)
		console.log(message);
}

function showBottomStatusBar(message,timeout,add)
{        
    if (typeof _statusbar == "undefined")
    {
       // ** Create a new statusbar instance as a global object
        _statusbar = 
            $("<div id='_statusbar' class='bottom-status-bar'></div>")
                    .appendTo(document.body)                   
                    .show();
    }
 
    if (add)              
       // *** add before the first item    
        _statusbar.prepend( "<div style='margin-bottom: 2px;' >" + message + "</div>")[0].focus();
    else if (loggedIn)
	{
	    //_statusbar.html(message + "<span class='loginout'>Balance :&nbsp;" +lastKnownWalletBalance + "&nbsp;|&nbsp;<span id='evg_withdraw'>Withdraw</span>&nbsp;|&nbsp;<span id='evg_logout'>Logout</span></span>");
		_statusbar.html(message + "<span class='loginout'><span id='evg_order'>Load</span>&nbsp;|&nbsp;<span id='evg_withdraw'>Withdraw</span>&nbsp;|&nbsp;<span id='evg_cash_out'>Cash Out</span>&nbsp;|&nbsp;<span id='evg_logout'>Logout</span></span>");
		
		$("#evg_logout").click(function() {			

				logout();
				_statusbar.html("Please login to use greenz" + "<span class='loginout'><span id='evg_login'>Login</span></span>");
		    	$("#evg_login").click(function() {

					$( "#loginModal" ).dialog({ width: 500, title: "Login"  });
					$( "#loginModal" ).show();
					
				});

		});
		
    	$("#evg_withdraw").click(function() {

			$( "#withdrawModal" ).dialog({ width: 450, title: "Withdraw"  });
			
		});


    	$("#evg_order").click(function() {

			$( "#orderModal" ).dialog({ width: 450, title: "Load"  });
			
		});

    	$("#evg_cash_out").click(function() {

			$( "#cashOutModal" ).dialog({ width: 450, title: "Cash out"  });
			
		});

		    
	} else {
		
    	_statusbar.html(message + "<span id='evg_login' class='loginout'>Login</span>");
		$("#evg_login").click(function() {

			$( "#loginModal" ).dialog({ width: 450 });
			$( "#loginModal" ).show();
	  
		});
	
	}

 
    _statusbar.show();        
 
    if (timeout)
    {
        _statusbar.addClass("bottom-status-bar-highlight");
        setTimeout( function() { _statusbar.removeClass("bottom-status-bar-highlight"); },timeout);
    }                
}

function updateStatus(message, priority) {
	
	updateLog("updating status");
	
	updateLog(message);
	
	if(!priority)
		priority = EvgStatus.NORMAL;

	updateLog(priority);

	if(evgEnvironment == EvgEnvironment.ONECLICKTIP)
	{
		//if(priority > EvgStatus.DEBUG)
		showBottomStatusBar(message);
		
	} 
	else {
		

		    $('#statusFooter').show();

			if(evgDevMode)
				$('#devFooter').show();

			switch(priority) {
			    case EvgStatus.NORMAL: {

			        $('#status').html(message);
					$('#status').removeClass('error').addClass('success');

			        break;
			    }
			    case EvgStatus.DEBUG: {

			        $('#secondaryStatus').html(message);
			        break;
			    }
			    case EvgStatus.MEDIUMHIGH: {

				 	$('#status').html(message);
					$('#status').removeClass('success').addClass('error');
					statusflash($('#status'));
			        break;
			    }
			    case EvgStatus.HIGH: {

				 	$('#status').html(message);
					$('#status').removeClass('success').addClass('error');
					statusflash($('#status'));
			        break;
			    }
			    case EvgStatus.GAME: {

				 	$('#gameStatus').html(message);
			        break;
			    }
			    case EvgStatus.GAMEHIGH: {

				 	$('#gameStatus').html(message);
					statusflash($('#gameStatus'));
			        break;
			    }


			    default: {


			    }
			}
		
	}


	
}

function updatePopup(message) {

 	$('#popup').html(message);

}



$(function () {
  $('.bubbleInfo').each(function () {
	
    // options
    var distance = 10;
    var time = 250;
    var hideDelay = 500;

    var hideDelayTimer = null;

    // tracker
    var beingShown = false;
    var shown = false;
    
    var trigger = $('.trigger', this);
    var popup = $('.popup', this).css('opacity', 0);

    // set the mouseover and mouseout on both element
    $([trigger.get(0), popup.get(0)]).mouseover(function () {
      // stops the hide event if we move from the trigger to the popup element
      if (hideDelayTimer) clearTimeout(hideDelayTimer);

      // don't trigger the animation again if we're being shown, or already visible
      if (beingShown || shown) {
        return;
      } else {
        beingShown = true;

        // reset position of popup box
        popup.css({
          top: 30,
          left: 50,
          display: 'block' // brings the popup back in to view
        })

        // (we're using chaining on the popup) now animate it's opacity and position
        .animate({
          top: '-=' + distance + 'px',
          opacity: 1
        }, time, 'swing', function() {
          // once the animation is complete, set the tracker variables
          beingShown = false;
          shown = true;
        });
      }
    }).mouseout(function () {
      // reset the timer if we get fired again - avoids double animations
      if (hideDelayTimer) clearTimeout(hideDelayTimer);
      
      // store the timer so that it can be cleared in the mouseover if required
      hideDelayTimer = setTimeout(function () {
        hideDelayTimer = null;
        popup.animate({
          top: '-=' + distance + 'px',
          opacity: 0
        }, time, 'swing', function () {
          // once the animate is complete, set the tracker variables
          shown = false;
          // hide the popup entirely after the effect (opacity alone doesn't do the job)
          popup.css('display', 'none');
        });
      }, hideDelay);
    });
  });
});
