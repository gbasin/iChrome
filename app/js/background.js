/**
* @preserve Copyright 2012 Twitter, Inc.
* @license http://www.apache.org/licenses/LICENSE-2.0.txt
*/
var Hogan={};
/* jshint ignore:start */
(function(a,b){function i(a){return String(a===null||a===undefined?"":a)}function j(a){return a=i(a),h.test(a)?a.replace(c,"&amp;").replace(d,"&lt;").replace(e,"&gt;").replace(f,"&#39;").replace(g,"&quot;"):a}a.Template=function(a,c,d,e){this.r=a||this.r,this.c=d,this.options=e,this.text=c||"",this.buf=b?[]:""},a.Template.prototype={r:function(a,b,c){return""},v:j,t:i,render:function(b,c,d){return this.ri([b],c||{},d)},ri:function(a,b,c){return this.r(a,b,c)},rp:function(a,b,c,d){var e=c[a];return e?(this.c&&typeof e=="string"&&(e=this.c.compile(e,this.options)),e.ri(b,c,d)):""},rs:function(a,b,c){var d=a[a.length-1];if(!k(d)){c(a,b,this);return}for(var e=0;e<d.length;e++)a.push(d[e]),c(a,b,this),a.pop()},s:function(a,b,c,d,e,f,g){var h;return k(a)&&a.length===0?!1:(typeof a=="function"&&(a=this.ls(a,b,c,d,e,f,g)),h=a===""||!!a,!d&&h&&b&&b.push(typeof a=="object"?a:b[b.length-1]),h)},d:function(a,b,c,d){var e=a.split("."),f=this.f(e[0],b,c,d),g=null;if(a==="."&&k(b[b.length-2]))return b[b.length-1];for(var h=1;h<e.length;h++)f&&typeof f=="object"&&e[h]in f?(g=f,f=f[e[h]]):f="";return d&&!f?!1:(!d&&typeof f=="function"&&(b.push(g),f=this.lv(f,b,c),b.pop()),f)},f:function(a,b,c,d){var e=!1,f=null,g=!1;for(var h=b.length-1;h>=0;h--){f=b[h];if(f&&typeof f=="object"&&a in f){e=f[a],g=!0;break}}return g?(!d&&typeof e=="function"&&(e=this.lv(e,b,c)),e):d?!1:""},ho:function(a,b,c,d,e){var f=this.c,g=this.options;g.delimiters=e;var d=a.call(b,d);return d=d==null?String(d):d.toString(),this.b(f.compile(d,g).render(b,c)),!1},b:b?function(a){this.buf.push(a)}:function(a){this.buf+=a},fl:b?function(){var a=this.buf.join("");return this.buf=[],a}:function(){var a=this.buf;return this.buf="",a},ls:function(a,b,c,d,e,f,g){var h=b[b.length-1],i=null;if(!d&&this.c&&a.length>0)return this.ho(a,h,c,this.text.substring(e,f),g);i=a.call(h);if(typeof i=="function"){if(d)return!0;if(this.c)return this.ho(i,h,c,this.text.substring(e,f),g)}return i},lv:function(a,b,c){var d=b[b.length-1],e=a.call(d);if(typeof e=="function"){e=i(e.call(d));if(this.c&&~e.indexOf("{{"))return this.c.compile(e,this.options).render(d,c)}return i(e)}};var c=/&/g,d=/</g,e=/>/g,f=/\'/g,g=/\"/g,h=/[&<>\"\']/,k=Array.isArray||function(a){return Object.prototype.toString.call(a)==="[object Array]"}})(typeof exports!="undefined"?exports:Hogan),function(a){function h(a){a.n.substr(a.n.length-1)==="}"&&(a.n=a.n.substring(0,a.n.length-1))}function i(a){return a.trim?a.trim():a.replace(/^\s*|\s*$/g,"")}function j(a,b,c){if(b.charAt(c)!=a.charAt(0))return!1;for(var d=1,e=a.length;d<e;d++)if(b.charAt(c+d)!=a.charAt(d))return!1;return!0}function k(a,b,c,d){var e=[],f=null,g=null;while(a.length>0){g=a.shift();if(g.tag=="#"||g.tag=="^"||l(g,d))c.push(g),g.nodes=k(a,g.tag,c,d),e.push(g);else{if(g.tag=="/"){if(c.length===0)throw new Error("Closing tag without opener: /"+g.n);f=c.pop();if(g.n!=f.n&&!m(g.n,f.n,d))throw new Error("Nesting error: "+f.n+" vs. "+g.n);return f.end=g.i,e}e.push(g)}}if(c.length>0)throw new Error("missing closing tag: "+c.pop().n);return e}function l(a,b){for(var c=0,d=b.length;c<d;c++)if(b[c].o==a.n)return a.tag="#",!0}function m(a,b,c){for(var d=0,e=c.length;d<e;d++)if(c[d].c==a&&c[d].o==b)return!0}function n(a){return a.replace(f,"\\\\").replace(c,'\\"').replace(d,"\\n").replace(e,"\\r")}function o(a){return~a.indexOf(".")?"d":"f"}function p(a){var b="";for(var c=0,d=a.length;c<d;c++){var e=a[c].tag;e=="#"?b+=q(a[c].nodes,a[c].n,o(a[c].n),a[c].i,a[c].end,a[c].otag+" "+a[c].ctag):e=="^"?b+=r(a[c].nodes,a[c].n,o(a[c].n)):e=="<"||e==">"?b+=s(a[c]):e=="{"||e=="&"?b+=t(a[c].n,o(a[c].n)):e=="\n"?b+=v('"\\n"'+(a.length-1==c?"":" + i")):e=="_v"?b+=u(a[c].n,o(a[c].n)):e===undefined&&(b+=v('"'+n(a[c])+'"'))}return b}function q(a,b,c,d,e,f){return"if(_.s(_."+c+'("'+n(b)+'",c,p,1),'+"c,p,0,"+d+","+e+',"'+f+'")){'+"_.rs(c,p,"+"function(c,p,_){"+p(a)+"});c.pop();}"}function r(a,b,c){return"if(!_.s(_."+c+'("'+n(b)+'",c,p,1),c,p,1,0,0,"")){'+p(a)+"};"}function s(a){return'_.b(_.rp("'+n(a.n)+'",c,p,"'+(a.indent||"")+'"));'}function t(a,b){return"_.b(_.t(_."+b+'("'+n(a)+'",c,p,0)));'}function u(a,b){return"_.b(_.v(_."+b+'("'+n(a)+'",c,p,0)));'}function v(a){return"_.b("+a+");"}var b=/\S/,c=/\"/g,d=/\n/g,e=/\r/g,f=/\\/g,g={"#":1,"^":2,"/":3,"!":4,">":5,"<":6,"=":7,_v:8,"{":9,"&":10};a.scan=function(c,d){function w(){p.length>0&&(q.push(new String(p)),p="")}function x(){var a=!0;for(var c=t;c<q.length;c++){a=q[c].tag&&g[q[c].tag]<g._v||!q[c].tag&&q[c].match(b)===null;if(!a)return!1}return a}function y(a,b){w();if(a&&x())for(var c=t,d;c<q.length;c++)q[c].tag||((d=q[c+1])&&d.tag==">"&&(d.indent=q[c].toString()),q.splice(c,1));else b||q.push({tag:"\n"});r=!1,t=q.length}function z(a,b){var c="="+v,d=a.indexOf(c,b),e=i(a.substring(a.indexOf("=",b)+1,d)).split(" ");return u=e[0],v=e[1],d+c.length-1}var e=c.length,f=0,k=1,l=2,m=f,n=null,o=null,p="",q=[],r=!1,s=0,t=0,u="{{",v="}}";d&&(d=d.split(" "),u=d[0],v=d[1]);for(s=0;s<e;s++)m==f?j(u,c,s)?(--s,w(),m=k):c.charAt(s)=="\n"?y(r):p+=c.charAt(s):m==k?(s+=u.length-1,o=g[c.charAt(s+1)],n=o?c.charAt(s+1):"_v",n=="="?(s=z(c,s),m=f):(o&&s++,m=l),r=s):j(v,c,s)?(q.push({tag:n,n:i(p),otag:u,ctag:v,i:n=="/"?r-v.length:s+u.length}),p="",s+=v.length-1,m=f,n=="{"&&(v=="}}"?s++:h(q[q.length-1]))):p+=c.charAt(s);return y(r,!0),q},a.generate=function(b,c,d){var e='var _=this;_.b(i=i||"");'+p(b)+"return _.fl();";return d.asString?"function(c,p,i){"+e+";}":new a.Template(new Function("c","p","i",e),c,a,d)},a.parse=function(a,b,c){return c=c||{},k(a,"",[],c.sectionTags||[])},a.cache={},a.compile=function(a,b){b=b||{};var c=a+"||"+!!b.asString,d=this.cache[c];return d?d:(d=this.generate(this.parse(this.scan(a,b.delimiters),a,b),a,b),this.cache[c]=d)}}(typeof exports!="undefined"?exports:Hogan);
/* jshint ignore:end */


var cached = {},
	themes = {
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

var getFeed = function(theme, cb, next) {
	if (!theme.url || !theme.format) {
		cb(); // All errors should call cb so the theme is retried next time and syncing isn't stopped
	}

	var utils = {
			Math: {
				rand: function() {
					return function(max) {
						return Math.floor(Math.random() * max);
					};
				},
				drand: function() {
					return function(max) {
						var rand = Math.sin(new Date().setHours(0, 0, 0, 0)) * 10000;

						return Math.floor((rand - Math.floor(rand)) * max);
					};
				}
			}
		};

	// These are utilities that the URL and image parse are rendered with. With them the URL can incorporate things like a random number.
	Object.getOwnPropertyNames(Math).forEach(function(e, i) {
		if (typeof Math[e] == "function") {
			utils.Math[e] = function() {
				return function(args) {
					return Math[e].apply(window, args.split(", "));
				};
			};
		}
		else {
			utils.Math[e] = Math[e];
		}
	});

	var xhr = new XMLHttpRequest();

	xhr.open("GET", Hogan.compile(theme.url).render(utils), true);

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				var d = xhr.responseText;

				try {
					if (theme.selector && theme.attr) {
						var parser = new DOMParser(),
							doc = parser.parseFromString(d, "text/xml");

						var url = doc.querySelector(theme.selector);

						if (theme.attr == "text") {
							url = url.innerText;
						}
						else if (theme.attr == "html") {
							url = url.innerHTML;
						}
						else {
							url = url.getAttribute(theme.attr);
						}

						utils.res = url;
					}
					else {
						if (typeof d == "object") {
							utils.res = d;
						}
						else {
							utils.res = JSON.parse(d);
						}
					}

					theme.image = Hogan.compile(theme.format).render(utils);

					theme.lastFetched = new Date().getTime();

					next(theme, cb);
				}
				catch(e) {
					cb();
				}
			}
			else {
				cb();
			}
		}
	};

	xhr.send(null);
};

