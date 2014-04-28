var cached = {};

var themes = {
	mossrivers:			{ id: 1 },
	grass:				{ id: 2 },
	beachcliff:			{ id: 3 },
	newzealand:			{ id: 4 },
	greenwater:			{ id: 5 },
	nautical:			{ id: 6 },
	shallowparadise:	{ id: 7 },
	header: {
		id: 8,
		scaling: "auto",
		position: "top center"
	},
	purelyfuzzy:		{ id: 9 },
	beach:				{ id: 10 },
	ocean:				{ id: 11 },
	mountains:			{ id: 12 },
	greenfalls:			{ id: 13 },
	jupiter:			{ id: 14 },
	pebbles:			{ id: 15 },
	trees:				{ id: 16 },
	treetops:			{ id: 17 },
	wood:				{ id: 18 },
	bluewaves:			{ id: 19 },
	quantumbeachballs:	{ id: 20 },
	tinfoil:			{ id: 21 },
	evenlyrough:		{ id: 22 },
	nexus:				{ id: 23 },
	rainbowcauseway:	{ id: 24 },
	thelens:			{ id: 25 },
	icecreamsandwich:	{ id: 26 }
};

var cache = function(theme, cb) {
	var err = function(e) {
			if (e.name == "InvalidStateError") {
				return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) { // The full 500MB probably won't be used, but the caching will fail if it does.
					window.fs = fs;

					cache(theme, cb);
				}, err);
			}

			cb();
		};

	if (!window.fs) {
		return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
			window.fs = fs;

			cache(theme, cb);
		}, err);
	}
	
	var fs = window.fs,
		xhr = new XMLHttpRequest();

	xhr.open("GET", "https://s3.amazonaws.com/iChrome/Themes/Images/" + theme.id + ".jpg");

	xhr.responseType = "blob";

	fs.root.getDirectory("Themes", { create: true }, function(dir) {
		dir.getFile(theme.id + ".jpg", { create: true }, function(fe) {
			xhr.onload = function(e) {
				if (xhr.status !== 200) {
					return err();
				}

				var blob = xhr.response;

				fe.createWriter(function(writer) {
					writer.onwrite = function(e) {
						theme.image = fe.toURL();

						theme.offline = true;

						cached[theme.id] = theme;

						cb();
					};

					writer.onerror = err;

					writer.write(blob);
				}, err);
			};

			xhr.send();
		}, err);
	}, err);
};

var migrateThemes = function() {
	chrome.storage.local.get(["settings", "tabs"], function(d) {
		var queue = [];

		if (d.settings.theme && themes[d.settings.theme]) {
			queue.push(d.settings.theme);

			// The theme reference will be broken regardless of whether or not the caching succeeds, so there's no harm in setting it now
			d.settings.theme = themes[d.settings.theme].id + "";
		}

		d.tabs.forEach(function(e, i) {
			if (e.theme && themes[e.theme]) {
				if (queue.indexOf(e.theme) == -1) queue.push(e.theme);

				d.tabs[i].theme = themes[e.theme].id + "";
			}
		});

		queue.forEach(function(e, i) {
			queue[i] = themes[e];
		});

		(function next() {
			if (queue.length) {
				cache(queue.pop(), next);
			}
			else {
				chrome.storage.local.set({
					tabs: d.tabs,
					cached: cached,
					settings: d.settings
				});
			}
		})();
	});
};

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "install") {
		var link = document.createElement("a");

		link.setAttribute("href", "chrome-extension://" + chrome.app.getDetails().id + "/index.html");
		link.setAttribute("target", "_blank");

		chrome.storage.sync.get(function(d) {
			if (d.tabs) {
				var tabs = [],
					key,
					data = {
						settings: d.settings,
						themes: d.themes
					};

				for (key in d) {
					if (key.indexOf("tabs") == 0) {
						tabs[key.substr(4) || 0] = d[key];
					}
				}

				data.tabs = JSON.parse(tabs.join(""));

				chrome.storage.local.set(d);
			}
			else {
				localStorage["installed"] = "true";

				link.click();
			}
		});
	}
	else if (details.reason == "update") {
		if (details.previousVersion.indexOf("2.1") !== 0) {
			migrateThemes();
		}
		
		localStorage["whatsNew"] = "true";
	}
});

chrome.webRequest.onHeadersReceived.addListener(
	function(info) {
		var headers = info.responseHeaders;

		for (var i = headers.length - 1; i >= 0; --i) {
			var header = headers[i].name.toLowerCase();

			if (header == "x-frame-options" || header == "frame-options") {
				headers.splice(i, 1);
			}
		}
		
		return {
			responseHeaders: headers
		};
	},
	{
		urls: [ "*://*/*" ],
		types: [ "sub_frame" ]
	},
	["blocking", "responseHeaders"]
);


