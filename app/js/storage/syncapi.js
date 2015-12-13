/**
 * Handles sync interfacing with ichro.me and ID management
 */
define(["jquery", "lodash", "browser/api", "core/analytics", "core/pro"], function($, _, Browser, Track, Pro) {
	/**
	 * The domain and port to sync data to/from
	 */
	var syncBase = "https://sync.ichro.me";

	/**
	 * Sync token and client ID management
	 *
	 * The sync system is based off of a sync token, which is effectively an OAuth
	 * token that simultaneously identifies and grants access to a sync profile,
	 * and a client ID to identify individual clients.
	 *
	 * Tokens are stored in Browser.storage for immediate use, Chrome's sync storage
	 * so clients under the same Chrome account are synced, and as a cookie at ichro.me
	 * so they survive reinstalls or other local data erasures.
	 */
	var clientData = {
		user: {}
	};

	try {
		if (Browser.storage.syncData) {
			var d = JSON.parse(Browser.storage.syncData);

			_.assign(clientData, d);
		}
	}
	catch (e) {}



	// NOTE: These two methods are duplicated in background.js.  Changes made here
	// should be reflected there

	/**
	 * Loads the sync token and client ID (if available) from the first storage
	 * location in which they can be found.  This is possibly asynchronous.
	 *
	 * @param   {Function}  cb  The callback function
	 */
	var loadData = function(cb) {
		if (clientData.token) {
			return cb(clientData);
		}

		var done = 0;

		var next = function() {
			if (done++) {
				if (clientData.token) {
					cb(clientData);
				}
				else {
					cb();
				}

				saveData();
			}
		};


		// These are loaded one after the next since they might contain
		// different levels of information.
		//
		// For example, if iChrome is uninstalled on 3 computers in a sync
		// group, and cookies are cleared on two, when it's reinstalled
		// one of the first two might create a new sync token, but not have
		// the email address from the old profile.  This ensures that the
		// third computer will load and resave that data.
		Browser.syncStorage.get("syncData", function(d) {
			if (d && d.syncData) {
				_.assign(clientData, d.syncData);
			}

			next();
		});

		Browser.cookies.get({
			name: "sync_data_main",
			url: "http://ichro.me"
		}, function(d) {
			try {
				d = d && d.value && JSON.parse(d.value);

				if (d) {
					// If a token is already set from the sync storage,
					// keep it, but add the new information
					if (clientData.token) {
						_.assign(clientData, _.omit(d, "token", "client"));
					}
					else {
						_.assign(clientData, d);
					}
				}
			}
			catch (e) {}

			next();
		});
	};


	/**
	 * Saves the sync token and client ID to the various storage locations used
	 */
	var saveData = function() {
		if (clientData.status && clientData.status === "duplicate" && clientData.token) {
			delete clientData.status;
		}

		Browser.storage.syncData = JSON.stringify(clientData);

		Browser.syncStorage.set({
			syncData: _.omit(clientData, "client")
		});

		Browser.cookies.set({
			name: "sync_data_main",
			domain: ".ichro.me",
			url: "http://ichro.me",
			value: JSON.stringify(_.assign({}, clientData, {
				// If the second extension picks this up we don't want it to think
				// the user is signed in and hide the button.
				user: _.omit(clientData.user, "signedIn")
			})),
			expirationDate: (new Date().getTime() / 1000) + (10 * 365 * 24 * 60 * 60)
		});
	};


	if (!(clientData.user.email && clientData.user.fname && clientData.user.lname && clientData.user.image)) {
		var getUser = function() {
			var addOrigin = function(info) {
				var headers = _.filter(info.requestHeaders, function(e) {
					return e.name.toLowerCase() !== "origin";
				});

				headers.push({
					name: "Origin",
					value: "https://www.google.com"
				});

				return {
					requestHeaders: headers
				};
			};

			Browser.webRequest.onBeforeSendHeaders.addListener(addOrigin, {
				urls: ["https://accounts.google.com/ListAccounts?source=ChromiumBrowser&json=standard"]
			}, ["blocking", "requestHeaders"]);


			// Field keys obtained from ParseListAccountsData in google_apis/gaia/gaia_auth_util.cc in the Chromium source
			$.post("https://accounts.google.com/ListAccounts?source=ChromiumBrowser&json=standard", function(d) {
				Browser.webRequest.onBeforeRequest.removeListener(addOrigin);

				if (!Array.isArray(d)) {
					try {
						d = JSON.parse(d);
					}
					catch (e) {
						return;
					}
				}

				if (!d.length || d.length < 2 || !d[1] || !d[1].length) {
					return;
				}

				d = d[1][0];

				var name = (d[2] || "").trim().split(" ");

				clientData.user.fname = name.shift().trim() || undefined;
				clientData.user.lname = name.join(" ").trim() || undefined;

				clientData.user.email = (d[3] || "").trim().toLowerCase() || undefined;
				clientData.user.image = (d[4] || "").trim().replace(/\/w[0-9]+-h[0-9]+\//, "/").replace(/^\/\//, "https://") || undefined;
				clientData.user.googleid = d[10];

				saveData();
			});
		};

		if (!clientData.token) {
			loadData(function() {
				var u = clientData.user;

				if (!(u.email && u.fname && u.lname && u.image)) {
					getUser();
				}
			});
		}
		else {
			getUser();
		}
	}


	var syncAPI = {
		/**
		 * Retrieves data from the servers and returns the raw response.
		 *
		 * @api     public
		 * @param   {Number}    [params]  Any URL parameters to append to the request
		 * @param   {Function}  cb        Has a Node-style signature of (error, data).
		 *                                Possible errors are "No token", "Network error",
		 *                                "Server error", or "Corrupt sync profile"
		 */
		get: function(params, cb) {
			if (typeof params === "function") {
				cb = params;
				params = null;
			}

			var get = function(retry) {
				$.ajax({
					url: syncBase + "/" + clientData.token,
					data: _.assign({
						extension: Browser.app.id,
						version: Browser.app.version,
						client: clientData.client
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


							if (d.user) {
								_.assign(clientData.user, d.user);
							}

							// Even if we already have a client token, accept any new one the server sends our way
							if (d.client) {
								clientData.client = d.client;
							}

							if (d.id && d.id !== clientData.token) {
								clientData.token = d.id;
							}

							if (d.user || d.client || d.id && d.id !== clientData.token) {
								saveData();
							}


							if (d.proToken) {
								Pro.updateToken(d.proToken);
							}


							cb(null, d);
						}
						else if (xhr.status === 0 || status === "timeout") {
							if (retry) {
								cb("Network error");
							}
							else {
								get(true);
							}
						}
						else {
							// If a non-network error occurred, something must be wrong with
							// our token(s), the data on the server, or the server itself.
							//
							// So, we erase our local tokens and reload them from the synced storage.
							// If the error occurs again, then the issue must be in our sync profile
							// so we will have to recreate it.
							if (retry && xhr.status.toString()[0] !== "5") {
								clientData = {
									user: {}
								};

								delete Browser.storage.syncData;

								Browser.syncStorage.remove("syncData");

								Browser.cookies.remove({
									name: "sync_data_main",
									url: "http://ichro.me"
								});

								cb("Corrupt sync profile");
							}
							else if (retry) {
								cb("Server error");
							}
							else {
								clientData = {
									user: {}
								};

								delete Browser.storage.syncData;

								loadData(function() {
									if (clientData.token) {
										get(true);
									}
									else {
										cb("No token");
									}
								});
							}
						}
					}
				});
			};

			if (clientData.token) {
				get();
			}
			else {
				loadData(function() {
					if (clientData.token) {
						get();
					}
					else {
						cb("No token");
					}
				});
			}
		},


		/**
		 * Syncs data up to the servers and returns the raw response.
		 *
		 * @api     public
		 * @param   {Object}    data         The data to sync to the server
		 * @param   {Function}  [cb]         Has a Node-style signature of (error, data).
		 *                                   Possible errors are "No token", "Network error", "No data",
		 *                                   "Duplicate", "Server error", or "Corrupt sync profile"
		 * @param   {Boolean}   [useBeacon]  Whether or not to use a beacon to send the request
		 * @param   {String}    [code]       The code to send with the request.  If this is specified
		 *                                   the request will be sent to the /authorize endpoint.
		 */
		sync: function(data, cb, useBeacon, code) {
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

			var post = function(retry) {
				var url = syncBase + (code ? "/authorize" : "") + (clientData.token ? "/" + clientData.token : "") + (code ? "?code=" + encodeURIComponent(code) : "");

				var sData = JSON.stringify(_.assign({}, data, clientData, {
					extension: Browser.app.id,
					version: Browser.app.version
				}));

				if (useBeacon) {
					return cb(navigator.sendBeacon(url, new Blob([sData], { type: "application/json" })));
				}

				$.ajax({
					type: clientData.token && !code ? "PUT" : "POST",
					url: url,
					data: sData,
					contentType: "application/json",
					timeout: 10000,
					complete: function(xhr, status) {
						if (xhr.status === 200 && xhr.responseJSON) {
							var d = xhr.responseJSON;


							if (d.user) {
								_.assign(clientData.user, d.user);
							}

							// Even if we already have a client token, accept any new one the server sends our way
							if (d.client) {
								clientData.client = d.client;
							}

							if (d.id && d.id !== clientData.token) {
								clientData.token = d.id;
							}

							if (d.user || d.client || d.id && d.id !== clientData.token) {
								saveData();
							}


							if (d.proToken) {
								Pro.updateToken(d.proToken);
							}


							cb(null, _.omit(d, "success"));
						}
						else if (xhr.status === 409) {
							cb("Duplicate");

							clientData.status = "duplicate";

							saveData();
						}
						else if (xhr.status === 0 || status === "timeout") {
							if (retry) {
								cb("Network error");
							}
							else {
								post(true);
							}
						}
						else {
							// If a non-network error occurred, something must be wrong with
							// our token(s), the data on the server, or the server itself.
							//
							// So, we erase our local tokens and reload them from the synced storage.
							// If the error occurs again, then the issue must be in our sync profile
							// so we will have to recreate it.
							if (retry && xhr.status.toString()[0] !== "5" && !(code && xhr.status === 401)) {
								clientData = {
									user: {}
								};

								delete Browser.storage.syncData;

								Browser.syncStorage.remove("syncData");

								Browser.cookies.remove({
									name: "sync_data_main",
									url: "http://ichro.me"
								});

								cb("Corrupt sync profile");
							}
							else if (retry) {
								cb("Server error");
							}
							else if (clientData.token) {
								clientData = {
									user: {}
								};

								delete Browser.storage.syncData;

								loadData(function() {
									if (clientData.token) {
										post(true);
									}
									else {
										cb("No token");
									}
								});
							}
							else {
								post(true);
							}
						}
					}
				});
			};


			if (!clientData.user.fname && data.settings && data.settings.name) {
				clientData.user.fname = data.settings.name;

				delete data.settings.name;
			}

			if (!clientData.user.image && data.settings && data.settings.profile) {
				clientData.user.image = data.settings.profile;

				delete data.settings.profile;
			}


			if (clientData.token) {
				post();
			}
			else {
				loadData(function() {
					post(); // If no tokens can be found, post will create a new profile
				});
			}
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
			return clientData;
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
		authorize: function(storage, sendData, cb) {
			Track.event("Sync", "Authorize", "Start");

			Browser.windows.create({
				width: 560,
				height: 600,
				type: "popup",
				focused: true,
				url: syncBase + "/signin",
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

								if (param === "code") return false;
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

								if (cb) cb();
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
		}
	};

	return syncAPI;
});