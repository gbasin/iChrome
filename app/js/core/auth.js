/**
 * Handles authentication and API interactions.
 *
 * The system is OAuth based, although since it's exclusively for an internal use and
 * a public app many things have been removed. The flow is far simpler, the client
 * posts authorization (usually a Google login token) and the server responds with
 * access and refresh tokens.
 */
define(["jquery", "browser/api"], function($, Browser) {
	var API_HOST = "https://api.ichro.me";

	var Auth = {
		data: {
			token: "",
			expiry: 0,
			refreshToken: ""
		},
		isPro: false,


		/**
		 * Updates the current token
		 *
		 * @api     public
		 * @param   {String}  token  The token to update with
		 */
		updateAccessToken: function(token) {
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


			this.data.token = token;

			this.data.expiry = payload.exp * 1000;

			Browser.storage.authToken = JSON.stringify(this.data);


			if (payload.plan) {
				this.plan = payload.plan;
			}

			this.isPro = this.plan && this.plan !== "free";

			return this;
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
			if (Auth.data.token) {
				config.headers = config.headers || {};

				config.headers.Authorization = "Bearer " + Auth.data.token;
			}

			if (config.url && config.url[0] === "/") {
				config.url = API_HOST + config.url;
			}

			return $.ajax(config);
		}
	};

	try {
		Auth.data = JSON.parse(Browser.storage.authToken);

		Auth.updateAccessToken(Auth.data.token);
	}
	catch (e) {}

	return Auth;
});