/**
 * Handles sync interfacing with ichro.me and ID management
 */
define(["lodash", "browser/api", "i18n/i18n", "modals/alert", "core/analytics", "core/auth"], function(_, Browser, Translate, Alert, Track, Auth) {
	// The sync API URL
	var SYNC_URL = "/sync/v1";


	var pastDueAlerted = false;

	var handlePastDue = function() {
		if (pastDueAlerted) {
			return;
		}

		pastDueAlerted = true;

		Alert({
			title: Translate("storage.pastdue"),
			contents: [Translate("storage.pastdue_desc")]
		});
	};


	var syncAPI = {
		/**
		 * Retrieves data from the servers and returns the raw response.
		 *
		 * @api     public
		 * @param   {Number}    [params]  Any URL parameters to append to the request
		 * @param   {Function}  cb        Has a Node-style signature of (err, data). This will be called
		 *                                with no arguments if the user is not signed in. Possible errors
		 *                                are "Network error" and "Server error".
		 * @param   {Boolean}   [retry]   If this request is a retry
		 */
		get: function get(params, cb, retry) {
			if (typeof params === "function") {
				cb = params;
				params = null;
			}

			if (!Auth.isSignedIn) {
				return cb();
			}

			Auth.ajax({
				url: SYNC_URL,
				data: _.assign({
					version: Browser.app.version
				}, params),
				timeout: 10000,
				complete: function(xhr, status) {
					if ((xhr.status === 200 && xhr.responseJSON) || xhr.status === 304) {
						var d = xhr.responseJSON;

						if (d && d.accessToken) {
							var wasPro = Auth.isPro;

							Auth.set("token", d.accessToken);

							if (Auth.isPro !== wasPro) {
								location.reload();
							}
						}

						if (d && d.subscriptionPastDue) {
							handlePastDue();
						}

						if (!d || d.isModified === false) {
							return cb(null, {
								modified: false
							});
						}


						cb(null, d);
					}
					else if (retry && (xhr.status === 0 || status === "timeout")) {
						cb("Network error");
					}
					else if (retry) {
						cb("Server error");
					}
					else {
						get(params, cb, true);
					}
				}
			});
		},


		/**
		 * Syncs data up to the servers and returns the raw response.
		 *
		 * @api     public
		 * @param   {Object}    data         The data to sync to the server
		 * @param   {Function}  [cb]         Has a Node-style signature of (err, data). This will be called without
		 *                                   any arguments if the user isn't signed in. Possible errors are
		 *                                   "Network error", "No data", or "Server error".
		 * @param   {Boolean}   [useBeacon]  Whether or not to use a beacon to send the request
		 * @param   {Boolean}   [retry]      If this request is a retry
		 */
		sync: function sync(data, cb, useBeacon, retry) {
			if (typeof cb === "boolean") {
				useBeacon = cb;
				cb = _.noop;
			}
			else if (!cb) {
				cb = _.noop;
			}

			if (!Auth.isSignedIn) {
				return cb();
			}

			if (!data || typeof data !== "object") {
				return cb("No data");
			}

			var sData = JSON.stringify(_.assign({}, data, {
				version: Browser.app.version
			}));

			if (useBeacon) {
				if (Auth.has("token")) {
					sData.authToken = Auth.get("token");
				}

				return cb(navigator.sendBeacon(SYNC_URL, new Blob([sData], { type: "text/plain" })));
			}

			Auth.ajax({
				type: "PUT",
				url: SYNC_URL,
				data: sData,
				contentType: "application/json",
				timeout: 10000,
				complete: function(xhr, status) {
					if (xhr.status === 200 && xhr.responseJSON) {
						var d = xhr.responseJSON;

						if (d.accessToken) {
							var wasPro = Auth.isPro;

							Auth.set("token", d.accessToken);

							if (Auth.isPro !== wasPro) {
								location.reload();
							}
						}

						if (d.subscriptionPastDue) {
							handlePastDue();
						}

						cb(null, d);
					}
					else if (retry && (xhr.status === 0 || status === "timeout")) {
						cb("Network error");
					}
					else if (retry) {
						cb("Server error");
					}
					else {
						sync(data, cb, false, true);
					}
				}
			});
		},


		/**
		 * Prompts the user to sign in and then syncs with the server
		 *
		 * @api     public
		 * @param   {Storage}  storage     The iChrome storage interface.  This will be used to
		 *                                 save the response profile
		 * @param   {Boolean}  [sendData]  Whether or not to send data to the server, overwriting
		 *                                 the configurations on other computers.  Defaults to false
		 * @param   {Function} [cb]        The callback
		 */
		authorize: function(storage, sendData, cb) {
			cb = cb || _.noop;

			Auth.authorize(function(err, isNewUser) {
				if (err) {
					cb(err);

					Track.event("Sync", "Authorize", "Error");

					return;
				}

				var data = {};

				if (sendData) {
					data = {
						tabs: storage.tabsSync,
						themes: storage.themes,
						settings: storage.settings
					};
				}

				syncAPI.sync(data, function(err, d) {
					if (err || !d) {
						Track.event("Sync", "Authorize", "Error");

						cb(null, isNewUser);

						return;
					}

					Track.event("Sync", "Authorize", "Success");

					_.assign(storage, _.pick(d, "user", "tabs", "themes", "settings"));

					// This results in two requests going to the server, but it's the
					// simplest way to get all the metadata set up properly.
					storage.sync();

					cb(null, isNewUser);
				});
			});
		}
	};

	return syncAPI;
});