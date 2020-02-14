/**
 * Handles authentication and API interactions.
 *
 * The system is OAuth based, although since it's exclusively for an internal use and
 * a public app many things have been removed. The flow is far simpler, the client
 * posts authorization (usually a Google login token) and the server responds with
 * access and refresh tokens.
 */
define(["lodash", "jquery", "backbone", "browser/api", "fbanalytics", "i18n/i18n", "modals/alert", "storage/filesystem"], function(_, $, Backbone, Browser, FB, Translate, Alert, FileSystem) {
	var API_HOST = "https://api.ichro.me";

	var Auth = Backbone.Model.extend({
		isPro: false,
		adFree: false,
		isSignedIn: false,
		isTrial: false,
		trialExpiration: "0",

		initialize: function() {
			this.on("change:isPro", function() {
				this.isPro = this.get("isPro");
				this.isTrial = this.get("isTrial");
				this.trialExpiration = this.get("trialExpiration");
			}, this).on("change:adFree", function() {
				this.adFree = this.get("adFree");
			}, this).on("change:user", function() {
				this.isSignedIn = !!this.get("user");
			}, this);

			try {
				this.set(JSON.parse(Browser.storage.authData));
			}
			catch (e) {}

			// Listen for auth changes from the background and other pages
			window.addEventListener("storage", function(e) {
				if (!e || e.key !== "authData") {
					return;
				}

				// If we were just signed out, reload
				if (!e.newValue) {
					return location.reload();
				}

				var wasPro = this.isPro;

				this.clear({
					silent: true
				}).set(JSON.parse(e.newValue));

				if (this.isPro !== wasPro) {
					location.reload();
				}
			}.bind(this));

			this.on("change:token", this.updateAccessToken, this);

			this.on("change", function(model, options) {
				if (options && options.internal) {
					return;
				}

				Browser.storage.authData = JSON.stringify(this.toJSON());
			});
		},


		/**
		 * Signs the user out, revoking the current token and erasing local authorization data
		 *
		 * @param {Boolean}  [fromError]  If this sign out is due to an error (such as a token being revoked),
		 *                                in which case the user is silently signed out.
		 */
		signout: function(fromError) {
			var cb = function() {
				if (this.has("refreshToken")) {
					$.post(API_HOST + "/oauth2/v1/token/revoke?refresh_token=" + encodeURIComponent(this.get("refreshToken")));
				}

				this.clear();

				FileSystem.clear(function() {
					var version = Browser.storage.version;

					Browser.storage.clear();

					if (version) {
						Browser.storage.version = version;
					}

					window.onbeforeunload = null;

					location.reload();
				});
			}.bind(this);

			if (fromError) {
				return cb();
			}

			Alert({
				contents: [Translate("storage.signout_confirm")],
				confirm: true
			}, cb);
		},


		/**
		 * Initiates and handles the authorization flow
		 *
		 * @param   {Function}  cb
		 */
		authorize: function(cb) {
			var that = this;

			var messageHandler = function(event) {
				if (event.origin !== "https://api.ichro.me") {
					return;
				}

				if (!event.data || !event.data.token) {
					return;
				}

				FB.logEvent("COMPLETED_REGISTRATION");

				this.set({
					token: event.data.token,
					expiry: event.data.expiry * 1000,
					refreshToken: event.data.refreshToken
				});

				if (that.child) {
					that.child.close();
				};

				cb(null, !!event.data.isNewUser);
			}.bind(this);

			window.addEventListener("message", messageHandler);

			var url = API_HOST + "/oauth2/v1/authorize?extension=" + (Browser.app.newTab ? "newtab" : "main");
			var top = Math.round((screen.availHeight - 600) / 2);
			var left = Math.round((screen.availWidth - 560) / 2);

			var timer = setInterval(function() {   
				if(that.child && that.child.closed) {  
					clearInterval(timer);  
					window.removeEventListener("message", messageHandler);
				}  
			}, 200); 

			that.child = window.open(url, "_blank", "top=" + top + ",left=" + left + ",height=600,width=560");
		},


		/**
		 * Updates the current token
		 *
		 * @api     public
		 */
		updateAccessToken: function() {
			var token = this.get("token");

			if (!token) {
				return;
			}

			var payload;

			try {
				// Auth tokens are JSON Web Tokens, which aren't encrypted (in this case), just
				// verified with a HMAC hash. So, they're also used for data transmission.
				payload = JSON.parse(atob(token.split(".")[1]));
			}
			catch (e) {
				return;
			}


			this.isPro = payload.plan && payload.plan !== "free";

			this.isTrial = payload.plan && payload.plan === "trial";

			this.adFree = this.isPro || !!payload.adFree;

			this.set({
				isPro: this.isPro,
				user: payload.sub,
				adFree: this.adFree,
				expiry: payload.exp * 1000,
				plan: payload.plan || "free",
				subscription: payload.subscription,
				isTrial: this.isTrial,
				trialExpiration: payload.trial
			});

			return this;
		},


		_refreshPromise: null,


		refreshToken: function() {
			// If we're already refreshing, return
			if (this._refreshPromise) {
				return;
			}

			this._refreshPromise = $.post(API_HOST + "/oauth2/v1/token/refresh", "refresh_token=" + encodeURIComponent(this.get("refreshToken")), function(d) {
				if (typeof d !== "object") {
					d = JSON.parse(d);
				}

				if (!d.error && d.token) {
					var data = {
						token: d.token,
						expiry: d.expiry * 1000
					};

					// If we get a new refresh token, update that too
					if (d.refreshToken) {
						data.refreshToken = d.refreshToken;
					}

					this.set(data);

					this.trigger("refreshed");
				}

				this._refreshPromise = null;
			}.bind(this)).fail(function(xhr) {
				// An error likely means our token isn't valid, so we sign the user out
				if (xhr.status.toString()[0] === "4") {
					this.signout(true);
				}

				// If something fails, the next request coming through should retry
				this._refreshPromise = null;
			}.bind(this));
		},


		/**
		 * Proxies jQuery.ajax, adding the auth token (if available) in a header
		 * to each request.
		 *
		 * If the URL starts with a forward slash, it will be prefixed with the
		 * API server host. For example, /weather/33021 will be resolved to
		 * https://api.ichro.me/weather/33021
		 *
		 * @api    public
		 * @param  {Object} config The configuration to be passed to jQuery.ajax.
		 *                         If a beforeSend function is specified it will be
		 *                         called _after_ the auth token is added.
		 */
		ajax: function(config) {
			if (config.url && config.url[0] === "/") {
				if (this.has("expiry") && new Date().getTime() > this.get("expiry")) {
					this.refreshToken();
				}

				// If we're refreshing the token, wait till that's done
				if (this._refreshPromise) {
					return this._refreshPromise.then(this.ajax.bind(this, config));
				}

				config.url = API_HOST + config.url;

				if (this.has("token")) {
					config.headers = config.headers || {};

					config.headers.Authorization = "Bearer " + this.get("token");
				}
			}

			return $.ajax(config).fail(function(xhr) {
				if (this.has("token") && xhr.status === 401 && xhr.responseText.trim().toLowerCase().indexOf("invalid_token") !== -1) {
					this.refreshToken();
				}
			}.bind(this));
		}
	});

	return new Auth();
});