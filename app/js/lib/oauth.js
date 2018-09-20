/**
 * The OAuth library
 */
define(["jquery", "lodash", "browser/api"], function($, _, Browser) {
	/**
	 * The client constructor
	 *
	 * @constructor
	 * @api    public
	 * @param  {Object}  config                  The configuration
	 * @param  {String}  config.name             The name this configuration can be referenced by
	 * @param  {String}  config.id               Client ID, as provided by the service
	 * @param  {String}  config.secret           Client secret, as provided by the service
	 * @param  {String}  [config.scope]          The scope of this client should be authenticated for, optional
	 * @param  {String}  [config.authURL]        The URL at the service to send the user to for approval, defaults to Google's configuration
	 * @param  {String}  [config.tokenURL]       The URL at the service that the token can be retrieved from, defaults to Google's configuration
	 * @param  {String}  [config.codeParam]      The parameter that the authorization code should be parsed from in the redirectURL, defaults to code
	 * @param  {String}  [config.tokenParams]    The parameters to be POSTed to the tokenURL to retrieve the access token, defaults to Google's configuration
	 * @param  {String}  [config.redirectURL]    The redirect URL to be provided to the service, defaults to ichro.me/auth
	 * @param  {String}  [config.refreshParams]  The parameters to be POSTed to the tokenURL to refresh the access token, defaults to Google's configuration
	 */
	var OAuth = function(config) {
		if (!config || !config.name || !config.id || !config.secret) {
			return "Invalid config";
		}

		this.config = _.assign({
			scope: null,
			codeParam: "code",
			authURL: "https://accounts.google.com/o/oauth2/auth?" +
				"approval_prompt=force&client_id={{clientID}}&redirect_uri={{redirectURL}}&scope={{scope}}&access_type=offline&response_type=code",
			tokenURL: "https://www.googleapis.com/oauth2/v3/token",
			tokenParams: "code={{code}}&client_id={{clientID}}&client_secret={{secret}}&redirect_uri={{redirectURL}}&grant_type=authorization_code",
			refreshParams: "client_id={{clientID}}&client_secret={{secret}}&refresh_token={{refreshToken}}&grant_type=refresh_token",
			redirectURL: "https://ichro.me/auth"
		}, config);

		this.data = {};
	};


	OAuth.prototype = {
		/**
		 * Returns the token from storage, if it's available and valid or starts
		 * the authentication process.
		 *
		 * @api     public
		 * @param   {Function}  cb      The callback
		 * @param   {Boolean}   silent  Whether or not to retreive the key silently, i.e. just check
		 */
		getToken: function(cb, silent) {
			if (!cb) {
				return;
			}

			if (!this.data.token) {
				this.loadStorage();
			}

			if (this.data.token) {
				if (new Date().getTime() >= this.data.expiry) {
					if (this.data.refreshToken) {
						this.refreshToken(cb);
					}
					else if (!silent) {
						this.startAuthFlow(cb);
					}
					else {
						cb(false);
					}
				}
				else {
					cb(this.data.token, this.data);
				}
			}
			else if (!silent) {
				this.startAuthFlow(cb);
			}
			else {
				cb(false);
			}
		},


		/**
		 * Returns a boolean indicating if a token exists under this configuration
		 *
		 * @api     public
		 * @return  {Boolean}  Whether or not a token exists under this configuration name
		 */
		hasToken: function() {
			if (!this.data.token) {
				this.loadStorage();

				if (!this.data.token) {
					return false;
				}
			}

			return true;
		},


		/**
		 * Loads any stored keys under this configuration's name from the
		 * browser's storage and updates this.data with any available data
		 *
		 * @api     private
		 * @return  {Object}  The data retreived from the browser's storage
		 */
		loadStorage: function() {
			var data = Browser.storage.oauth;

			if (!data) {
				return {};
			}
			else {
				data = JSON.parse(data);

				if (data[this.config.name]) {
					this.data = data[this.config.name];
				}

				return this.data;
			}
		},


		/**
		 * Saves this.data under the configuration name in the browser's storage
		 *
		 * @api     private
		 */
		saveStorage: function() {
			if (this.data && Object.keys(this.data).length) {
				var data = Browser.storage.oauth;

				if (data) {
					data = JSON.parse(data);
				}
				else {
					data = {};
				}

				data[this.config.name] = this.data;

				Browser.storage.oauth = JSON.stringify(data);
			}
		},


		/**
		 * Requests a new token from the server using the refresh token
		 *
		 * @api     private
		 * @param   {Function}  cb  The callback, called with `this`
		 */
		refreshToken: function(cb) {
			var params = this.config.refreshParams
				.replace("{{clientID}}", encodeURIComponent(this.config.id))
				.replace("{{secret}}", encodeURIComponent(this.config.secret))
				.replace("{{refreshToken}}", encodeURIComponent(this.data.refreshToken));


			$.post(this.config.tokenURL, params, function(d) {
				if (typeof d !== "object") {
					d = JSON.parse(d);
				}

				if (!d.error && d.access_token) {
					var data = {
						token: d.access_token,
						type: d.token_type || "Bearer",
						expiry: new Date().getTime() + ((d.expires_in || 315569259) * 1000) // Defaults to +10 years if unavailable
					};

					if (d.refresh_token) {
						data.refreshToken = d.refresh_token;
					}

					// Add any extra data that's been included to the object
					_.assign(data, _.omit(d, "token_type", "access_token", "expires_in", "refresh_token", "type", "token", "expiry", "refreshToken"));

					_.assign(this.data, data);

					this.saveStorage();

					cb.call(this, data.token, data);
				}
			}.bind(this));
		},


		/**
		 * The ID of the currently opened window, false if none exists or true if one is being created.
		 *
		 * This is used to stop multiple windows from being opened on top of each other.
		 *
		 * @type  {Boolean|Number}
		 */
		openWindow: false,


		/**
		 * Opens a panel at the config authURL, starting the authorization process
		 *
		 * @api     private
		 * @param   {Function}  cb  The callback, called with `this`
		 */
		startAuthFlow: function(cb) {
			var redirectURL = this.config.redirectURL
				.replace("{{name}}", encodeURIComponent(this.config.name));

			var url = this.config.authURL
				.replace("{{clientID}}", encodeURIComponent(this.config.id))
				.replace("{{scope}}", encodeURIComponent(this.config.scope || ""))
				.replace("{{redirectURL}}", encodeURIComponent(redirectURL));


			var that = this;

			var createWindow = function() {
				that.openWindow = true;

				Browser.windows.create({
					url: url,
					width: 560,
					height: 600,
					type: "popup",
					focused: true,
					top: Math.round((screen.availHeight - 600) / 2),
					left: Math.round((screen.availWidth - 560) / 2)
				}, function(win) {
					that.openWindow = win.id;

					Browser.webRequest.onBeforeRequest.addListener(
						function(info) {
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


							if (params[this.config.codeParam]) {
								this.exchangeCode(params[this.config.codeParam], cb);
							}

							Browser.windows.remove(win.id);

							return {
								cancel: true
							};
						}.bind(that),
						{
							windowId: win.id,
							types: ["main_frame"],
							urls: [redirectURL + "*"]
						},
						["blocking"]
					);
				});
			};

			if (typeof this.openWindow === "number") {
				Browser.windows.get(this.openWindow, function(win) {
					if (Browser.runtime.lastError) {
						createWindow();
					}
					else {
						Browser.windows.update(win.id, { focused: true });
					}
				});
			}
			else if (this.openWindow === true) {
				return;
			}
			else {
				createWindow();
			}
		},


		/**
		 * Requests a token set from the tokenURL using the received code
		 *
		 * @api     private
		 * @param   {String}    code         The code received from the server
		 * @param   {Function}  cb           The callback, called with `this`
		 */
		exchangeCode: function(code, cb) {
			var params = this.config.tokenParams
				.replace("{{code}}", encodeURIComponent(code))
				.replace("{{clientID}}", encodeURIComponent(this.config.id))
				.replace("{{secret}}", encodeURIComponent(this.config.secret))
				.replace("{{redirectURL}}", encodeURIComponent(this.config.redirectURL
					.replace("{{name}}", encodeURIComponent(this.config.name)))
				);


			$.post(this.config.tokenURL, params, function(d) {
				if (typeof d !== "object") {
					d = JSON.parse(d);
				}

				if (!d.error && d.access_token) {
					var data = {
						token: d.access_token,
						type: d.token_type || "Bearer",
						expiry: new Date().getTime() + ((d.expires_in || 315569259) * 1000) // Defaults to +10 years if unavailable
					};

					if (d.refresh_token) {
						data.refreshToken = d.refresh_token;
					}

					// Add any extra data that's been included to the object
					_.assign(data, _.omit(d, "token_type", "access_token", "expires_in", "refresh_token", "type", "token", "expiry", "refreshToken"));

					this.data = data;

					this.saveStorage();

					cb.call(this, data.token, data);
				}
			}.bind(this));
		},


		/**
		 * Proxies jQuery.ajax, initializing the authorization process if necessary
		 * and adding an Authorization header containing the access token
		 *
		 * @api    public
		 * @param  {Object} config The configuration to be passed to jQuery.ajax.
		 *                         If a beforeSend function is specified it will be
		 *                         called _after_ the authorization header is added.
		 */
		ajax: function(config) {
			this.getToken(function(token, data) {
				if (config.beforeSend) {
					var oldBS = config.beforeSend;
				}

				config.beforeSend = function(xhr) {
					xhr.setRequestHeader("Authorization", ((data && data.type) || "Bearer") + " " + token);

					if (oldBS) {
						oldBS.apply(config, arguments);
					}
				};

				$.ajax(config);
			});
		}
	};

	return OAuth;
});