// Sync manager
var unextend = function(obj1, obj2) {
		var newObj = {};

		for (var k in obj2) {
			var e = obj2[k],
				c = obj1[k];

			if (typeof e == "undefined") {
				continue;
			}
			else if (typeof c == "undefined") {
				newObj[k] = e;
			}
			else if (typeof e == "object" && typeof e.length == "number" && JSON.stringify(e) !== JSON.stringify(c)) {
				newObj[k] = e;
			}
			else if (typeof e == "object" && typeof e.length == "undefined" && JSON.stringify(e) !== JSON.stringify(c)) {
				newObj[k] = unextend(c, e);
			}
			else if (e.toString() !== c.toString()) {
				newObj[k] = e;
			}
		}

		return newObj;
	},
	getJSON = function(tabs) {
		var stabs = [];

		tabs.forEach(function(t, i) {
			var tab = {},
				allowed = ["id", "size", "syncData", "loc"],
				key;

			for (key in t) {
				if (key !== "columns") {
					tab[key] = t[key];
				}
				else {
					tab.columns = [];

					t[key].forEach(function(c, i) {
						var column = [];

						c.forEach(function(w, i) {
							var widget = {},
								wkey;

							for (wkey in w) {
								if (allowed.indexOf(wkey) !== -1) {
									widget[wkey] = w[wkey];
								}
								else if (wkey == "config") {
									var config = {};

									for (var ckey in w.config) {
										if (ckey !== "size") config[ckey] = w.config[ckey];
									}

									if (JSON.stringify(config) !== "{}") widget.config = config;
								}
							}

							column.push(widget);
						});

						tab.columns.push(column);
					});
				}
			}

			stabs.push(tab);
		});

		return JSON.stringify(stabs);
	},
	uid = (localStorage.uid || (localStorage.uid = (new Date().getTime()).toString(16) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)));

chrome.storage.onChanged.addListener(function(d, area) {
	if (area == "sync") {
		chrome.storage.local.get(["tabs", "themes", "settings", "cached"], function(old) {
			var o = {
				tabs: old.tabs,
				themes: old.themes,
				settings: old.settings
			};

			var newData = {
				tabs: o.tabs,
				themes: o.themes,
				settings: o.settings
			};

			if (d.themes && d.themes.newValue && JSON.stringify(o.themes) !== JSON.stringify(d.themes.newValue)) {
				newData.themes = d.themes.newValue;
			}

			if (d.settings && d.settings.newValue && JSON.stringify(o.settings) !== JSON.stringify(d.settings.newValue)) {
				newData.settings = d.settings.newValue;
			}

			var save = function() {
				var queue = [];

				cached = old.cached;

				if (newData.settings.theme) {
					if (themes[newData.settings.theme]) {
						queue.push(themes[newData.settings.theme].id);

						newData.settings.theme = themes[newData.settings.theme].id + "";
					}
					else if (parseInt(newData.settings.theme) /* Not a custom theme */ && !old.cached[newData.settings.theme]) {
						queue.push(newData.settings.theme);
					}
				}

				newData.tabs.forEach(function(e, i) {
					if (e.theme) {
						if (themes[e.theme]) {
							queue.push(themes[e.theme].id);

							newData.tabs[i].theme = themes[e.theme].id + "";
						}
						else if (parseInt(e.theme) && !old.cached[e.theme]) {
							queue.push(e.theme);
						}
					}
				});

				var next = function() {
					if (queue.length) {
						cache(mThemes[index[queue.pop()]], next);
					}
					else {
						newData.cached = cached; // Has to be set here otherwise earlier difference checks will fail

						chrome.storage.local.set(newData, function() {
							chrome.extension.getViews().forEach(function(e, i) {
								if (e.iChrome && e.iChrome.refresh) {
									e.iChrome.refresh(true);
								}
							});
						});
					}
				},
				mThemes = [],
				index = {};

				if (queue.length) {
					var xhr = new XMLHttpRequest();

					xhr.open("GET", "https://s3.amazonaws.com/iChrome/Themes/manifest.json", true);

					xhr.onreadystatechange = function() {
						if (xhr.readyState == 4 && xhr.status == 200) {
							var d = JSON.parse(xhr.responseText).images;

							d.forEach(function(e, i) {
								index[e.id] = mThemes.length;

								delete e.resolution;
								delete e.categories;

								mThemes.push(e);
							});

							next();
						}
					};

					xhr.send(null);
				}
				else {
					next();
				}
			};

			if (Object.keys(d).join("").indexOf("tabs") !== -1) {
				chrome.storage.sync.get(function(sd) {
					var tabs = [],
						key;

					for (key in sd) {
						if (key.indexOf("tabs") == 0) {
							tabs[key.substr(4) || 0] = sd[key];
						}
					}

					if (tabs.length) newData.tabs = JSON.parse(tabs.join(""));

					if (JSON.stringify(newData) !== JSON.stringify(o) && ((sd.lastChanged && sd.lastChanged.split) ? sd.lastChanged : "older-Version").split("-")[1] !== uid) {
						save();
					}
				});
			}
			else if (JSON.stringify(newData) !== JSON.stringify(o) && ((d.lastChanged && d.lastChanged.split) ? d.lastChanged : "older-Version").split("-")[1] !== uid) {
				save();
			}
		});
	}
});

var setReload = function() {
	setTimeout(function() {
		location.reload();
	}, 100);
};