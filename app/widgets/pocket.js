/*
 * Pocket
 */
define(["jquery", "lodash", "moment", "backbone", "browser/api", "oauth"], function($, _, moment, Backbone, Browser, OAuth) {
	var View = Backbone.View.extend({
		events: {
			"click .no-key button": function() {
				(this.oAuth || this.setOAuth()).startAuthFlow(this.refresh.bind(this));
			}
		},

		oAuth: false,

		/**
		 * Creates an OAuth instance for this widget
		 *
		 * @api  private
		 */
		setOAuth: function() {
			this.oAuth = new OAuth({
				name: "pocket",
				secret: "inapplicable",
				id: "43824-06b2efa713cefcf319c3bc76",
				authURL: "https://getpocket.com/auth/authorize?request_token={{requestToken}}&redirect_uri={{redirectURL}}"
			});


			// Pocket uses a modified version of OAuth that's incompatible with
			// the original OAuth library so we need to modify the library
			this.oAuth.startAuthFlow = function(cb) {
				var that = this;

				var createWindow = function() {
					that.openWindow = true;

					$.ajax({
						type: "POST",
						url: "https://getpocket.com/v3/oauth/request",
						data: {
							consumer_key: that.config.id,
							redirect_uri: that.config.redirectURL
						},
						beforeSend: function(xhr) {
							xhr.setRequestHeader("X-Accept", "application/json");
						},
						success: function(d) {
							if (typeof d !== "object" || !d.code) {
								that.openWindow = false;

								return;
							}

							var url = that.config.authURL
								.replace("{{requestToken}}", encodeURIComponent(d.code))
								.replace("{{redirectURL}}", encodeURIComponent(that.config.redirectURL));

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
									function() {
										this.exchangeCode(d.code, cb);

										Browser.windows.remove(win.id);

										return {
											cancel: true
										};
									}.bind(that),
									{
										windowId: win.id,
										types: ["main_frame"],
										urls: [that.config.redirectURL + "*"]
									},
									["blocking"]
								);
							});
						}
					});

					// Make sure we don't lock up the OAuth instance
					setTimeout(function() {
						if (that.openWindow === true) {
							that.openWindow = false;
						}
					}, 10000);
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
			};

			this.oAuth.exchangeCode = function(code, cb) {
				$.ajax({
					type: "POST",
					url: "https://getpocket.com/v3/oauth/authorize",
					data: {
						code: code,
						consumer_key: this.config.id
					},
					beforeSend: function(xhr) {
						xhr.setRequestHeader("X-Accept", "application/json");
					},
					success: function(d) {
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
					}.bind(this)
				});
			};

			this.oAuth.ajax = function(config) {
				this.getToken(function(token) {
					if (!config.data) {
						config.data = {};
					}

					config.data.consumer_key = this.config.id;
					config.data.access_token = token;

					$.ajax(config);
				}.bind(this));
			};

			return this.oAuth;
		},


		/**
		 * Parses an image URL and returns a scaled img.readitlater.com URL
		 *
		 * @api     private
		 * @param   {String}  oUrl  The image URL to parse
		 * @return  {String}        The parsed, scaled URL
		 */
		getImageURL: function(oUrl) {
			if (!oUrl) {
				return;
			}

			var url = new URL(oUrl);

			var vars = "?f=t&lq=1" + (url.protocol === "https:" ? "&ssl=1" : "");

			if (url.protocol !== "http:" && url.protocol !== "https:") {
				return oUrl;
			}

			var ext = (/\.(jpg|gif|jpeg|png|ico)$/i.exec(url.pathname) || [])[1];

			if (!ext) {
				ext = "jpg";

				vars += "&ne=1";
			}

			var qs = url.search && url.search.length > 1 ? "/QS/" + encodeURIComponent(encodeURIComponent(url.search.slice(1))) + "/EQS" : "";

			return "https://img.readitlater.com/i/" + url.host + url.pathname.replace("." + ext, "") + qs + "/RS/w200-h190." + ext + vars;
		},

		refresh: function() {
			if (!this.oAuth) {
				this.setOAuth();
			}

			if (!this.oAuth.hasToken()) {
				return this.render();
			}

			var getImageURL = this.getImageURL,
				original = this.config.open === "original";

			this.oAuth.ajax({
				type: "POST",
				url: "https://getpocket.com/v3/get",
				data: {
					count: this.config.show,
					detailType: "complete"
				},
				success: function(d) {
					if (!d) {
						return;
					}

					this.data.links = _(d.list).sortBy("sort_id").map(function(e) {
						var ret = {
							id: e.item_id,
							title: e.given_title || e.resolved_title,
							domain: new URL(e.resolved_url).host.replace("www.", ""),
							date: moment(e.time_added * 1000).format("MMMM Do, YYYY"),
							url: original ? (e.given_url || e.resolved_url) : "https://getpocket.com/a/read/" + e.item_id
						};

						if (e.authors) {
							ret.author = _.values(e.authors)[0].name;
						}

						if (e.image) {
							ret.image = getImageURL(e.image.src);
						}
						else if (e.images && e.images[1]) {
							ret.image = getImageURL(e.images[1].src);
						}

						return ret;
					}).take(this.config.show).value();

					this.utils.saveData(this.data);

					this.render();
				}.bind(this)
			});
		},

		render: function(demo) {
			if ((typeof demo === "undefined" || demo !== true) && !(this.oAuth || this.setOAuth()).hasToken()) {
				this.utils.render({
					noKey: true
				});
			}
			else {
				this.utils.render(this.data);
			}
		}
	});

	return {
		id: 45,
		size: 1,
		interval: 300000,
		nicename: "pocket",
		sizes: ["variable"],
		settings: [
			{
				min: 1,
				max: 10,
				type: "number",
				nicename: "show",
				label: "i18n.settings.links_shown"
			},
			{
				type: "radio",
				label: "i18n.settings.open",
				nicename: "open",
				options: {
					pocket: "i18n.settings.open_pocket",
					original: "i18n.settings.open_original"
				}
			}
		],
		config: {
			show: 5,
			open: "pocket",
			size: "variable"
		},
		data: {
			links: [
				{
					id: "922689190",
					title: "BBC - Autos - Mercedes-Benz C 111: The supercar that wasn’t",
					domain: "bbc.com",
					date: "July 23rd, 2015",
					url: "http://www.bbc.com/autos/story/20150512-mercedes-benz-c-111-the-supercar-that-wasnt",
					author: "Dan Carney",
					image: "https://img.readitlater.com/i/ichef.bbci.co.uk/wwfeatures/976_549/images/live/p0/2r/8h/p02r8hx7/RS/w200-h190.jpg?f=t&lq=1"
				},
				{
					id: "989873963",
					title: "The World’s Most Popular Genre is Cannibalizing Itself, and You Didn’t Even",
					domain: "medium.com",
					date: "July 23rd, 2015",
					url: "https://medium.com/cuepoint/the-world-s-most-popular-genre-is-cannibalizing-itself-and-you-didn-t-even-notice-efd06558d138",
					author: "Ross Hsu",
					image: "https://img.readitlater.com/i/d262ilb51hltx0.cloudfront.net/max/2000/1*bHAPgxzujxgEQXDfI61YAg/RS/w200-h190.jpeg?f=t&lq=1&ssl=1"
				},
				{
					id: "990356377",
					title: "BBC - Autos - Model M could put Tesla on two wheels",
					domain: "bbc.com",
					date: "July 23rd, 2015",
					url: "http://www.bbc.com/autos/story/20150723-london-based-designer",
					author: "Rowan Horncastle",
					image: "https://img.readitlater.com/i/ichef.bbci.co.uk/wwfeatures/976_549/images/live/p0/2x/v8/p02xv8j5/RS/w200-h190.jpg?f=t&lq=1"
				},
				{
					id: "990503685",
					title: "Facebook loses appeal over access to user data - CNN.com",
					domain: "cnn.com",
					date: "July 23rd, 2015",
					url: "http://www.cnn.com/2015/07/23/tech/facebook-search-warrants/index.html",
					author: "Tal Trachtman Alroy",
					image: "https://img.readitlater.com/i/i2.cdn.turner.com/cnnnext/dam/assets/130919214517-zuckerberg-2004-super-169/RS/w200-h190.jpg?f=t&lq=1"
				},
				{
					id: "984832743",
					title: "DeepDream: Inside Google's 'Daydreaming' Computers - YouTube",
					domain: "youtube.com",
					date: "July 20th, 2015",
					url: "https://www.youtube.com/watch?v=3hnWf_wdgzs",
					image: "https://img.readitlater.com/i/img.youtube.com/vi/3hnWf_wdgzs/0/RS/w200-h190.jpg?f=t&lq=1"
				}
			]
		},
		ensureView: function() {
			if (!this.view) {
				this.view = new (View.extend({
					utils: this.utils,
					config: this.config,
					data: this.data || {}
				}))({
					el: this.elm
				});
			}

			this.view.config = this.config;
			this.view.data = this.data || {};
		},
		refresh: function() {
			this.ensureView();

			this.view.refresh();
		},
		render: function(demo) {
			this.ensureView();

			this.view.render(demo);
		}
	};
});