var cache = function(theme, cb) {
	var ids = [];

	if (theme.images) {
		ids = theme.images.filter(function(e) {
			return !cached[e];
		});
	}
	else {
		ids = [theme.id];
	}

	if (!ids.length) {
		theme.offline = true;

		cached[theme.id] = theme;

		return cb();
	}

	var err = function(e) {
			if (e && e.name == "InvalidStateError") {
				return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
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
	
	var fs = window.fs;

	fs.root.getDirectory("Themes", { create: true }, function(dir) {
		var active = 0;

		ids.forEach(function(id, i) {
			active++;

			dir.getFile(id + ".jpg", { create: true }, function(fe) {
				var xhr = new XMLHttpRequest();

				xhr.open("GET", (id == theme.id && theme.type == "feed" ? theme.image : "http://themes.ichro.me/images/" + id + ".jpg"));

				xhr.responseType = "blob";

				xhr.onload = function(e) {
					if (xhr.status !== 200) {
						return err();
					}

					var blob = xhr.response;

					fe.createWriter(function(writer) {
						writer.onwrite = function(e) {
							active--;

							// This stores the image as a theme
							cached[id] = {
								id: id,
								offline: true,
								image: fe.toURL()
							};

							if (active === 0) {
								if (!theme.images) {
									theme.image = fe.toURL();
								}

								theme.offline = true;

								cached[theme.id] = theme;

								cb();
							}
						};

						writer.onerror = err;

						writer.write(blob);
					}, err);
				};

				xhr.send();
			}, err);
		});
	}, err);
};

var cacheCustom = function(arr, cb) {
	var id = arr[0],
		image = arr[1];

	if (image.indexOf("data:") === 0 || image.indexOf("filesystem:") === 0 || image.indexOf("/images") === 0) {
		return cb(image, id);
	}

	var err = function(e) {
			if (e && e.name == "InvalidStateError") {
				return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
					window.fs = fs;

					cacheCustom(arr, cb);
				}, err);
			}

			cb();
		},
		ext = image.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);

	if (ext && ext[1] && !ext[1].match(/^(jpg|png|gif|svg|webp|bmp)$/i)) {
		err();
	}

	if (!window.fs) {
		return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
			window.fs = fs;

			cacheCustom(arr, cb);
		}, err);
	}
	
	var fs = window.fs,
	xhr = new XMLHttpRequest();

	xhr.open("GET", image);

	xhr.responseType = "blob";

	fs.root.getDirectory("Themes", { create: true }, function(tDir) {
		tDir.getDirectory("Custom", { create: true }, function(dir) {
			dir.getFile(id, { create: true }, function(fe) {
				xhr.onload = function(e) {
					if (xhr.status !== 200) {
						return err();
					}

					var blob = xhr.response;

					fe.createWriter(function(writer) {
						writer.onwrite = function(e) {
							cb(fe.toURL() + "#OrigURL:" + image, id);
						};

						writer.onerror = err;

						writer.write(blob);
					}, err);
				};

				xhr.send();
			}, err);
		}, err);
	}, err);
};

