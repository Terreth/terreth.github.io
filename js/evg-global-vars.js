// Login/Auth

	var evgAuthToken;
	var facebookAuthToken;
	var activeUserId;
	var activeUserName;
	var lastKnownWalletBalance;
	var lastKnownAccountBalance;
	var wallet_uid;
	var productionServerUrl = "https://eu.evr.gr/rest/v01/";
	var playServerUrl = "http://play.evr.gr/rest/v01/";
	var loggedIn;


// Currency

	var exchangeRates;
	var secondaryCurrencySymbol;
	var secondaryCurrencyRate;
	var secondaryCurrencyCode;	

// Stores
	
	var suggestedStores;
	var suggestedStoreIndex;
	var activeStoreItems;

// Game

	var currentLevelProgress;
	var lastLevel;

// Transactions

	var pollingHalted;
	var currentTransactionItemsToShow;
	var paymentSound = new Audio('audio/dripdrop.mp3');
	var coinbaseButtonShown = false;
	var paymentConfirmed = false;

// Env specific
		
  	//Defaults

		var loggedIn = false;
		var activeServerUrl = playServerUrl;
		var evgDevMode = false;
		var evgGameMode = true;
		var facebookLoginEnabled = true;

	// Prefix used when wallet is created
		var walletPrefix = "evergreen-wallet-";
		var statusArea = $( '#status' );
		var secondaryStatusArea = $( '#status' );
		var showWallet = false;
		var showMessages = false;
	// Show videos as items in url
		var showVideos = false;
		var showImages = false;
		var showTopVideos = false;

	// NYI
	// Embed facebook like widget in web wallet
	//	var facebookLikeEmbed = true;


	if(evgEnvironment == EvgEnvironment.CHROME)
	{

		walletPrefix = "chrome-wallet-";
		activeServerUrl = playServerUrl;
		evgDevMode = false;
		evgGameMode = true;
		facebookLoginEnabled = true;
		showWallet = false;
		showMessages = false;
		showVideos = true;
		showTopVideos = true;
		
	
	} else if (evgEnvironment == EvgEnvironment.WEB) {
	
	    walletPrefix = 'web-wallet-';
		activeServerUrl = productionServerUrl;
		evgDevMode = false;
		facebookLoginEnabled = false;
		evgGameMode = false;
		showWallet = false;
		showMessages = false;
		showVideos = true;
		showTopVideos = true;
		
	
	} else if (evgEnvironment == EvgEnvironment.WIDGET) {

	    walletPrefix = 'web-widget-';
		activeServerUrl = productionServerUrl;
		evgDevMode = false;
		evgGameMode = false;
		facebookLoginEnabled = false;
		showWallet = false;
		showMessages = false;
		showVideos = false;
		showTopVideos = false;
		

	} else if (evgEnvironment == EvgEnvironment.VIEWER) {

	    walletPrefix = 'web-viewer-';
		activeServerUrl = productionServerUrl;
		evgDevMode = false;
		evgGameMode = false;
		facebookLoginEnabled = true;
		showWallet = false;
		showMessages = false;
		showImages = true;
		showTopVideos = false;
		

	} else if (evgEnvironment == EvgEnvironment.ONECLICKTIP) {
		
	    walletPrefix = 'oneclick-';
		activeServerUrl = productionServerUrl;
		evgDevMode = false;
		evgGameMode = false;
		facebookLoginEnabled = false;
		showWallet = false;
		showMessages = false;
		showImages = false;
		showTopVideos = false;
		
		
		
	}

	



