var eventQueue = [],
	authData, userType;

try {
	authData = JSON.parse(localStorage.authData);

	userType = authData.isPro ? "Pro" : authData.adFree ? "Ad-free" : !!authData.user ? "Signed in" : "Anonymous";
}
catch (e) {}

/* globals FB,chrome,PERSISTENT */

var logFBEvent = function(name, value, params) {
	params = params || {};

	params.userType = userType;

	if (FB && FB.AppEvents) {
		FB.AppEvents.logEvent(name, value, params);
	}
	else {
		eventQueue.push([name, value, params]);
	}
};
window.fbAsyncInit = function() {
	FB.init({
		appId: "1646068945432680",
		xfbml: false,
		version: "v2.10"
	});

	FB.AppEvents.setAppVersion(chrome.runtime.getManifest().version + "-" + (chrome.i18n.getMessage("@@extension_id") === "iccjgbbjckehppnpajnmplcccjcgbdep" ? "nt" : "hp"));

	if (authData && authData.user) {
		FB.AppEvents.setUserID(authData.user);
	}
	else {
		if (!localStorage.uuid) {
			function s4() { // jshint ignore:line
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			}

			localStorage.uuid = s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
		}

		FB.AppEvents.setUserID(localStorage.uuid);
	}

	try {
		FB.AppEvents.updateUserProperties({
			"$user_type": userType
		});
	}
	catch (e) {}

	logFBEvent("BackgroundLoad");

	if (eventQueue.length) {
		eventQueue.forEach(function(e) {
			FB.AppEvents.logEvent(e[0], e[1], e[2]);
		});
	}
};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));

