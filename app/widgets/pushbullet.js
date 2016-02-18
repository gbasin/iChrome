/*
 * Pushbullet
 */
define(["jquery", "lodash", "moment", "backbone", "browser/api"], function($, _, moment, Backbone, Browser) {
	var View = Backbone.View.extend({
		events: {
			"click .no-key button": function() {
				Browser.tabs.create({
					url: "https://www.pushbullet.com/signin"
				});
			}
		},

		/**
		 * Updates the thumbnail resolver cache.
		 *
		 * Pushbullet doesn't provide thumbnails in push list requests
		 * so we need to assemble a list of our own to retrieve them.
		 */
		updateCache: function() {
			if (!this.config.apiKey) {
				return;
			}

			$.ajax({
				type: "GET",
				url: "https://api.pushbullet.com/v2/everything?active=true",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(this.config.apiKey));
				}.bind(this),
				success: function(d) {
					if (typeof d !== "object") {
						d = JSON.parse(d);
					}

					var cache = {
						users: {},
						channels: {},
						from: new Date().getTime()
					};

					var sizeImage = function(e) {
						if (e.indexOf("imgix.net") !== -1) {
							e += "?w=80";
						}
						else if (e.indexOf("googleusercontent.com") !== -1) {
							e += "=s80";
						}

						return e;
					};

					_.each(d.subscriptions, function(e) {
						if (e.channel && e.channel.image_url) {
							cache.channels[e.channel.iden] = cache.channels[e.channel.tag] = sizeImage(e.channel.image_url);
						}
					});

					_.each([].concat(d.accounts, d.contacts, _.pluck(d.chats, "with")), function(e) {
						if (e.image_url) {
							cache.users[e.iden] = cache.users[e.email_normalized] = sizeImage(e.image_url);
						}
					});

					if (Object.keys(cache.users).length + Object.keys(cache.channels).length === 0) {
						return;
					}

					this.data.cache = cache;

					this.utils.saveData();

					this.refresh();
				}.bind(this)
			});
		},

		initialize: function() {
			if (!this.config.apiKey) {
				return Browser.cookies.get({
					name: "api_key",
					url: "https://www.pushbullet.com"
				}, function(args, cookie) {
					if (cookie && cookie.value) {
						this.config.apiKey = cookie.value;

						this.utils.saveConfig(this.config);

						this.initialize.apply(this, args);
					}
					else {
						this.render();
					}
				}.bind(this, arguments));
			}

			this.render();

			this.refresh();

			this.bindSocket();

			if (!this.data.cache || (new Date().getTime() - this.data.cache.from) > 21600000) {
				this.updateCache();
			}
		},


		/**
		 * Creates a WebSocket connection to Pushbullet
		 */
		bindSocket: function() {
			this.socket = new WebSocket("wss://stream.pushbullet.com/websocket/" + this.config.apiKey);

			this.socket.onmessage = function(e) {
				var data = JSON.parse(e.data);

				if (data.type === "tickle" && data.subtype === "push") {
					this.refresh();
				}
			}.bind(this);
		},


		/**
		 * Gets the thumbnail image for the given push
		 *
		 * @api     private
		 * @param   {String}  d  The push to get a thumbnail for
		 * @return  {String}     The URL of the thumbnail image
		 */
		getThumb: function(d) {
			var cache = this.data.cache || {
				users: {},
				channels: {}
			};

			if ((d.channel_tag || d.channel_iden) && (cache.channels[d.channel_tag] || cache.channels[d.channel_iden])) {
				return cache.channels[d.channel_tag] || cache.channels[d.channel_iden];
			}
			else if ((d.sender_iden || d.sender_email_normalized) && (cache.users[d.sender_iden] || cache.users[d.sender_email_normalized])) {
				return cache.users[d.sender_iden] || cache.users[d.sender_email_normalized];
			}
			else {
				return null;
			}
		},


		/**
		 * Parses and formats an array of pushes
		 *
		 * @param   {Object[]}  d  An array of pushes
		 * @return  {Object[]}     An array of parsed pushes
		 */
		parsePushes: function(d) {
			return _(d)
				.filter("active")
				.sortBy(function(a, b) {
					return b.created - a.created;
				})
				.map(function(e) {
					try {
						var parsed = {
							id: e.iden,
							date: parseInt(e.created * 1000),
							type: e.type,
							sender: {
								name: e.sender_name || e.sender_email,
								email: e.sender_email || e.sender_email_normalized,
								thumb: this.getThumb(e)
							}
						};

						if (e.type === "note" || e.type === "link") {
							parsed.title = e.title;
							parsed.body = e.body;

							if (e.url) {
								if (e.url.indexOf("://") === 0) {
									e.url = "https" + e.url;
								}

								parsed.link = e.url;
								parsed.linkText = e.url;
							}
						}
						else if (e.type === "file") {
							parsed.body = e.body;
							parsed.link = e.file_url;
							parsed.linkText = e.file_name;

							if (e.image_url) {
								if (e.image_url.indexOf("imgix.net") !== -1) {
									e.image_url += "?w=370";
								}
								else if (e.image_url.indexOf("googleusercontent.com") !== -1) {
									e.image_url += "=s370";
								}

								parsed.image = e.image_url;
							}
						}

						return parsed;
					}
					catch (err) {
						return null;
					}
				}, this)
				.compact()
				.take(20)
			.valueOf();
		},

		refresh: function() {
			if (!this.config.apiKey) {
				return this.render;
			}

			$.ajax({
				type: "GET",
				url: "https://api.pushbullet.com/v2/pushes?active=true",
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa(this.config.apiKey));
				}.bind(this),
				success: function(d) {
					if (typeof d !== "object") {
						d = JSON.parse(d);
					}

					if (!d.pushes) {
						return;
					}

					this.data.pushes = this.parsePushes(d.pushes);

					this.utils.saveData();

					this.render();
				}.bind(this)
			});
		},

		render: function() {
			if (!this.config.apiKey) {
				return this.utils.render({
					noKey: true
				});
			}

			var pushes = this.data.pushes;

			var data = {
				hasPushes: pushes && pushes.length
			};

			var lData = moment.localeData();

			var momentSecondsFuture = lData._relativeTime.future.replace("%s", lData._relativeTime.s),
				momentSecondsPast = lData._relativeTime.past.replace("%s", lData._relativeTime.s);

			if (data.hasPushes) {
				data.pushes = pushes.map(function(e) {
					e = _.clone(e);

					e.date = moment(e.date).fromNow().replace( // Fix "in a few seconds" bug
						momentSecondsFuture,
						momentSecondsPast
					);

					return e;
				});
			}

			this.utils.render(data);
		}
	});

	return {
		id: 42,
		size: 4,
		nicename: "pushbullet",
		sizes: ["medium"],
		config: {
			size: "medium"
		},
		data: {},
		render: function() {
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

			this.view.render();
		}
	};
});