var deleteCustom = function(which, cb) {
	var err = function(e) {
			if (e && e.name == "InvalidStateError") {
				return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
					window.fs = fs;

					deleteCustom(which, cb);
				}, err);
			}

			cb();
		};

	if (!window.fs) {
		return window.webkitRequestFileSystem(PERSISTENT, 500 * 1024 * 1024, function(fs) {
			window.fs = fs;

			deleteCustom(which, cb);
		}, err);
	}
	
	var fs = window.fs;

	fs.root.getDirectory("Themes", { create: true }, function(tDir) {
		tDir.getDirectory("Custom", { create: true }, function(dir) {
			if (which === true) {
				dir.removeRecursively(function() { cb(); });
			}
			else if (which.length) {
				var reader = dir.createReader(),
					length = 0;

				(function read() {
					reader.readEntries(function(results) {
						if (results.length) {
							results.forEach(function(e, i) {
								if (which.indexOf(e.name) !== -1) {
									length++;

									e.remove(function() {
										length--;

										if (!length) {
											cb();
										}
									});
								}
							});

							read();
						}
						else if (!length) {
							cb();
						}
					}, err);
				})();
			}
			else {
				cb();
			}
		}, err);
	}, err);
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
					if (key.indexOf("tabs") === 0) {
						tabs[key.substr(4) || 0] = d[key];
					}
				}

				data.tabs = JSON.parse(tabs.join(""));

				chrome.storage.local.set(d);
			}
			else {
				localStorage.installed = "true";

				link.click();
			}
		});
	}
	else if (details.reason == "update") {
		var oAuthKeys = Object.keys(localStorage).filter(function(e) {
			return e.indexOf("oauth2_") === 0;
		});

		if (oAuthKeys.length) {
			var nAuth = {};

			[
				["google", "analytics"],
				["google2", "calendar"],
				["drive", "drive"],
				["feedly", "feedly"],
				["now", "now"]
			].forEach(function(e, i) {
				if (localStorage["oauth2_" + e[0]]) {
					var parsed = JSON.parse(localStorage["oauth2_" + e[0]]);

					var converted = {
						type: "Bearer"
					};

					Object.keys(parsed).forEach(function(e, i) {
						switch (e) {
							case "accessToken":
								converted.token = parsed.accessToken;
							break;
							
							case "refreshToken":
								converted.refreshToken = parsed.refreshToken;
							break;

							case "accessTokenDate":
								if (parsed.expiresIn) {
									converted.expiry = parsed.accessTokenDate + (parsed.expiresIn * 1000);
								}
							break;
						}
					});

					if (converted.token) {
						nAuth[e[1]] = converted;
					}
				}
			});

			localStorage.oauth = JSON.stringify(nAuth);

			oAuthKeys.forEach(function(e, i) {
				delete localStorage[e];
			});
		}

		localStorage.showWhatsNew = "true";
	}
});