/**
* @preserve Copyright 2012 Twitter, Inc.
* @license http://www.apache.org/licenses/LICENSE-2.0.txt
*/
var Hogan={};
/* jshint ignore:start */
(function(a,b){function i(a){return String(a===null||a===undefined?"":a)}function j(a){return a=i(a),h.test(a)?a.replace(c,"&amp;").replace(d,"&lt;").replace(e,"&gt;").replace(f,"&#39;").replace(g,"&quot;"):a}a.Template=function(a,c,d,e){this.r=a||this.r,this.c=d,this.options=e,this.text=c||"",this.buf=b?[]:""},a.Template.prototype={r:function(a,b,c){return""},v:j,t:i,render:function(b,c,d){return this.ri([b],c||{},d)},ri:function(a,b,c){return this.r(a,b,c)},rp:function(a,b,c,d){var e=c[a];return e?(this.c&&typeof e=="string"&&(e=this.c.compile(e,this.options)),e.ri(b,c,d)):""},rs:function(a,b,c){var d=a[a.length-1];if(!k(d)){c(a,b,this);return}for(var e=0;e<d.length;e++)a.push(d[e]),c(a,b,this),a.pop()},s:function(a,b,c,d,e,f,g){var h;return k(a)&&a.length===0?!1:(typeof a=="function"&&(a=this.ls(a,b,c,d,e,f,g)),h=a===""||!!a,!d&&h&&b&&b.push(typeof a=="object"?a:b[b.length-1]),h)},d:function(a,b,c,d){var e=a.split("."),f=this.f(e[0],b,c,d),g=null;if(a==="."&&k(b[b.length-2]))return b[b.length-1];for(var h=1;h<e.length;h++)f&&typeof f=="object"&&e[h]in f?(g=f,f=f[e[h]]):f="";return d&&!f?!1:(!d&&typeof f=="function"&&(b.push(g),f=this.lv(f,b,c),b.pop()),f)},f:function(a,b,c,d){var e=!1,f=null,g=!1;for(var h=b.length-1;h>=0;h--){f=b[h];if(f&&typeof f=="object"&&a in f){e=f[a],g=!0;break}}return g?(!d&&typeof e=="function"&&(e=this.lv(e,b,c)),e):d?!1:""},ho:function(a,b,c,d,e){var f=this.c,g=this.options;g.delimiters=e;var d=a.call(b,d);return d=d==null?String(d):d.toString(),this.b(f.compile(d,g).render(b,c)),!1},b:b?function(a){this.buf.push(a)}:function(a){this.buf+=a},fl:b?function(){var a=this.buf.join("");return this.buf=[],a}:function(){var a=this.buf;return this.buf="",a},ls:function(a,b,c,d,e,f,g){var h=b[b.length-1],i=null;if(!d&&this.c&&a.length>0)return this.ho(a,h,c,this.text.substring(e,f),g);i=a.call(h);if(typeof i=="function"){if(d)return!0;if(this.c)return this.ho(i,h,c,this.text.substring(e,f),g)}return i},lv:function(a,b,c){var d=b[b.length-1],e=a.call(d);if(typeof e=="function"){e=i(e.call(d));if(this.c&&~e.indexOf("{{"))return this.c.compile(e,this.options).render(d,c)}return i(e)}};var c=/&/g,d=/</g,e=/>/g,f=/\'/g,g=/\"/g,h=/[&<>\"\']/,k=Array.isArray||function(a){return Object.prototype.toString.call(a)==="[object Array]"}})(typeof exports!="undefined"?exports:Hogan),function(a){function h(a){a.n.substr(a.n.length-1)==="}"&&(a.n=a.n.substring(0,a.n.length-1))}function i(a){return a.trim?a.trim():a.replace(/^\s*|\s*$/g,"")}function j(a,b,c){if(b.charAt(c)!=a.charAt(0))return!1;for(var d=1,e=a.length;d<e;d++)if(b.charAt(c+d)!=a.charAt(d))return!1;return!0}function k(a,b,c,d){var e=[],f=null,g=null;while(a.length>0){g=a.shift();if(g.tag=="#"||g.tag=="^"||l(g,d))c.push(g),g.nodes=k(a,g.tag,c,d),e.push(g);else{if(g.tag=="/"){if(c.length===0)throw new Error("Closing tag without opener: /"+g.n);f=c.pop();if(g.n!=f.n&&!m(g.n,f.n,d))throw new Error("Nesting error: "+f.n+" vs. "+g.n);return f.end=g.i,e}e.push(g)}}if(c.length>0)throw new Error("missing closing tag: "+c.pop().n);return e}function l(a,b){for(var c=0,d=b.length;c<d;c++)if(b[c].o==a.n)return a.tag="#",!0}function m(a,b,c){for(var d=0,e=c.length;d<e;d++)if(c[d].c==a&&c[d].o==b)return!0}function n(a){return a.replace(f,"\\\\").replace(c,'\\"').replace(d,"\\n").replace(e,"\\r")}function o(a){return~a.indexOf(".")?"d":"f"}function p(a){var b="";for(var c=0,d=a.length;c<d;c++){var e=a[c].tag;e=="#"?b+=q(a[c].nodes,a[c].n,o(a[c].n),a[c].i,a[c].end,a[c].otag+" "+a[c].ctag):e=="^"?b+=r(a[c].nodes,a[c].n,o(a[c].n)):e=="<"||e==">"?b+=s(a[c]):e=="{"||e=="&"?b+=t(a[c].n,o(a[c].n)):e=="\n"?b+=v('"\\n"'+(a.length-1==c?"":" + i")):e=="_v"?b+=u(a[c].n,o(a[c].n)):e===undefined&&(b+=v('"'+n(a[c])+'"'))}return b}function q(a,b,c,d,e,f){return"if(_.s(_."+c+'("'+n(b)+'",c,p,1),'+"c,p,0,"+d+","+e+',"'+f+'")){'+"_.rs(c,p,"+"function(c,p,_){"+p(a)+"});c.pop();}"}function r(a,b,c){return"if(!_.s(_."+c+'("'+n(b)+'",c,p,1),c,p,1,0,0,"")){'+p(a)+"};"}function s(a){return'_.b(_.rp("'+n(a.n)+'",c,p,"'+(a.indent||"")+'"));'}function t(a,b){return"_.b(_.t(_."+b+'("'+n(a)+'",c,p,0)));'}function u(a,b){return"_.b(_.v(_."+b+'("'+n(a)+'",c,p,0)));'}function v(a){return"_.b("+a+");"}var b=/\S/,c=/\"/g,d=/\n/g,e=/\r/g,f=/\\/g,g={"#":1,"^":2,"/":3,"!":4,">":5,"<":6,"=":7,_v:8,"{":9,"&":10};a.scan=function(c,d){function w(){p.length>0&&(q.push(new String(p)),p="")}function x(){var a=!0;for(var c=t;c<q.length;c++){a=q[c].tag&&g[q[c].tag]<g._v||!q[c].tag&&q[c].match(b)===null;if(!a)return!1}return a}function y(a,b){w();if(a&&x())for(var c=t,d;c<q.length;c++)q[c].tag||((d=q[c+1])&&d.tag==">"&&(d.indent=q[c].toString()),q.splice(c,1));else b||q.push({tag:"\n"});r=!1,t=q.length}function z(a,b){var c="="+v,d=a.indexOf(c,b),e=i(a.substring(a.indexOf("=",b)+1,d)).split(" ");return u=e[0],v=e[1],d+c.length-1}var e=c.length,f=0,k=1,l=2,m=f,n=null,o=null,p="",q=[],r=!1,s=0,t=0,u="{{",v="}}";d&&(d=d.split(" "),u=d[0],v=d[1]);for(s=0;s<e;s++)m==f?j(u,c,s)?(--s,w(),m=k):c.charAt(s)=="\n"?y(r):p+=c.charAt(s):m==k?(s+=u.length-1,o=g[c.charAt(s+1)],n=o?c.charAt(s+1):"_v",n=="="?(s=z(c,s),m=f):(o&&s++,m=l),r=s):j(v,c,s)?(q.push({tag:n,n:i(p),otag:u,ctag:v,i:n=="/"?r-v.length:s+u.length}),p="",s+=v.length-1,m=f,n=="{"&&(v=="}}"?s++:h(q[q.length-1]))):p+=c.charAt(s);return y(r,!0),q},a.generate=function(b,c,d){var e='var _=this;_.b(i=i||"");'+p(b)+"return _.fl();";return d.asString?"function(c,p,i){"+e+";}":new a.Template(new Function("c","p","i",e),c,a,d)},a.parse=function(a,b,c){return c=c||{},k(a,"",[],c.sectionTags||[])},a.cache={},a.compile=function(a,b){b=b||{};var c=a+"||"+!!b.asString,d=this.cache[c];return d?d:(d=this.generate(this.parse(this.scan(a,b.delimiters),a,b),a,b),this.cache[c]=d)}}(typeof exports!="undefined"?exports:Hogan);
/* jshint ignore:end */


// Capture the localStorage length before we make any modifications
var storageLength = localStorage.length;

if (!storageLength) {
	localStorage.firstRun = "true";

	logFBEvent("BackgroundInstall");

	navigator.sendBeacon("https://stats.ichro.me/ingest?" +
		"extension=" + chrome.i18n.getMessage("@@extension_id") + "&version=" + chrome.runtime.getManifest().version + "&lang=" + chrome.i18n.getMessage("lang_code"),
		new Blob([
			JSON.stringify([["install", new Date().getTime()]])
		], {
			type: "text/plain"
		})
	);

	chrome.tabs.create({
		url: "index.html"
	});
}
else if (!localStorage.version || localStorage.version !== chrome.runtime.getManifest().version) {
	if (!localStorage.config) {
		chrome.storage.local.get(["tabs", "settings", "themes", "cached"], function(d) {
			if (typeof d.tabs === "string") {
				try {
					d.tabs = JSON.parse(d.tabs);
				}
				catch(e) {
					return;
				}
			}

			localStorage.config = JSON.stringify(d);

			chrome.storage.local.remove(["tabs", "settings", "themes", "cached"]);
			chrome.storage.sync.remove(["tabs", "settings", "themes", "cached"]);

			chrome.tabs.create({
				url: "index.html"
			});
		});
	}

	if (localStorage.syncData) {
		// Clear old sync system data
		chrome.cookies.remove({
			name: "sync_data_main",
			url: "http://ichro.me"
		});

		chrome.storage.sync.remove("syncData");
	}
}

if (storageLength && (!localStorage.firstRun || localStorage.firstRun !== "true") && (!localStorage.version || localStorage.version.indexOf("3.0.0") !== 0)) {
	localStorage.showUpdated = "true";
	localStorage.showSignInNotice = "true";
}

localStorage.version = chrome.runtime.getManifest().version;

var appURL = chrome.extension.getURL("index.html");

chrome.browserAction.onClicked.addListener(function() {
	logFBEvent("ActionClicked");

	chrome.tabs.create({
		url: appURL
	});
});

chrome.webRequest.onBeforeRequest.addListener(
	function() {
		return {
			redirectUrl: "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/index.html"
		};
	},
	{
		urls: ["http://ichro.me/redirect"]
	},
	["blocking"]
);

/**
 * Uninstallation URL
 */
chrome.runtime.setUninstallURL("https://ichro.me/uninstall?" +
	"extension=" + chrome.i18n.getMessage("@@extension_id") + "&version=" + chrome.runtime.getManifest().version + "&lang=" + chrome.i18n.getMessage("lang_code")
);

/**
 * Feed refresh manager
 */
var cached;

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
	Object.getOwnPropertyNames(Math).forEach(function(e) {
		if (typeof Math[e] === "function") {
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
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				var d = xhr.responseText;

				try {
					var doc;

					if (theme.selector && theme.attr) {
						var parser = new DOMParser();

						doc = parser.parseFromString(d, "text/xml");

						var url = doc.querySelector(theme.selector);

						if (theme.attr === "text") {
							url = url.textContent;
						}
						else if (theme.attr === "html") {
							url = url.innerHTML;
						}
						else {
							url = url.getAttribute(theme.attr);
						}

						utils.res = url;
					}
					else {
						if (typeof d === "object") {
							utils.res = d;
						}
						else {
							utils.res = JSON.parse(d);
						}
					}

					// Special case handling until a better theme system can be implemented with ServiceWorker
					try {
						if (theme.id === 0) {
							theme.currentImage = {
								name: utils.res.name,
								url: utils.res.sourceUrl,
								source: (utils.res.author || "") + (utils.res.author && (utils.res.copyright || utils.res.source) ? " — " : "") + (utils.res.copyright || utils.res.source || "")
							};
						}
						else if ((theme.id === 82 || theme.id === 83) && utils.res.images && utils.res.images[0] && utils.res.images[0].copyright) {
							theme.currentImage = {
								source: utils.res.images[0].copyrightsource,
								name: utils.res.images[0].copyright.replace(utils.res.images[0].copyrightsource, "").replace(/\(\s*?\)/g, "").trim()
							};
						}
						else if (theme.id === 84 && utils.res.free && utils.res.free[0]) {
							theme.currentImage = {
								name: utils.res.free[0].title,
								source: utils.res.free[0].vendor
							};
						}
						else if (theme.id === 86) {
							theme.currentImage = {
								name: doc.querySelector("item title").textContent,
								source: doc.querySelector("item source").textContent,
								desc: doc.querySelector("item description").textContent,
								url: doc.querySelector("item guid").textContent
							};
						}
					}
					catch (e) {}

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
			if (e && e.name === "InvalidStateError") {
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

		ids.forEach(function(id) {
			active++;

			dir.getFile(id + ".jpg", { create: true }, function(fe) {
				var xhr = new XMLHttpRequest();

				xhr.open("GET", (id === theme.id && (theme.type === "feed" || (theme.oType && theme.oType === "feed")) ? theme.image : "https://themes.ichro.me/images/" + id + ".jpg"));

				xhr.responseType = "blob";

				xhr.onload = function() {
					if (xhr.status !== 200) {
						return err();
					}

					var blob = xhr.response;

					fe.createWriter(function(writer) {
						writer.onwrite = function() {
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

var refreshFeeds = function() {
	var d = JSON.parse(localStorage.config || "{}");

	cached = d.cached || {};

	if (!cached[0]) {
		cached[0] = {
			id: 0,
			type: "feed",
			offline: true,
			name: "Default theme",
			format: "{{res.url}}",
			image: "images/defaulttheme.jpg",
			url: "https://api.ichro.me/themes/v1/default/getImage"
		};
	}

	var active = 0,
		start = new Date().getTime() - 60 * 60 * 1000,
		key;

	for (key in cached) {
		if (cached.hasOwnProperty(key)) {
			var theme = cached[key];

			if ((theme.type === "feed" || (theme.oType && theme.oType === "feed")) && ((theme.lastFetched && theme.lastFetched <= start) || !theme.lastFetched)) {
				active++;

				console.log("Updating cached theme " + key + ", last fetched on " + new Date(theme.lastFetched));

				getFeed(theme, function() { // jshint ignore:line
					active--;

					if (active === 0) {
						var d = JSON.parse(localStorage.config || "{}");

						d.cached = cached;

						localStorage.config = JSON.stringify(d);
					}
				}, cache);
			}
		}
	}
};

setInterval(refreshFeeds, 60 * 60 * 1000);

refreshFeeds();