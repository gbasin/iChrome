define(function() {
	var sdkReady = false,
		eventQueue = [],
		purchaseQueue = [],
		userType;

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
				userType = Auth.isPro ? "Pro" : Auth.adFree ? "Ad-free" : Auth.isSignedIn ? "Signed in" : "Anonymous";

				try {
					if (Auth.get("user")) {
						FB.AppEvents.setUserID(Auth.get("user"));
					}
					else {
						if (!Browser.storage.uuid) {
							function s4() { // jshint ignore:line
								return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
							}

							Browser.storage.uuid = s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
						}

						FB.AppEvents.setUserID(Browser.storage.uuid);
					}

					FB.AppEvents.updateUserProperties({
						"$user_type": userType
					});
				}
				catch (e) {}

				FB.AppEvents.setAppVersion(Browser.app.version + "-" + (Browser.app.newTab ? "nt" : "hp"));

				// This is all FB.AppEvents.activateApp() does, minus the userType parameter
				FB.AppEvents.logEvent("fb_mobile_activate_app", null, { userType: userType });

				// Again, the same as FB.AppEvents.logPageView()
				FB.AppEvents.logEvent(FB.AppEvents.EventNames.PAGE_VIEW, null, { userType: userType });

				sdkReady = true;

				api.FB = FB;

				_.each(eventQueue, function(e) {
					e[2] = e[2] || {};

					e[2].userType = userType;

					FB.AppEvents.logEvent(FB.AppEvents.EventNames[e[0]] || e[0], e[1], e[2]);
				});

				_.each(purchaseQueue, function(e) {
					e[2] = e[2] || {};

					e[2].userType = userType;

					FB.AppEvents.logPurchase(e[0], e[1], e[2]);
				});

				purchaseQueue = eventQueue = [];
			});
		});
	};


	var api = {
		logEvent: function(name, value, params) {
			if (sdkReady) {
				params = params || {};

				params.userType = userType;

				return FB.AppEvents.logEvent(FB.AppEvents.EventNames[name] || name, value, params);
			}

			eventQueue.push([name, value, params]);
		},
		logPurchase: function(amount, currency, params) {
			if (sdkReady) {
				params = params || {};

				params.userType = userType;

				return FB.AppEvents.logPurchase(amount, currency, params);
			}

			purchaseQueue.push([amount, currency, params]);
		}
	};

	return api;
});