/**
 * Handles authentication and API interactions.
 *
 * The system is OAuth based, although since it's exclusively for an internal use and
 * a public app many things have been removed. The flow is far simpler, the client
 * posts authorization (usually a Google login token) and the server responds with
 * access and refresh tokens.
 */
define(["lodash", "jquery", "backbone", "browser/api"], function(_, $, Backbone, Browser) {
	var API_HOST = "http://localhost:4000/api"; // "https://api.ichro.me";

	var Auth = Backbone.Model.extend({
		isPro: false,


		initialize: function() {
			this.on("change:token", this.updateAccessToken, this);

			this.on("change", function(model, options) {
				if (options && options.internal) {
					return;
				}

				Browser.storage.authToken = JSON.stringify(this.toJSON());
			});

			try {
				this.set(JSON.parse(Browser.storage.authToken));
			}
			catch (e) {}
		},


		/**
		 * Signs the user out, revoking the current token and erasing local authorization data
		 *
		 * TODO: Make this method wipe user information and maybe even the page so it's a true sign out
		 */
		signout: function() {
			if (this.has("refreshToken")) {
				$.post(API_HOST + "/oauth/v1/token/revoke?refresh_token=" + encodeURIComponent(this.get("refreshToken")));
			}

			this.clear();
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


			this.set("expiry", payload.exp * 1000, {
				internal: true
			});

			if (payload.plan) {
				this.set("plan", payload.plan);
			}
			else {
				this.unset("plan");
			}

			this.isPro = this.has("plan") && this.get("plan") !== "free";

			return this;
		},


		_refreshing: false,


		refreshToken: function() {
			this._refreshing = true;

			$.post(API_HOST + "/oauth/v1/token/refresh", "refresh_token=" + encodeURIComponent(this.get("refreshToken")), function(d) {
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

					this._refreshing = false;

					this.set(data);

					this.trigger("refreshed");
				}
			}.bind(this)).fail(function(xhr) {
				// An error likely means our token isn't valid, so we sign the user out
				if (xhr.status.toString()[0] === "4") {
					this.signout();
				}

				// If something fails, the next request coming through should retry
				this._refreshing = false;
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
			if (this.has("expiry") && new Date().getTime() > this.get("expiry")) {
				this.refreshToken();
			}

			// If we're refreshing the token, wait till that's done
			if (this._refreshing) {
				this.once("refreshed", this.ajax.bind(this, config));

				return;
			}

			if (this.has("token")) {
				config.headers = config.headers || {};

				config.headers.Authorization = "Bearer " + this.get("token");
			}

			if (config.url && config.url[0] === "/") {
				config.url = API_HOST + config.url;
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