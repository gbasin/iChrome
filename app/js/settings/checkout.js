/**
 * The checkout handler
 */
define(["lodash", "jquery", "browser/api", "core/analytics", "modals/alert", "i18n/i18n", "core/auth"], function(_, $, Browser, Track, Alert, Translate, Auth) {
	var POPUP_WIDTH = 400,
		POPUP_HEIGHT = 500,
		PRO_URL = "https://api.ichro.me/billing/v1/checkout",
		ADFREE_URL = "https://api.ichro.me/billing/v1/adfree/checkout";

	var Checkout = function(type, isUpdating) {
		var url;

		if (type === "adfree") {
			url = ADFREE_URL + "?" + $.param({
				auth_token: Auth.get("token"),
				appVersion: Browser.app.version
			});
		}
		else {
			this.isUpdating = !!isUpdating;

			url = PRO_URL + "?" + $.param({
				plan: Auth.get("plan"),
				updating: this.isUpdating,
				auth_token: Auth.get("token"),
				appVersion: Browser.app.version
			});
		}

		Browser.windows.create({
			url: url,
			type: "popup",
			focused: true,
			width: POPUP_WIDTH,
			height: POPUP_HEIGHT,
			top: Math.round((screen.availHeight - POPUP_HEIGHT) / 2),
			left: Math.round((screen.availWidth - POPUP_WIDTH) / 2)
		}, function(win) {
			this._windowId = win.id;

			this.removeListener = function(id) {
				if (id === win.id) {
					this.destroy(true);
				}
			}.bind(this);

			Browser.windows.onRemoved.addListener(this.removeListener);

			this.initAPI();
		}.bind(this));

		this.unloadListener = this.destroy.bind(this);

		window.addEventListener("beforeunload", this.unloadListener);
	};

	Checkout.prototype = {
		/**
		 * Starts listening for requests to the internal intercepted extension API.
		 *
		 * We use this method instead of something like externally-connectable since
		 * it doesn't require an extra permission.
		 */
		initAPI: function() {
			var handlers = {
				cancel: function() {
					this.destroy();
				}.bind(this),

				subscribe: function(params) {
					this.subscribe(params.plan, params.paymentNonce);
				}.bind(this),

				upgrade: function(params) {
					this.upgradeToAdFree(params.paymentNonce);
				}.bind(this),

				checkoutStrings: function() {
					return Translate.getAll().settings.pro.checkout;
				},

				resize: function(params) {
					var data = {};

					if (params.width) {
						data.width = parseInt(params.width);
						data.left = Math.round((screen.availWidth - params.width) / 2);
					}

					if (params.height) {
						data.height = parseInt(params.height);
						data.top = Math.round((screen.availHeight - params.height) / 2);
					}

					Browser.windows.update(this._windowId, data);

					return {
						success: true
					};
				}.bind(this)
			};

			this.webRequestListener = function(info) {
				// Adapted from http://stackoverflow.com/a/3855394/900747
				var params = {},
					idx;

				_.each(new URL(info.url).search.substr(1).split("&"), function(e) {
					idx = e.indexOf("=");

					if (idx === -1) {
						params[e] = "";
					}
					else {
						params[e.substring(0, idx)] = decodeURIComponent(e.substr(idx + 1).replace(/\+/g, " "));
					}
				});

				if (params.method && handlers[params.method]) {
					var resp = handlers[params.method](params);

					if (resp) {
						return {
							redirectUrl: "data:application/json;charset=utf8;utf-8," + encodeURIComponent(JSON.stringify(resp))
						};
					}
				}
			};

			Browser.webRequest.onBeforeRequest.addListener(this.webRequestListener, {
				windowId: this._windowId,
				types: ["xmlhttprequest"],
				urls: ["https://api.ichro.me/app-intercept/v1*"]
			}, ["blocking"]);
		},

		destroy: function(fromRemove) {
			Browser.webRequest.onBeforeRequest.removeListener(this.webRequestListener);

			Browser.windows.onRemoved.removeListener(this.removeListener);

			window.removeEventListener("beforeunload", this.unloadListener);

			if (!fromRemove) {
				Browser.windows.remove(this._windowId);
			}
		},

		subscribe: function(plan, paymentNonce) {
			var isUpdating = this.isUpdating;

			this.destroy();

			Auth.ajax({
				method: "PUT",
				url: "/billing/v1/plan",
				data: {
					plan: plan,
					paymentNonce: paymentNonce
				},
				success: function(d) {
					if (d && d.success) {
						if (d.authToken) {
							Auth.set("token", d.authToken);
						}

						if (!isUpdating) {
							Track.FB.logPurchase(plan === "pro_monthly" ? 2 : 20, "USD", { fb_content_type: "pro", fb_content_id: plan });
						}

						Alert({
							title: Translate("settings.pro.checkout.thank_you"),
							contents: isUpdating ? null : [Translate("settings.pro.checkout.thank_you2")]
						});

						// Changes to the Pro state require a reload since it's used during initialization
						if (!isUpdating) {
							setTimeout(function() {
								location.reload();
							}, 4000);
						}
					}
					else {
						Alert([Translate("settings.pro.checkout.error"), Translate("settings.pro.checkout.error2")]);
					}
				}
			}).fail(function() {
				Alert([Translate("settings.pro.checkout.error"), Translate("settings.pro.checkout.error2")]);
			});
		},

		upgradeToAdFree: function(paymentNonce) {
			this.destroy();

			Auth.ajax({
				method: "PUT",
				url: "/billing/v1/adfree/upgrade",
				data: {
					paymentNonce: paymentNonce
				},
				success: function(d) {
					if (d && d.success) {
						if (d.authToken) {
							Auth.set("token", d.authToken);
						}

						Track.FB.logPurchase(10, "USD", { fb_content_type: "adfree", fb_content_id: "adfree_onetime" });

						Alert({
							title: Translate("settings.ads.thank_you"),
							contents: [Translate("settings.pro.checkout.thank_you2")]
						});

						setTimeout(function() {
							location.reload();
						}, 4000);
					}
					else {
						Alert([Translate("settings.pro.checkout.error"), Translate("settings.pro.checkout.error2")]);
					}
				}
			}).fail(function() {
				Alert([Translate("settings.pro.checkout.error"), Translate("settings.pro.checkout.error2")]);
			});
		}
	};

	return Checkout;
});