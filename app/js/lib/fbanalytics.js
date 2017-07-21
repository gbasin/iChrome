define(function() {
	var sdkReady = false,
		eventQueue = [],
		purchaseQueue = [];

	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "https://connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	/* global FB */
	window.fbAsyncInit = function() {
		FB.init({
			appId: "1646068945432680",
			xfbml: false,
			version: "v2.10"
		});

		require(["lodash", "core/auth", "storage/storage", "browser/api"], function(_, Auth, Storage, Browser) {
			Storage.on("done", function() {
				if (Auth.get("user")) {
					FB.AppEvents.setUserID(Auth.get("user"));
				}

				FB.AppEvents.setAppVersion(Browser.app.version + "-" + (Browser.app.newTab ? "nt" : "hp"));

				FB.AppEvents.updateUserProperties({
					"$user_type": Auth.isPro ? "Pro" : Auth.adFree ? "Ad-free" : Auth.isSignedIn ? "Signed in" : "Anonymous"
				});

				FB.AppEvents.activateApp();

				FB.AppEvents.logPageView();

				sdkReady = true;

				api.FB = FB;

				_.each(eventQueue, function(e) {
					FB.AppEvents.logEvent(FB.AppEvents.EventNames[e[0]] || e[0], e[1], e[2]);
				});

				_.each(purchaseQueue, function(e) {
					FB.AppEvents.logPurchase(e[0], e[1], e[2]);
				});

				purchaseQueue = eventQueue = [];
			});
		});
	};


	var api = {
		logEvent: function(name, value, params) {
			if (sdkReady) {
				return FB.AppEvents.logEvent(FB.AppEvents.EventNames[name] || name, value, params);
			}

			eventQueue.push([name, value, params]);
		},
		logPurchase: function(amount, currency, params) {
			if (sdkReady) {
				return FB.AppEvents.logPurchase(amount, currency, params);
			}

			purchaseQueue.push([amount, currency, params]);
		}
	};

	return api;
});