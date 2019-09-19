/*
 * The Twitter widget.
 */
define(["jquery", "moment", "browser/api"], function($, moment, Browser) {
	return {
		id: 26,
		sort: 200,
		size: 1,
		order: 15,
		interval: 300000,
		nicename: "twitter",
		sizes: ["variable"],
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "i18n.settings.title",
				placeholder: "i18n.settings.title_placeholder"
			},
			{
				type: "select",
				nicename: "source",
				label: "i18n.settings.source",
				options: "getSources"
			},
			{
				type: "number",
				nicename: "tweets",
				label: "i18n.settings.show",
				min: 1,
				max: 10
			}
		],
		config: {
			source: "home",
			title: "i18n.name",
			size: "variable",
			tweets: "5"
		},
		data: {
			tweets: [
				{
					id: "453275760728367104",
					content: "Video: What are Games Developers looking for in the Cloud? <a href=\"http://t.co/V4qdADsn5m\" target=\"_blank\">goo.gl/R9Strw</a>  /by <a href=\"http://www.twitter.com/tekgrrl\" target=\"_blank\" title=\"Mandy Waite\">@tekgrrl</a> <a href=\"http://www.twitter.com/search?q=%23gaming&amp;src=hash\" target=\"_blank\">#gaming</a> <a href=\"http://www.twitter.com/search?q=%23cloud&amp;src=hash\" target=\"_blank\">#cloud</a> <a href=\"http://www.twitter.com/search?q=%23developers&amp;src=hash\" target=\"_blank\">#developers</a>",
					user: "Google Developers",
					username: "googledevs",
					image: "https://pbs.twimg.com/profile_images/440636713354817536/I_Z3SDmE_normal.png",
					age: 1396904337000
				},
				{
					id: "453275245143916545",
					content: "Explore archives &amp; exhibits about Tezuka Osamu, the godfather of <a href=\"http://www.twitter.com/search?q=%23manga&amp;src=hash\" target=\"_blank\">#manga</a>. <a href=\"http://t.co/QyYNRCnmuf\" target=\"_blank\">goo.gl/LeHLIa</a>",
					user: "A Googler",
					username: "google",
					image: "https://pbs.twimg.com/profile_images/2504370963/6u5qf6cl9jtwew6poxcj_normal.png",
					age: 1396904214000
				},
				{
					id: "453238414838493185",
					content: "New video from <a href=\"http://www.twitter.com/ade_oshineye\" target=\"_blank\" title=\"Adewale Oshineye\">@ade_oshineye</a>: Grow with Google(+) <a href=\"http://t.co/uuyw94RFFh\" target=\"_blank\">goo.gl/5lU7Hs</a>",
					user: "Google Developers",
					username: "googledevs",
					image: "https://pbs.twimg.com/profile_images/440636713354817536/I_Z3SDmE_normal.png",
					age: 1396895433000
				},
				{
					id: "452513890287370241",
					content: "RT <a href=\"http://www.twitter.com/jaffathecake\" target=\"_blank\" title=\"Jake Archibald\">@jaffathecake</a>: The Extensible Web Summit was bloody great &amp; should be done again. Notes at <a href=\"http://t.co/wdQIaH9G6i\" target=\"_blank\">lanyrd.com/2014/extensibl…</a> - nice one <a href=\"http://www.twitter.com/torgo\" target=\"_blank\" title=\"Daniel Appelquist\">@torgo</a> <a href=\"http://www.twitter.com/annevk\" target=\"_blank\" title=\"Anne van Kesteren\">@annevk</a> <a href=\"http://www.twitter.com/domenic\" target=\"_blank\" title=\"Domenic Denicola\">@domenic</a> et al",
					user: "Google Developers",
					username: "googledevs",
					image: "https://pbs.twimg.com/profile_images/440636713354817536/I_Z3SDmE_normal.png",
					age: 1396722693000
				},
				{
					id: "452161945513103360",
					content: "RT <a href=\"http://www.twitter.com/addyosmani\" target=\"_blank\" title=\"Addy Osmani\">@addyosmani</a>: Writing Accessible Web Components: <a href=\"http://t.co/Tlkl7ucRsK\" target=\"_blank\">polymer-project.org/articles/acces…</a> - Part 1 of a new guide by <a href=\"http://www.twitter.com/sundress\" target=\"_blank\" title=\"Alice Boxhall\">@sundress</a> and I. <a href=\"http://www.twitter.com/search?q=%23a11y&amp;src=hash\" target=\"_blank\">#a11y</a>",
					user: "Google Developers",
					username: "googledevs",
					image: "https://pbs.twimg.com/profile_images/440636713354817536/I_Z3SDmE_normal.png",
					age: 1396638783000
				}
			]
		},
		getSources: function(cb) {
			if (!this.config.token) {
				return cb({ "home": this.utils.translate("authorize") });
			}

			this.ajax({
				type: "GET",
				url: "https://api.twitter.com/1.1/lists/list.json",
				success: function(d) {
					var sources = {
						home: this.utils.translate("home"),
						mentions: this.utils.translate("mentions"),
						retweets: this.utils.translate("retweets")
					};

					if (d && d.length) {
						sources.lists = {
							label: this.utils.translate("lists")
						};

						d.forEach(function(e) {
							sources.lists[e.id_str] = e.name;
						});
					}

					cb(sources);
				}.bind(this)
			});
		},
		authorize: function(e) {
			e.preventDefault();

			var getFinal = function(token, secret, verifier) {
				this.ajax({
					type: "POST",
					data: {
						oauth_verifier: verifier
					},
					url: "https://api.twitter.com/oauth/access_token",
					success: function(d) {
						if (d && d.indexOf("&") !== -1) {
							var t = d.split("&"),
								token = "",
								secret = "";

							t.forEach(function(e) {
								var split = e.split("=");

								if (split[0] === "oauth_token") {
									token = split[1];
								}
								else if (split[0] === "oauth_token_secret") {
									secret = split[1];
								}
							});

							if (token && secret) {
								this.config.token = token;
								this.config.secret = secret;

								this.utils.saveConfig(this.config);

								this.refresh();
							}
						}
					}.bind(this)
				}, token, secret);
			}.bind(this);

			this.ajax({
				type: "POST",
				data: {
					oauth_callback: "http://www.ichro.me/twitter_redirect"
				},
				url: "https://api.twitter.com/oauth/request_token",
				success: function(d) {
					if (d && d.indexOf("&") !== -1) {
						var t = d.split("&"),
							token = "",
							secret = "";

						t.forEach(function(e) {
							var split = e.split("=");

							if (split[0] === "oauth_token") {
								token = split[1];
							}
							else if (split[0] === "oauth_token_secret") {
								secret = split[1];
							}
						});

						if (token && secret) {
							var a = document.createElement("a");

							a.target = "_blank";
							a.href = "https://api.twitter.com/oauth/authorize?oauth_token=" + token;

							a.click();

							Browser.webRequest.onBeforeRequest.addListener(
								function extract(info) {
									Browser.webRequest.onBeforeRequest.removeListener(extract);

									var verifier = info.url.match(/[&\?]oauth_verifier=([^&]+)/)[1];

									if (verifier) {
										getFinal(token, secret, verifier);

										Browser.tabs.remove(info.tabId);
									}
								},
								{
									urls: [ "http://www.ichro.me/twitter_redirect*" ]
								},
								["blocking", "requestBody"]
							);
						}
					}
				}
			}, false);
		},
		ajax: function(options, t, s) {
			var token = t || this.config.token || "",
				secret = s || this.config.secret || "";

			var CryptoJS = this.CryptoJS;

			if (!this.CryptoJS) {
				/*
					CryptoJS v3.1.2
					code.google.com/p/crypto-js
					(c) 2009-2013 by Jeff Mott. All rights reserved.
					code.google.com/p/crypto-js/wiki/License
				*/
				/* jshint ignore:start */
				CryptoJS=CryptoJS||function(g,l){var e={},d=e.lib={},m=function(){},k=d.Base={extend:function(a){m.prototype=this;var c=new m;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
				p=d.WordArray=k.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=l?c:4*a.length},toString:function(a){return(a||n).stringify(this)},concat:function(a){var c=this.words,q=a.words,f=this.sigBytes;a=a.sigBytes;this.clamp();if(f%4)for(var b=0;b<a;b++)c[f+b>>>2]|=(q[b>>>2]>>>24-8*(b%4)&255)<<24-8*((f+b)%4);else if(65535<q.length)for(b=0;b<a;b+=4)c[f+b>>>2]=q[b>>>2];else c.push.apply(c,q);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
				32-8*(c%4);a.length=g.ceil(c/4)},clone:function(){var a=k.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],b=0;b<a;b+=4)c.push(4294967296*g.random()|0);return new p.init(c,a)}}),b=e.enc={},n=b.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],f=0;f<a;f++){var d=c[f>>>2]>>>24-8*(f%4)&255;b.push((d>>>4).toString(16));b.push((d&15).toString(16))}return b.join("")},parse:function(a){for(var c=a.length,b=[],f=0;f<c;f+=2)b[f>>>3]|=parseInt(a.substr(f,
				2),16)<<24-4*(f%8);return new p.init(b,c/2)}},j=b.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],f=0;f<a;f++)b.push(String.fromCharCode(c[f>>>2]>>>24-8*(f%4)&255));return b.join("")},parse:function(a){for(var c=a.length,b=[],f=0;f<c;f++)b[f>>>2]|=(a.charCodeAt(f)&255)<<24-8*(f%4);return new p.init(b,c)}},h=b.Utf8={stringify:function(a){try{return decodeURIComponent(escape(j.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return j.parse(unescape(encodeURIComponent(a)))}},
				r=d.BufferedBlockAlgorithm=k.extend({reset:function(){this._data=new p.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=h.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,b=c.words,f=c.sigBytes,d=this.blockSize,e=f/(4*d),e=a?g.ceil(e):g.max((e|0)-this._minBufferSize,0);a=e*d;f=g.min(4*a,f);if(a){for(var k=0;k<a;k+=d)this._doProcessBlock(b,k);k=b.splice(0,a);c.sigBytes-=f}return new p.init(k,f)},clone:function(){var a=k.clone.call(this);
				a._data=this._data.clone();return a},_minBufferSize:0});d.Hasher=r.extend({cfg:k.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){r.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(b,d){return(new a.init(d)).finalize(b)}},_createHmacHelper:function(a){return function(b,d){return(new s.HMAC.init(a,
				d)).finalize(b)}}});var s=e.algo={};return e}(Math);
				(function(){var g=CryptoJS,l=g.lib,e=l.WordArray,d=l.Hasher,m=[],l=g.algo.SHA1=d.extend({_doReset:function(){this._hash=new e.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(d,e){for(var b=this._hash.words,n=b[0],j=b[1],h=b[2],g=b[3],l=b[4],a=0;80>a;a++){if(16>a)m[a]=d[e+a]|0;else{var c=m[a-3]^m[a-8]^m[a-14]^m[a-16];m[a]=c<<1|c>>>31}c=(n<<5|n>>>27)+l+m[a];c=20>a?c+((j&h|~j&g)+1518500249):40>a?c+((j^h^g)+1859775393):60>a?c+((j&h|j&g|h&g)-1894007588):c+((j^h^
				g)-899497514);l=g;g=h;h=j<<30|j>>>2;j=n;n=c}b[0]=b[0]+n|0;b[1]=b[1]+j|0;b[2]=b[2]+h|0;b[3]=b[3]+g|0;b[4]=b[4]+l|0},_doFinalize:function(){var d=this._data,e=d.words,b=8*this._nDataBytes,g=8*d.sigBytes;e[g>>>5]|=128<<24-g%32;e[(g+64>>>9<<4)+14]=Math.floor(b/4294967296);e[(g+64>>>9<<4)+15]=b;d.sigBytes=4*e.length;this._process();return this._hash},clone:function(){var e=d.clone.call(this);e._hash=this._hash.clone();return e}});g.SHA1=d._createHelper(l);g.HmacSHA1=d._createHmacHelper(l)})();
				(function(){var g=CryptoJS,l=g.enc.Utf8;g.algo.HMAC=g.lib.Base.extend({init:function(e,d){e=this._hasher=new e.init;"string"==typeof d&&(d=l.parse(d));var g=e.blockSize,k=4*g;d.sigBytes>k&&(d=e.finalize(d));d.clamp();for(var p=this._oKey=d.clone(),b=this._iKey=d.clone(),n=p.words,j=b.words,h=0;h<g;h++)n[h]^=1549556828,j[h]^=909522486;p.sigBytes=b.sigBytes=k;this.reset()},reset:function(){var e=this._hasher;e.reset();e.update(this._iKey)},update:function(e){this._hasher.update(e);return this},finalize:function(e){var d=
				this._hasher;e=d.finalize(e);d.reset();return d.finalize(this._oKey.clone().concat(e))}})})();
				(function(){var h=CryptoJS,i=h.lib.WordArray;h.enc.Base64={stringify:function(b){var e=b.words,f=b.sigBytes,c=this._map;b.clamp();for(var b=[],a=0;a<f;a+=3)for(var d=(e[a>>>2]>>>24-8*(a%4)&255)<<16|(e[a+1>>>2]>>>24-8*((a+1)%4)&255)<<8|e[a+2>>>2]>>>24-8*((a+2)%4)&255,g=0;4>g&&a+0.75*g<f;g++)b.push(c.charAt(d>>>6*(3-g)&63));if(e=c.charAt(64))for(;b.length%4;)b.push(e);return b.join("")},parse:function(b){var b=b.replace(/\s/g,""),e=b.length,f=this._map,c=f.charAt(64);c&&(c=b.indexOf(c),-1!=c&&(e=c));
				for(var c=[],a=0,d=0;d<e;d++)if(d%4){var g=f.indexOf(b.charAt(d-1))<<2*(d%4),h=f.indexOf(b.charAt(d))>>>6-2*(d%4);c[a>>>2]|=(g|h)<<24-8*(a%4);a++}return i.create(c,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}})();
				/* jshint ignore:end */

				this.CryptoJS = CryptoJS;
			}

			var method = (options.type || "GET").toUpperCase(),
				code = "",
				key, url,
				parameters = {};

			// Parse parameters
			if (options.data) {
				url = options.url;
				parameters = options.data;
			}
			else {
				url = options.url.split("?");

				((url && url[1]) || "").split("&").forEach(function(e) {
					var param = e.split("=");

					if (param[0]) {
						parameters[param[0]] = param[1] || "";
					}
				});

				url = url[0];
			}

			// Generate nonce
			for (var i = 0; i < 33; i++) {
				code += Math.floor((Math.random() * 100) % 10);
			}

			// Set parameters
			var consumer_key = "nYjEzkjKdyWotLXmbSjjA",
				nonce = encodeURIComponent(btoa(code)),
				timestamp = Math.floor(new Date().getTime() / 1000);

			token = encodeURIComponent(token);

			var params = [
				"oauth_consumer_key=" + consumer_key,
				"oauth_nonce=" + nonce,
				"oauth_signature_method=HMAC-SHA1",
				"oauth_timestamp=" + timestamp,
				"oauth_version=1.0",
				"oauth_token=" + (token || "")
			];

			// Encode parameters
			for (key in parameters) {
				if (parameters.hasOwnProperty(key)) {
					params.push(encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key]));
				}
			}

			// Build base string
			var baseString = method + "&" + encodeURIComponent(url) + "&" +
				encodeURIComponent(params.sort(function(a, b) { return a < b ? -1 : a > b; }).join("&"));

			// Generate signature
			var signature = CryptoJS.HmacSHA1(baseString, "__API_KEY_twitter__" + "&" + encodeURIComponent(secret)).toString(CryptoJS.enc.Base64);

			// Generate OAuth header
			options.beforeSend = function(xhr) {
				xhr.setRequestHeader("Authorization", 'OAuth ' +
					'oauth_consumer_key="' + consumer_key + '", ' +
					'oauth_nonce="' + nonce + '", ' +
					'oauth_signature="' + encodeURIComponent(signature) + '", ' +
					'oauth_signature_method="HMAC-SHA1", ' +
					'oauth_timestamp="' + timestamp + '", ' +
					'oauth_token="' + (token || "") + '", ' +
					'oauth_version="1.0"');

			};

			// Send request
			return $.ajax(options);
		},
		refresh: function() {
			if (!this.config.token) {
				return this.render("authorize");
			}

			var url = "",
				source = this.config.source;

			if (source === "home" || !source) {
				url = "https://api.twitter.com/1.1/statuses/home_timeline.json?tweet_mode=extended&";
			}
			else if (source === "retweets") {
				url = "https://api.twitter.com/1.1/statuses/retweets_of_me.json?tweet_mode=extended&";
			}
			else if (source === "mentions") {
				url = "https://api.twitter.com/1.1/statuses/mentions_timeline.json?tweet_mode=extended&";
			}
			else {
				url = "https://api.twitter.com/1.1/lists/statuses.json?tweet_mode=extended&list_id=" + source + "&";
			}

			this.ajax({
				type: "GET",
				url: url + "count=" + (this.config.tweets || 5),	
				success: function(d) {
					var tweets = [];

					if (d && d.forEach) {
						var hEscape = function(str) {
							str = String(str || "");

							// Based off of Hogan.js' escape method
							var amp		= /&/g,
								lt		= /</g,
								gt		= />/g,
								apos	= /\'/g,
								quot	= /\"/g,
								brace	= /\{/g,
								all		= /[&<>\{\"\']/;

							if (all.test(str)) {
								return str.replace(amp, "&amp;").replace(lt, "&lt;").replace(gt, "&gt;").replace(apos, "&#39;").replace(quot, "&quot;").replace(brace, "&#123;");
							}
							else {
								return str;
							}
						};

						d.forEach(function(e) {
							var retweet = e.retweeted_status || false;

							var tweet = {
								id: e.id_str,
								content: (retweet ? (retweet.full_text ? retweet.full_text : retweet.text) : (e.full_text ? e.full_text : e.text)),
								user: e.user.name,
								username: e.user.screen_name,
								image: e.user.profile_image_url_https,
								age: moment(e.created_at).toDate().getTime()
							};

							var replaces = [];

							(retweet ? retweet.entities : e.entities).hashtags.forEach(function(e) {
								replaces.push({
									loc: e.indices,
									text: '<a href="http://www.twitter.com/search?q=%23' +
												hEscape(encodeURIComponent(e.text)) +
											'&amp;src=hash" target="_blank">#' +
												hEscape(e.text) +
											'</a>'
								});
							});

							(retweet ? retweet.entities : e.entities).urls.forEach(function(e) {
								replaces.push({
									loc: e.indices,
									text: '<a href="' + hEscape(e.url) + '" target="_blank">' + hEscape(e.display_url) + '</a>'
								});
							});

							(retweet ? retweet.entities : e.entities).user_mentions.forEach(function(e) {
								replaces.push({
									loc: e.indices,
									text: '<a href="http://www.twitter.com/' +
												hEscape(encodeURIComponent(e.screen_name)) +
											'" target="_blank" title="' +
												hEscape(e.name) +
											'">@' + hEscape(e.screen_name) + '</a>'
								});
							});

							replaces.sort(function(a, b) {
								return b.loc[1] - a.loc[1];
							});

							replaces.forEach(function(e) {
								tweet.content = tweet.content.substr(0, e.loc[0]) + e.text + tweet.content.substr(e.loc[1]);
							});

							if (retweet) {
								tweet.content = 'RT <a href="http://www.twitter.com/' +
												hEscape(encodeURIComponent(retweet.user.screen_name)) +
											'" target="_blank" title="' +
												hEscape(retweet.user.name) +
											'">@' + hEscape(retweet.user.screen_name) + '</a>: ' + tweet.content;
							}

							tweets.push(tweet);
						});

						this.data = {
							tweets: tweets
						};

						this.render();

						this.utils.saveData(this.data);
					}
				}.bind(this)
			});
		},
		render: function(key) {
			if (key === "authorize" || (!this.config.token && !key)) {
				this.utils.render({
					authorize: true,
					title: (this.config.title && this.config.title !== "" ? this.config.title : false)
				});

				return this.elm.find(".authorize").on("click", this.authorize.bind(this));
			}

			var data = $.extend(true, {}, this.data);

			data.tweets.forEach(function(e) {
				e.age = moment(e.age).fromNow(true)
							.replace(" years", "y").replace(" months", "mth")
							.replace(" weeks", "w").replace(" days", "d")
							.replace(" hours", "h").replace(" minutes", "m")
							.replace("a year", "1y").replace("a month", "1mth")
							.replace("a week", "1w").replace("a day", "1d")
							.replace("an hour", "1h").replace("a minute", "1m")
							.replace("a few seconds", "5s").replace("a second", "1s")
							.replace(" seconds", "s");
			});

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);
		}
	};
});