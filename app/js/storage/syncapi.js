/**
 * Handles sync interfacing with ichro.me and ID management
 */
define(["lodash", "browser/api", "core/analytics", "core/auth"], function(_, Browser, Track, Auth) {
	// The sync API URL
	var SYNC_URL = "/sync/v1";


	var syncAPI = {
		/**
		 * Retrieves data from the servers and returns the raw response.
		 *
		 * @api     public
		 * @param   {Number}    [params]  Any URL parameters to append to the request
		 * @param   {Function}  cb        Has a Node-style signature of (error, data).
		 *                                Possible errors are "Network error" and "Server error"
		 * @param   {Boolean}   [retry]   If this request is a retry
		 */
		get: function get(params, cb, retry) {
			if (typeof params === "function") {
				cb = params;
				params = null;
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

						if (!d) {
							return cb(null, {
								modified: false
							});
						}

						if (d.accessToken) {
							Auth.set("token", d.accessToken);
						}


						cb(null, d);
					}
					else if (retry && (xhr.status === 0 || status === "timeout")) {
						cb("Network error");
					}
					else if (retry) {
						// If an error occurs, we try again. If the request fails twice, we sign the user out.
						Auth.signout();

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
		 * @param   {Function}  [cb]         Has a Node-style signature of (error, data).
		 *                                   Possible errors are "Network error", "No data", or "Server error"
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

			if (!data || typeof data !== "object") {
				return cb("No data");
			}

			var sData = JSON.stringify(_.assign({}, data, {
				version: Browser.app.version
			}));

			if (useBeacon) {
				return cb(navigator.sendBeacon(SYNC_URL, new Blob([sData], { type: "application/json" })));
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
							Auth.set("token", d.accessToken);
						}


						cb(null, d);
					}
					else if (retry && (xhr.status === 0 || status === "timeout")) {
						cb("Network error");
					}
					else if (retry) {
						// If an error occurs, we try again. If the request fails twice, we sign the user out.
						Auth.signout();

						cb("Server error");
					}
					else {
						sync(data, cb, false, true);
					}
				}
			});
		},


		/**
		 * Returns the sync profile information.
		 *
		 * Since this method is synchronous, it will not pull data from secondary sources.
		 * If it's called immediately on reinstall, for example, it won't return data.
		 *
		 * @api     public
		 * @return  {Object}  The sync profile information
		 */
		getInfo: function() {
			return {user:{}}; //clientData;
		},


		/**
		 * Overwrites sync profile information with the provided object
		 *
		 * @api     public
		 * @param   {Object}  data  The complete sync profile information to save
		 */
		saveInfo: function(data) {
			clientData = _.clone(data);

			saveData();
		},


		/**
		 * Requests access to the user's Google profile to create or connect to a sync profile
		 *
		 * @api     public
		 * @param   {Storage}  storage     The iChrome storage interface.  This will be used to
		 *                                 save the response profile
		 * @param   {Boolean}  [sendData]  Whether or not to send data to the server, overwriting
		 *                                 the configurations on other computers.  Defaults to false
		 * @param   {Function} [cb]        The callback
		 */
		authorize: _.noop

		/*function(storage, sendData, cb) {
			Track.event("Sync", "Authorize", "Start");

			Browser.windows.create({
				width: 560,
				height: 600,
				type: "popup",
				focused: true,
				url: SYNC_URL + "/signin",
				top: Math.round((screen.availHeight - 600) / 2),
				left: Math.round((screen.availWidth - 560) / 2)
			}, function(win) {
				Browser.webRequest.onBeforeRequest.addListener(
					function(info) {
						// Adapted from http://stackoverflow.com/a/3855394/900747
						var params = {},
							idx, param;

						_.each(new URL(info.url).search.substr(1).split("&"), function(e) {
							idx = e.indexOf("=");

							if (idx === -1) {
								params[e] = "";
							}
							else {
								param = e.substring(0, idx);

								params[param] = decodeURIComponent(e.substr(idx + 1).replace(/\+/g, " "));

								if (param === "code") {
									return false;
								}
							}
						});

						if (params.code) {
							var data = {};

							if (sendData) {
								data = {
									tabs: storage.tabsSync,
									themes: storage.themes,
									settings: storage.settings
								};
							}

							syncAPI.sync(data, function(err, d) {
								if (!err && d) {
									Track.event("Sync", "Authorize", "Success");

									_.assign(storage, _.pick(d, "user", "tabs", "themes", "settings"));

									// This results in two requests going to the server, but it's the
									// simplest way to get all the metadata set up properly.
									storage.sync();
								}
								else {
									Track.event("Sync", "Authorize", "Error");
								}

								if (cb) {
									cb();
								}
							}, false, params.code);
						}
						else if (cb) {
							cb(true);
						}

						Browser.windows.remove(win.id);

						return {
							cancel: true
						};
					},
					{
						windowId: win.id,
						types: ["main_frame"],
						urls: ["https://sync.ichro.me/authorize*"]
					},
					["blocking"]
				);
			});
		}*/
	};

	return syncAPI;
});