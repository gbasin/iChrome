/**
 * Handles Pro interactions
 */
define(["lodash", "jquery", "browser/api"], function(_, $, Browser) {
	var Pro = {
		token: "",
		isPro: false,


		/**
		 * Updates the current subscription information from the provided token
		 *
		 * @api     public
		 * @param   {String}  token  The token to update from
		 */
		updateToken: function(token) {
			if (!token) {
				return;
			}

			var subscription;

			try {
				// Pro tokens are JSON Web Tokens, which aren't encrypted (in this case), just
				// verified with a HMAC hash. So, they're also used for data transmission.
				subscription = JSON.parse(atob(token.split(".")[1]));

				if (!subscription.plan) {
					return;
				}
			}
			catch (e) {
				return;
			}

			_.assign(this, _.pick(subscription, "id", "maxUsers", "plan", "type", "user"));

			this.token = token;

			Browser.storage.proToken = token;

			// A getter would be more appropriate, but they're relatively slow
			this.isPro = this.plan && this.plan !== "free";

			return this;
		},

		
		/**
		 * Proxies jQuery.ajax, adding the Pro token (if available) in a header
		 * to each request.
		 *
		 * If the URL starts with a forward slash, it will be prefixed with the
		 * API server host. For example, /weather/33021 will be resolved to
		 * https://api.ichro.me/weather/33021
		 *
		 * @api    public
		 * @param  {Object} config The configuration to be passed to jQuery.ajax.
		 *                         If a beforeSend function is specified it will be
		 *                         called _after_ the pro token is added.
		 */
		ajax: function(config) {
			if (this.token) {
				config.headers = config.headers || {};

				// X-* headers are deprecated
				config.headers["Pro-Token"] = Pro.token;
			}

			if (config.url && config.url[0] === "/") {
				config.url = "https://api.ichro.me" + config.url;
			}
			
			return $.ajax(config);
		}
	};

	Pro.updateToken(Browser.storage.proToken);

	return Pro;
});