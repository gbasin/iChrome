/*
 * The Google Now widget.
 */
define(["jquery", "oauth", "browser/api"], function($, OAuth, Browser) {
	return {
		id: 24,
		size: 1,
		order: 6,
		unlisted: true,
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
			var keys = [
					["1092601450132-elm3qva7di0gi13jvfr4dokp6lst9rcm.apps.googleusercontent.com", "__API_KEY_now.0__"],
					["475386506072-d09fbkq2ggibju8dm0os2dpjt6mlmvgr.apps.googleusercontent.com", "__API_KEY_now.1__"],
					["905766585722-eup1m0vja23fmr7gkr9bbfo5vrl2l62f.apps.googleusercontent.com", "__API_KEY_now.2__"],
					["297119829873-mb1l6a6cd9g4srrf2kgfjpl3ngvfps6o.apps.googleusercontent.com", "__API_KEY_now.3__"],
					["61552638141.apps.googleusercontent.com", "__API_KEY_now.4__"],
					["564901828000-mcur4bngbbl7ocj7gsr19e2cadd9bs8v.apps.googleusercontent.com", "__API_KEY_now.5__"],
					["568348197812-o4p7qoaf10fu849tagidncv0sokridus.apps.googleusercontent.com", "__API_KEY_now.6__"],
					["504688753719-ijc8cb8qtpg566v51smqer9ga0q16opd.apps.googleusercontent.com", "__API_KEY_now.7__"],
					["288563396275-33pieggp736m90889r2ufa8f10ac6l36.apps.googleusercontent.com", "__API_KEY_now.8__"],
					["182058966659-60ujcv0310u9ndgvenvmp3ru4b1jq3qp.apps.googleusercontent.com", "__API_KEY_now.9__"],
					["827243658242-36fidshv417d4ntaobqqvk4i2ut9imel.apps.googleusercontent.com", "__API_KEY_now.10__"],
					["565933460066-li1i03v3afucv3476mtlp84h35u5j2hq.apps.googleusercontent.com", "__API_KEY_now.11__"],
					["960034567410-gdr70kb9gggbbvlpv2ej7q81952q9nkr.apps.googleusercontent.com", "__API_KEY_now.12__"],
					["125384267513-v1gpelluifnb5iqp48s39jgame61539a.apps.googleusercontent.com", "__API_KEY_now.13__"],
					["395311390958-6rddshfv97tkt9r11fvcidr51b44vo2q.apps.googleusercontent.com", "__API_KEY_now.14__"],
					["97471935904-0lbpfjujqk9qq0fgkv9flm28u13lbek1.apps.googleusercontent.com", "__API_KEY_now.15__"],
					["134474773808-p13i3uvca6d48go3b5glhotlmpnuiee4.apps.googleusercontent.com", "__API_KEY_now.16__"],
					["578831884662-5l9kintvanlqm8hnj0omkr2b3obav3pg.apps.googleusercontent.com", "__API_KEY_now.17__"],
					["757729443264-8l5120ej7h7hr8g0u45m3a5trf61a3tb.apps.googleusercontent.com", "__API_KEY_now.18__"],
					["318821747372-eia0n4v9itjdeo75r1vngkm6oeb89rrm.apps.googleusercontent.com", "__API_KEY_now.19__"]
				],
				ls = Browser.storage.oauth,
				key;

			if (ls) {
				key = keys.filter(function(e) {
					return ls.indexOf(e[0]) !== -1;
				})[0];
			}

			if (!key) {
				key = keys[Math.floor(Math.random() * keys.length)];
			}

			this.oAuth = new OAuth({
				name: "now",
				id: key[0],
				secret: key[1],
				redirectURL: "https://ichro.me/auth/now",
				scope: "https://www.googleapis.com/auth/googlenow"
			});
		},
		refresh: function() {
			if (!this.oAuth) {
				this.setOAuth();
			}

			if (!this.oAuth.hasToken()) {
				return this.render("authorize");
			}

			var noTitle = this.utils.translate("no_title");

			this.oAuth.ajax({
				type: "GET",
				dataType: "json",
				url: "https://www.googleapis.com/chromenow/v1/notifications",
				success: function(d) {
					var cards = [];

					if (d && d.notifications) {
						d.notifications.forEach(function(e, i) {
							if (i > 15) {
								return;
							}

							var card = {
								index: cards.length,
								id: e.notificationId,
								cnId: e.chromeNotificationId,
								duration: (e.dismissal && e.dismissal.duration) || 21000
							};

							if (e.chromeNotificationOptions) {
								var co = e.chromeNotificationOptions;

								card.title = co.title || noTitle;

								card.priority = co.priority || -1;

								if (co.message) {
									card.desc = co.message.replace(/\n/g, "  ");
								}

								if (co.iconUrl) {
									card.icon = co.iconUrl;
								}

								if (co.imageUrl && co.imageUrl.length < 100000) {
									card.image = co.imageUrl;
								}

								if (co.isClickable && e.actionUrls && e.actionUrls.messageUrl) {
									card.link = e.actionUrls.messageUrl;
								}

								if (co.buttons && e.actionUrls && e.actionUrls.buttonUrls &&
									e.actionUrls.buttonUrls.length === co.buttons.length) {
									card.buttons = [];

									co.buttons.forEach(function(btn, i) {
										var button = {
											title: btn.title || noTitle,
											link: e.actionUrls.buttonUrls[i] || "#"
										};

										if (btn.iconUrl) {
											button.btnIcon = btn.iconUrl;
										}

										if (btn.title) {
											card.buttons.push(button);
										}
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
		},
		render: function(key) {
			if (!this.oAuth) {
				this.setOAuth();
			}

			if (key === "authorize") {
				this.utils.render({ authorize: true });

				return this.elm.find(".authorize").on("click", function(e) {
					e.preventDefault();

					this.oAuth.getToken(this.refresh.bind(this));
				}.bind(this));
			}

			var that = this; // Can't use .bind() since we need the element from this

			this.elm.off("click.now", ".dismiss, a.card").on("click.now", ".dismiss, a.card", function(e) {
				var elm = $(this);

				e.stopImmediatePropagation();

				if (elm.hasClass("dismiss")) {
					elm = elm.parent();

					e.preventDefault();
				}

				var card = that.data.cards[elm.attr("data-index")];

				if (!card) {
					return;
				}

				that.oAuth.ajax({
					type: "DELETE",
					url: "https://www.googleapis.com/chromenow/v1/notifications/" + card.id + "?chromeNotificationId=" + encodeURIComponent(card.cnId) + "&age=29&duration=" + card.duration,
					success: function() {
						this.data.cards.splice(this.data.cards.indexOf(card), 1);

						if (elm.hasClass("btns")) {
							elm.next(".buttons").remove().end().remove();
						}
						else {
							elm.remove();
						}

						this.utils.saveData(this.data);

						this.utils.render(this.data);
					}.bind(that)
				});
			});

			this.utils.render(this.data);
		}
	};
});