chrome.webRequest.onBeforeRequest.addListener(
	function(info) {
		return {
			redirectUrl: "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/index.html"
		};
	},
	{
		urls: ["http://ichro.me/redirect"]
	},
	["blocking"]
);


chrome.webRequest.onAuthRequired.addListener(
	function(info) {
		if (info.tabId !== -1 && info.scheme.toLowerCase().trim() === "basic") {
			var i = -1,
				views = chrome.extension.getViews(),
				length = views.length;

			while (++i < length) {
				if (views[i].tabId == info.tabId) {
					return {
						cancel: true
					};
				}
			}
		}
	},
	{
		urls: [ "https://mail.google.com/mail/u/*/feed/atom/" ],
		types: [ "xmlhttprequest" ]
	},
	["blocking"]
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
	uid = (localStorage.uid || (localStorage.uid = (new Date().getTime()).toString(16) + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)));

chrome.storage.onChanged.addListener(function(d, area) {
	if (area == "sync") {
		chrome.storage.local.get(["tabs", "themes", "settings", "cached"], function(old) {
			var o = {
				tabs: old.tabs,
				themes: old.themes,
				settings: old.settings
			}, themesChanged;

			var newData = {
				tabs: o.tabs,
				themes: o.themes,
				settings: o.settings
			};

			if (d.themes && d.themes.newValue && JSON.stringify(o.themes) !== JSON.stringify(d.themes.newValue)) {
				newData.themes = d.themes.newValue;

				themesChanged = true;
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
						var theme = mThemes[index[queue.pop()]];

						console.log("Caching theme " + theme.id);

						if (theme.type == "feed") {
							getFeed(theme, next, cache);
						}
						else {
							cache(theme, next);
						}
					}
					else {
						var write = function() {
							newData.cached = cached; // Has to be set here otherwise earlier difference checks will fail

							chrome.storage.local.set(newData, function() {
								chrome.extension.getViews().forEach(function(e, i) {
									e.window.location.reload();
								});
							});
						};

						if (themesChanged) {
							var urls = [],
								nUrls = [],
								cUrls = [],
								del = [];

							o.themes.forEach(function(e, i) {
								if (e.image && e.image.indexOf("#OrigURL:") !== -1) {
									urls.push([i, e.image.split("#OrigURL:")[1]]);
								}
								else {
									urls.push([i, null]);
								}
							});

							newData.themes.forEach(function(e, i) {
								if (e.image && (e.image.indexOf("#OrigURL:") !== -1 || e.image.indexOf("http") === 0)) {
									if (e.image.indexOf("http") === 0) {
										nUrls.push([i, e.image]);
									}
									else {
										nUrls.push([i, e.image.split("#OrigURL:")[1]]);
									}
								}
								else {
									nUrls.push([i, null]);
								}
							});

							// Sort both arrays so the join will be accurate
							urls.sort(function(a, b) { return a[0] - b[0]; });
							nUrls.sort(function(a, b) { return a[0] - b[0]; });

							// There's no way to know if two have been deleted and one added, etc.  The safest thing to do is simply recache all themes.
							if (urls.length !== nUrls.length) {
								cUrls = nUrls.filter(function(e) { return !!e[1]; }); // Filter out nulls
								del = true;
							}
							else if (urls.join() !== nUrls.join()) {
								urls.forEach(function(e, i) {
									if (e[1] !== nUrls[i][1]) {
										if (!nUrls[i][1]) { // The image is null, therefore it was deleted
											del.push(i);
										}
										else {
											cUrls.push(nUrls[i]);
										}
									}
								});
							}
							else {
								write();
							}

							var loop = function(image, id) {
								if (image && typeof id !== "undefined") {
									console.log("Cached custom theme " + id);

									newData.themes[id].image = image;
								}

								if (cUrls.length) {
									cacheCustom(cUrls.pop(), loop);
								}
								else {
									write();
								}
							};

							if (del === true || del.length) {
								deleteCustom(del, loop);
							}
							else if (cUrls.length) {
								loop();
							}
							else {
								write();
							}
						}
						else {
							write();
						}
					}
				},
				mThemes = [],
				index = {};

				if (queue.length) {
					var xhr = new XMLHttpRequest();

					xhr.open("GET", "http://themes.ichro.me/manifest.json", true);

					xhr.onreadystatechange = function() {
						if (xhr.readyState == 4 && xhr.status == 200) {
							var d = JSON.parse(xhr.responseText).themes;

							d.forEach(function(e, i) {
								index[e.id] = mThemes.length;

								delete e.size;
								delete e.stats;
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
						if (key.indexOf("tabs") === 0) {
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

/* exported setReload */
var setReload = function() {
	setTimeout(function() {
		location.reload();
	}, 800); // This leaves time for the onHeadersReceived listener to still function when reloading the page
};

var refreshFeeds = function() {
	chrome.storage.local.get("cached", function(d) {
		if (d.cached) {
			cached = d.cached;
			
			var active = 0,
				start = new Date().getTime() - 1000 * 60 * 60 * 24,
				key;

			for (key in cached) {
				var theme = cached[key];

				if (theme.type == "feed" || (theme.oType && theme.oType == "feed") && ((theme.lastFetched && theme.lastFetched <= start) || !theme.lastFetched)) {
					active++;

					console.log("Updating cached theme " + key + ", last fetched on " + new Date(theme.lastFetched));

					getFeed(theme, function() {
						active--;

						if (active === 0) {
							chrome.storage.local.set({
								cached: cached
							});
						}
					}, cache);
				}
			}
		}
	});
};

setInterval(refreshFeeds, 18E5);

refreshFeeds();