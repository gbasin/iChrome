/*
 * The Google Now widget.
 */
define(["jquery", "oauth2"], function($) {
	return {
		id: 24,
		interval: 300000,
		nicename: "now",
		sizes: ["variable"],
		config: {
			size: "variable"
		},
		data: {
			cards: [
				{
					"id": "10-NOR",
					"title": "Package: Shipped",
					"priority": -1,
					"desc": "Usually the name of the item you bought will go here  Shipped by UPS from Amazon.com",
					"icon": "http://www.gstatic.com/googlenow/chrome/v1/package_good.png",
					"buttons": [
						{
							"title": "Track package",
							"link": "http://www.fedex.com/fedextrack/",
							"btnIcon": "http://www.gstatic.com/googlenow/chrome/v1/globe.png"
						},
						{
							"title": "View email",
							"link": "https://mail.google.com/mail/",
							"btnIcon": "http://www.gstatic.com/googlenow/chrome/v1/mail.png"
						}
					],
					"btns": true
				},
				{
					"id": "1010-NOT",
					"title": "Reminder: Take out the garbage",
					"priority": -1,
					"desc": "This morning",
					"icon": "http://www.gstatic.com/googlenow/chrome/v1/reminders.png"
				},
				{
					"id": "11-NOR",
					"title": "Bucks 77 vs Heat 96",
					"priority": -1,
					"desc": "Final score",
					"icon": "http://www.gstatic.com/googlenow/chrome/v1/basketball.png",
					"link": "https://www.google.com/search?q=basketball+Miami+Heat&hl=en-US",
					"buttons": [
						{
							"title": "Box score",
							"link": "http://www.nba.com/games/20140402/MILMIA/gameinfo.html"
						}
					],
					"btns": true
				},
				{
					"id": "12-NOR",
					"title": "12 mins to Googleplex, 1600 Amphitheatre Pkwy, Mountain View, CA 94043",
					"priority": -1,
					"desc": "Normal traffic on US-101 S",
					"icon": "http://www.gstatic.com/googlenow/chrome/v1/traffic_normal.png",
					"buttons": [
						{
							"title": "Directions / 12 mins via US-101 S",
							"link": "https://maps.google.com/maps",
							"btnIcon": "http://www.gstatic.com/googlenow/chrome/v1/directions.png"
						}
					],
					"btns": true
				},
				{
					"id": "12-NOR",
					"title": "62° - Mostly Cloudy",
					"priority": -2,
					"desc": "San Francisco",
					"icon": "https://www.gstatic.com/onebox/weather/64/partly_cloudy.png",
					"link": "https://www.google.com/search?q=weather"
				}
			]
		},
		setOAuth: function() {
			var keys = [ /* !! Remove keys before committing */
				],
				ls = localStorage.oauth2_now,
				key;

			if (ls) {
				key = keys.filter(function(e) {
					return ls.indexOf(e[0]) !== -1;
				})[0];
			}

			if (!key) {
				key = keys[Math.floor(Math.random() * keys.length)];
			}

			this.oAuth = new OAuth2("now", {
				client_id: key[0],
				client_secret: key[1],
				api_scope: "https://www.googleapis.com/auth/googlenow"
			}, function(tab) {
				chrome.webRequest.onBeforeRequest.addListener(
					function extract(info) {
						var url = info.url,
							params = "?",
							index = url.indexOf(params);

						if (index > -1) {
							params = url.substring(index);
						}

						chrome.webRequest.onBeforeRequest.removeListener(extract);

						chrome.tabs.update(info.tabId, {
							url: chrome.extension.getURL("oauth2/oauth2.html") + params + "&from=" + encodeURIComponent(url)
						});
					},
					{
						urls: [ "http://ichro.me/auth/*" ]
					},
					["blocking", "requestBody"]
				);
			});
		},
		refresh: function() {
			if (!this.oAuth) this.setOAuth();

			if (!this.oAuth.getAccessToken()) {
				return this.render("authorize");
			}

			this.oAuth.authorize.call(this.oAuth, function() {
				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/chromenow/v1/notifications",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + this.oAuth.getAccessToken());
					}.bind(this),
					success: function(d) {
						var cards = [];

						if (d && d.notifications) {
							d.notifications.forEach(function(e, i) {
								if (i > 15) return;

								var card = {
									index: cards.length,
									id: e.notificationId,
									cnId: e.chromeNotificationId,
									duration: (e.dismissal && e.dismissal.duration) || 21000
								};

								if (e.chromeNotificationOptions) {
									var co = e.chromeNotificationOptions;

									card.title = co.title || "No title";

									card.priority = co.priority || -1;

									if (co.message) card.desc = co.message.replace(/\n/g, "  ");

									if (co.iconUrl) card.icon = co.iconUrl;

									if (co.imageUrl && co.imageUrl.length < 100000) {
										card.image = co.imageUrl;
									}

									if (co.isClickable && e.actionUrls && e.actionUrls.messageUrl) {
										card.link = e.actionUrls.messageUrl;
									}

									if (co.buttons && e.actionUrls && e.actionUrls.buttonUrls &&
										e.actionUrls.buttonUrls.length == co.buttons.length) {
										card.buttons = [];

										co.buttons.forEach(function(btn, i) {
											var button = {
												title: btn.title || "No title",
												link: e.actionUrls.buttonUrls[i] || "#"
											};

											if (btn.iconUrl) button.btnIcon = btn.iconUrl;

											if (btn.title) card.buttons.push(button);
										});

										if (card.buttons.length) {
											card.btns = true;
										}
									}
								}

								cards.push(card);
							});

							cards.sort(function(a, b) {
								return b.priority - a.priority;
							});
						}

						this.data = {
							cards: cards
						};

						this.render();

						this.utils.saveData(this.data);
					}.bind(this)
				});
			}.bind(this));
		},
		render: function(key) {
			if (!this.oAuth) this.setOAuth();

			if (key == "authorize") {
				this.utils.render({ authorize: true });

				return this.elm.find(".authorize").on("click", function(e) {
					e.preventDefault();

					this.oAuth.authorize.call(this.oAuth, this.refresh.bind(this));
				}.bind(this));
			}

			var that = this; // Can't use .bind() since we need the element from this

			this.elm.off("click", ".dismiss, a.card").on("click", ".dismiss, a.card", function(e) {
				var elm = $(this);

				if (elm.hasClass("dismiss")) {
					elm = elm.parent();

					e.stopPropagation();

					e.preventDefault();
				}

				var card = that.data.cards[elm.attr("data-index")];

				if (!card) return;

				that.oAuth.authorize.call(that.oAuth, function() {
					$.ajax({
						type: "DELETE",
						url: "https://www.googleapis.com/chromenow/v1/notifications/" + card.id + "?chromeNotificationId=" + encodeURIComponent(card.cnId) + "&age=29&duration=" + card.duration,
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "OAuth " + this.oAuth.getAccessToken());
						}.bind(this),
						success: function(d) {
							delete this.data.cards[elm.attr("data-index")];
						
							if (elm.hasClass("btns")) {
								elm.next(".buttons").remove().end().remove();
							}
							else {
								elm.remove();
							}

							this.utils.saveData(this.data);

							this.utils.render(this.data);
						}.bind(this)
					});
				}.bind(that));
			});

			this.utils.render(this.data);
		}
	};
});