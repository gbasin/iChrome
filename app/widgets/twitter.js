/*
 * The Twitter widget.
 */
define(["jquery", "moment", "browser/api", "lib/cryptojs"], function($, moment, Browser, CryptoJS) {
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
					oauth_callback: "https://www.ichro.me/twitter_redirect"
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
									urls: [ "https://www.ichro.me/twitter_redirect*" ]
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