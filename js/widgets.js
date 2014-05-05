(initLog || (window.initLog = [])).push([new Date().getTime(), "Done with OAuth loading, starting widgets JS loading and processing"]);

var Widgets = {
	1: {
		id: 1,
		size: 3,
		order: 1,
		name: "Weather",
		interval: 300000,
		nicename: "weather",
		sizes: ["tiny", "small", "medium"],
		desc: "Displays the current weather and a forecast for the next 4 days.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "size"
			},
			{
				type: "text",
				nicename: "location",
				label: "Location",
				placeholder: "Enter a location to retrieve weather for"
			},
			{
				type: "radio",
				nicename: "units",
				label: "Units",
				options: {
					standard: "Standard",
					metric: "Metric"
				}
			}
		],
		config: {
			title: "San Francisco",
			size: "medium",
			location: "San Francisco, CA",
			units: "standard",
			woeid: "2487956",
			woeloc: "San Francisco, CA"
		},
		data: {
			conditions: "partlycloudy",
			temp: 59,
			wind: "8",
			chill: "59",
			humidity: "44",
			forecast: [
				{
					date: "Today",
					high: "64",
					low: "45",
					conditions: "sunny"
				},
				{
					date: "Mon",
					high: "65",
					low: "46",
					conditions: "sunny"
				},
				{
					date: "Tue",
					high: "65",
					low: "45",
					conditions: "partlycloudy"
				},
				{
					date: "Wed",
					high: "65",
					low: "43",
					conditions: "sunny"
				},
				{
					date: "Thu",
					high: "67",
					low: "44",
					conditions: "sunny"
				}
			]
		},
		getLoc: function(cb) {
			$.get("http://query.yahooapis.com/v1/public/yql?q=select%20name%2C%20country.content%2C%20woeid%20from%20geo.places%20where%20text%3D%22" + encodeURIComponent(this.config.location.replace(/[^A-z0-9,\- ]/, "")) + "%22&format=json", function(d) {
				if (d && d.query && d.query.results && d.query.results.place && ((d.query.results.place[0] && d.query.results.place[0].woeid) || d.query.results.place.woeid)) {
					var m = d.query.results.place;

					if (m[0]) {
						m = m[0];
					}

					var loc = (m.name ? m.name : "") + (m.country && m.country !== "United States" ? ", " + m.country : "");

					this.config.woeloc = loc;
					this.config.location = loc;
					this.config.woeid = m.woeid;
				}
				else {
					this.config.woeid = "2487956";

					this.config.loc = "San Francisco, CA";
					this.config.woeloc = "San Francisco, CA";
				}

				cb.call(this);
			}.bind(this));0
		},
		getCondition: function(code) {
			if (typeof code == "string") {
				code = parseInt(code);
			}

			switch (code) {
				case 0:
				case 1:
				case 2:
				case 23:
				case 24:
				case 25:
					return "tornado";
					break;

				case 3:
				case 4:
				case 37:
				case 38:
				case 39:
				case 45:
				case 47:
					return "tstorms";
					break;

				case 5:
				case 6:
				case 7:
				case 15:
				case 18:
				case 41:
				case 43:
				case 46:
					return "snow";
					break;

				case 8:
				case 9:
				case 11:
				case 12:
					return "drizzle";
					break;

				case 13:
				case 14:
				case 17:
				case 42:
					return "flurries";
					break;

				case 20:
				case 21:
				case 22:
					return "fog";
					break;

				case 26:
					return "cloudy";
					break;

				case 27:
				case 29:
				case 28:
				case 44:
					return "mostlycloudy";
					break;

				case 10:
				case 30:
				case 33:
				case 34:
					return "partlycloudy";
					break;

				case 35:
				case 40:
					return "rain";
					break;

				case 31:
				case 32:
				case 36:
					return "sunny";
					break;

				default:
					return "unknown";
			};

			return false;
		},
		refresh: function() {
			var config = this.config,
				get = function() {
					$.get("https://my.yahoo.com/_td_api/resource/weather;unit=f;woeids=" + encodeURIComponent(this.config.woeid || "2487956"), function(res) {
						var weather = {};

						if (!(res && (res = res[0]) && res.current && res.current.condition && res.current.condition.code)) {
							return this.utils.error.call(this, "An error occurred while trying to fetch the weather.");
						}

						weather = {
							conditions: this.getCondition(res.current.condition.code) || "unknown",
							status: res.current.condition.description || "Unknown",
							temp: Math.round(res.current.temp.now) || 0,
							wind: res.current.atmosphere.wind_speed || 0,
							chill: res.current.atmosphere.wind_chill || "0",
							humidity: res.current.atmosphere.humidity || 0
						};

						weather.forecast = [];

						res.forecast.day.forEach(function(e, i) {
							weather.forecast.push({
								date: e.label || "NA",
								high: e.temp.high || 0,
								low: e.temp.low || 0,
								status: e.condition.description || "Unknown",
								conditions: this.getCondition(e.condition.code) || "unknown"
							});
						}.bind(this));

						this.data = weather;

						this.utils.saveData(weather);

						this.render.call(this);
					}.bind(this));
				}.bind(this);

			if (config.woeid && config.woeloc == config.location) {
				get();
			}
			else {
				this.getLoc(get);
			}
		},
		render: function() {
			var data = $.extend(true, {}, this.data);

			if (this.config.units == "metric") {
				data.metric = true;
				data.temp = Math.round(((data.temp - 32) * 5) / 9);
				data.wind = Math.round(data.wind * 1.609344) + " kph";
				data.chill = Math.round(((data.chill - 32) * 5) / 9);

				data.forecast.forEach(function(e, i) {
					e.high = Math.round(((e.high - 32) * 5) / 9);
					e.low = Math.round(((e.low - 32) * 5) / 9);

					data.forecast[i] = e;
				});
			}
			else {
				data.wind += " mph";
			}

			switch (this.config.size) {
				case "small":
					delete data.forecast;
				break;
				case "medium":
					data.forecast = data.forecast.slice(0, 5);
				break;
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);

			var that = this;

			this.elm.find(".temp sup a").click(function(e) {
				e.preventDefault();

				that.config.units = (that.config.units == "standard" ? "metric" : "standard");

				that.render.call(that);

				that.utils.saveConfig(that.config);
			});
		}
	},
	2: {
		id: 2,
		size: 2,
		order: 4,
		name: "Time & Date",
		interval: 1000,
		nicename: "clock",
		sizes: ["tiny", "small"],
		desc: "Shows the current date and time. Optionally for a different timezone.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "timezone",
				label: "Time Zone",
				placeholder: "Enter a zone to show the current time for",
				options: {
					auto: "Local",
					"-720": "UTC -12:00",
					"-660": "UTC -11:00",
					"-600": "UTC -10:00",
					"-570": "UTC -09:30",
					"-540": "UTC -09:00",
					"-480": "UTC -08:00",
					"-420": "UTC -07:00",
					"-360": "UTC -06:00",
					"-300": "UTC -05:00",
					"-270": "UTC -04:30",
					"-240": "UTC -04:00",
					"-210": "UTC -03:30",
					"-180": "UTC -03:00",
					"-120": "UTC -02:00",
					"-60": "UTC -01:00",
					0: "UTC +00:00",
					60: "UTC +01:00",
					120: "UTC +02:00",
					180: "UTC +03:00",
					210: "UTC +03:30",
					240: "UTC +04:00",
					270: "UTC +04:30",
					300: "UTC +05:00",
					330: "UTC +05:30",
					345: "UTC +05:45",
					360: "UTC +06:00",
					390: "UTC +06:30",
					420: "UTC +07:00",
					480: "UTC +08:00",
					525: "UTC +08:45",
					540: "UTC +09:00",
					570: "UTC +09:30",
					600: "UTC +10:00",
					630: "UTC +10:30",
					660: "UTC +11:00",
					690: "UTC +11:30",
					720: "UTC +12:00",
					765: "UTC +12:45",
					780: "UTC +13:00",
					840: "UTC +14:00"
				}
			},
			{
				type: "select",
				nicename: "format",
				label: "Clock View",
				options: {
					ampm: "AM/PM - Digital",
					full: "24 Hour - Digital",
					analog: "12 Hour - Analog",
					ampms: "AM/PM - Digital, No Seconds",
					fulls: "24 Hour - Digital, No Seconds"
				}
			}
		],
		config: {
			title: "Clock",
			size: "small",
			timezone: "auto",
			format: "ampm"
		},
		isAnalog: false,
		getHTML: function() {
			var html = '<div class="time',
				dt = new Date();

			if (this.config.timezone !== "auto") {
				dt = new Date(dt.getTime() + dt.getTimezoneOffset() * 60000 + parseInt(this.config.timezone) * 60000);
			}

			var hours = dt.getHours(),
				minutes = dt.getMinutes(),
				seconds = dt.getSeconds(),
				am = hours < 12;

			if (this.config.format.indexOf("ampm") == 0) {
				hours = (hours > 12 ? hours - 12 : hours);

				if (hours == 0) hours = 12;

				html += (am ? " am" : " pm") + (this.config.format == "ampms" ? " no-seconds" : "");
			}
			else {
				html += " full" + (this.config.format == "fulls" ? " no-seconds" : "");
			}
			
			html += '">' + hours + ":" + minutes.pad();

			if (this.config.size == "tiny" && this.config.format.indexOf("ampm") == 0) {
				html += "<span>" + (this.config.format == "ampm" ? seconds.pad() : "") + "</span></div>";
			}
			else if (this.config.size != "tiny") {
				// moment(dt) is slower so avoid it when possible
				var date = (this.config.timezone !== "auto" ? moment(dt).format("dddd, MMMM Do YYYY") : moment().format("dddd, MMMM Do YYYY"));

				if (this.config.format == "ampm" || this.config.format == "full") {
					html += ":" + seconds.pad();
				}

				html += '</div><div class="date">' + date + "</div>";
			}

			return html;
		},
		refresh: function(settings) {
			if (settings) {
				this.elm.removeClass("analog");

				this.render();
			}
			else if (!this.isAnalog) {
				this.clockElm.innerHTML = this.getHTML();
			}
		},
		render: function() {
			var data = {
				analog: this.config.format == "analog"
			};

			this.isAnalog = data.analog;

			if (data.analog) {
				var dt = new Date();

				if (this.config.timezone !== "auto") {
					dt = new Date(dt.getTime() + dt.getTimezoneOffset() * 60000 + parseInt(this.config.timezone) * 60000);
				}

				var min = dt.getMinutes();

				data = {
					analog: true,
					mPos: min * 6 + (dt.getSeconds() / 60 * 6),
					hPos: dt.getHours() * 30 + (min / 60 * 30),
					sPos: dt.getSeconds() * 6
				};

				this.elm.addClass("analog");

				this.utils.render(data);
			}
			else {
				data.html = this.getHTML();

				if (this.config.title && !(this.config.title === "" || (this.config.size === "tiny" && this.config.title === "Time in New York, NY"))) {
					data.title = this.config.title;
				}

				this.utils.render(data);

				this.clockElm = this.elm.find(".clock")[0];
			}
		}
	},
	3: {
		id: 3,
		size: 2,
		order: 18,
		name: "Analytics",
		interval: 300000,
		nicename: "analytics",
		sizes: ["tiny", "medium"],
		desc: "Displays various metrics for a Google Analytics profile.",
		preconfig: true,
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide",
				defaultVal: ""
			},
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "profile",
				label: "Profile",
				options: "getProfiles"
			}
		],
		config: {
			title: "",
			size: "medium",
			profile: false
		},
		data: {
			visits: 5605,
			pageviews: 15033,
			bounceRate: 12.57,
			completions: 4853,
			pagesVisit: 8.54
		},
		oAuth: false,
		setOAuth: function() {
			this.oAuth = new OAuth2("google", {
				client_id: "559765430405-5rvu6sms3mc111781cfgp1atb097rrph.apps.googleusercontent.com",
				client_secret: "",
				api_scope: "https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics"
			});
		},
		getProfiles: function(cb) {
			if (!this.oAuth) this.setOAuth();

			var done = 0,
				errors = 0,
				profiles = [],
				accounts = {},
				properties = {},
				data = {},
				oAuth = this.oAuth,
				compile = function() {
					if (errors !== 0) cb("Error");

					if (++done < 3) return;

					profiles.forEach(function(e, i) {
						data[e.account] = data[e.account] || {label: accounts[e.account]};
						data[e.account][e.property] = data[e.account][e.property] || {label: properties[e.property].name};

						data[e.account][e.property][e.id] = decodeURIComponent(e.name);
					});

					cb(data);
				};

			oAuth.authorize.call(oAuth, function() {
				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/analytics/v3/management/accounts",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + oAuth.getAccessToken());
					},
					success: function(d) {
						if (!d || !d.items) return errors++;

						d.items.forEach(function(e, i) {
							accounts[e.id] = e.name;
						});

						compile();
					}
				});

				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + oAuth.getAccessToken());
					},
					success: function(d) {
						if (!d || !d.items) return errors++;

						d.items.forEach(function(e, i) {
							properties[e.id] = {
								name: e.name,
								account: e.accountId
							};
						});

						compile();
					}
				});

				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/analytics/v3/management/accounts/~all/webproperties/~all/profiles",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + oAuth.getAccessToken());
					},
					success: function(d) {
						if (!d || !d.items) return errors++;

						d.items.forEach(function(e, i) {
							profiles.push({
								id: e.id,
								name: e.name,
								account: e.accountId,
								property: e.webPropertyId
							});
						});

						compile();
					}
				});
			});
		},
		refresh: function() {
			if (!this.oAuth) this.setOAuth();

			if (!this.config.profile) {
				return false;
			}

			this.oAuth.authorize.call(this.oAuth, function() {
				$.ajax({
					type: "GET",
					dataType: "json",
					data: {
						ids: "ga:" + this.config.profile,
						"start-date": "today",
						"end-date": "today",
						"max-results": 1,
						metrics: "ga:visits,ga:pageviews,ga:visitBounceRate,ga:goal1Completions"
					},
					url: "https://www.googleapis.com/analytics/v3/data/ga",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + this.oAuth.getAccessToken());
					}.bind(this),
					success: function(d) {
						if (d && d.rows && d.rows[0] && d.rows[0].length == 4) {
							var result = d.rows[0],
								data = {
									visits:			parseInt(result[0]),
									pageviews:		parseInt(result[1]),
									bounceRate:		parseFloat(parseFloat(result[2]).toFixed(2)),
									completions:	parseInt(result[3]),

									pagesVisit: parseFloat((result[1] / result[0]).toFixed(2))
								};

							this.data = data;

							this.render();

							this.utils.saveData(this.data);
						}
					}.bind(this)
				});
			}.bind(this));
		},
		render: function(demo) {
			var data = $.extend({}, this.data);

			if (data.visits)		data.visits			= data.visits.toLocaleString().replace(/,/g, "<b>,</b>");
			if (data.pageviews)		data.pageviews		= data.pageviews.toLocaleString();
			if (data.bounceRate)	data.bounceRate		= data.bounceRate.toLocaleString() + "%";
			if (data.completions)	data.completions	= data.completions.toLocaleString();
			if (data.visitors)		data.visitors		= data.visitors.toLocaleString();
			if (data.pagesVisit)	data.pagesVisit		= data.pagesVisit.toLocaleString();

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (!this.config.profile && !demo) {
				data.noProfile = true;
			}

			this.utils.render(data);
		}
	},
	4: {
		id: 4,
		size: 6,
		order: 2,
		name: "News",
		interval: 300000,
		nicename: "news",
		sizes: ["variable"],
		desc: "Displays the current top news by category and edition.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "number",
				nicename: "number",
				label: "Articles Shown",
				min: 1,
				max: 10
			},
			{
				type: "select",
				nicename: "edition",
				label: "Edition",
				help: "If your edition or topic is not listed here, please enter a Google News feed URL is the Custom Feed field below (check the help text there for an explanation).",
				options: {
					us: "U.S.",
					uk: "U.K.",
					ca: "Canada (English)",
					fr_ca: "Canada (French)",
					en_il: "Israel (English)",
					fr: "France",
					au: "Australia",
					"pt-BR_br": "Brazil"
				}
			},
			{
				type: "select",
				nicename: "topic",
				label: "Topic",
				chained: "edition",
				options: "getTopics"
			},
			{
				type: "text",
				nicename: "custom",
				label: "Custom Feed",
				help: "This is the feed at the URL listed at the bottom of every Google News page, look for an orange RSS icon and a link that says \"RSS\"",
				placeholder: "Enter a custom RSS feed to fetch news from"
			},
			{
				type: "text",
				nicename: "link",
				label: "Footer URL",
				placeholder: "Enter a URL that the \"More\" link should point to"
			}
		],
		config: {
			size: "variable",
			title: "News",
			number: 5,
			edition: "us",
			topic: "top",
			custom: "",
			link: "http://news.google.com"
		},
		data: {
			items: [
				{
					title: "Memories of a South African election day - Washington Post",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNE5dby4rKtKx6jUT1pUSRKFY…an-election-day/2013/12/06/7199c1f2-5e98-11e3-bc56-c6ca94801fac_story.html",
					image: "https://t1.gstatic.com/images?q=tbn:ANd9GcQhnU5rscvH7oQU9jtjBa3eUo4MP58mkUSRJ-twJuDoMIjErsXQtqA-gvuCGCBmtpePxvxsw6w",
					desc: "I remember his smile. His fist punched up in triumph. I stood among the many people crowded in a Johannesburg downtown hotel in 1994 dancing and rejoicing with Nelson Mandela as he celebrated South Africa's first all-race elections and his election as"
				},
				{
					title: "National unemployment rate hits five-year low - Kansas City Star",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNEl9D8rS8SFQxJHJbRgK_DQS…www.kansascity.com/2013/12/06/4673371/national-unemployment-rate-hits.html",
					image: "https://t2.gstatic.com/images?q=tbn:ANd9GcRl6RNceopaAIys1IR_hki58-WXcRhJOVKJ29BsDBRIZ6kLyPwCstZAfVh3-L-C8HesOa33pE_1",
					desc: "The national unemployment rate fell to a five-year low of 7 percent in November and payrolls grew by 203,000. More News. Read more Business. The better-than-expected numbers included a net gain of 196,000 private-sector and 7,000 government jobs"
				},
				{
					title: "Flights canceled as deadly icy blast hits South, Midwest - Fox News",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNGUSvF3z-_v6w8edKJ-0X23U…xnews.com/weather/2013/12/06/ice-friday-blast-bears-down-on-south-midwest/",
					image: "https://t2.gstatic.com/images?q=tbn:ANd9GcS2QH9HpsMCk6NEBsVzRz1vGg9M0aN4Jv3eg1NG3quI8tlgErp616wSnp_k-IpZdeFFCZxkduMe",
					desc: "Texas residents have been hit with a wintry storm system that has been blamed for at least one death and dumped 1 to 2 feet of snow in parts of the Midwest and draped many communities in skin-stinging cold. Earlier this week, many in Texas were basking in"
				},
				{
					title: "Mississippi Sen. Cochran to seek seventh Senate term - NBCNews.com",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNEx-yq0E3eX_lGoI6ny88Gvo…13/12/06/21792122-mississippi-sen-cochran-to-seek-seventh-senate-term?lite",
					image: "https://t1.gstatic.com/images?q=tbn:ANd9GcSI2m0XFN8UTTehRpyWEH-pLRiituOjlECDG_1fA91DX0Penh_eXWMHzNrYXD0mQj7l0hokEZcA",
					desc: "By Jessica Taylor, NBC News. Mississippi Sen. Thad Cochran will seek a seventh term in 2014, NBC News learned Friday, making the veteran lawmaker into a top target for conservative groups during next year's GOP primary. Amid murmurs that Cochran"
				},
				{
					title: "Scott Brown flubs, forgets he's in New Hampshire - CBS News",
					url: "http://news.google.com/news/url?sa=t&fd=R&usg=AFQjCNHxbWxS1kbt6rptPyoLsvRSY…ttp://www.cbsnews.com/news/scott-brown-flubs-forgets-hes-in-new-hampshire/",
					image: "https://t2.gstatic.com/images?q=tbn:ANd9GcTvFq23n1LXdz5OsLZ_wjHIgmitZn7R2lMQr5Xp0Rg7i1oMBK69O-l8U2Dzq77OMehPLghv8yA",
					desc: "Former Sen. Scott Brown, R-Mass., speaks during a news conference at the U.S. Capitol on February 16, 2012 in Washington, DC. Photo by Win McNamee/Getty Images. Shares. Tweets; Stumble. Email; More +. Former New Hampshire - er, Massachusetts"
				}
			]
		},
		getTopics: function(cb, edition) {
			var topics = {
				top: "Top Stories",
				w: "World",
				n: "Nation",
				b: "Business",
				s: "Sports",
				tc: "Technology",
				e: "Entertainment",
				m: "Health",
				snc: "Science",
				ir: "Spotlight"
			},
			edition = edition || "us";

			if (edition == "pt-BR_br") {
				delete topics.snc;
				delete topics.ir;

				topics.t = "Science/Technology";
				topics.po = "Spotlight";
			}

			cb(topics);
		},
		refresh: function() {
			var config = this.config;

			$.get((config.custom && config.custom !== "") ? config.custom.parseUrl() : ("https://news.google.com/news/feeds?ned=" + config.edition + "&topic=" + (config.topic !== "top" ? config.topic : "") + "&output=rss"), function(d) {
				d = $(d);

				var items = d.find("item"),
					news = {
						items: []
					};

				items.each(function(i) {
					var itm = $(this),
						html = $("<div>" + itm.find("description").text().replace(/ src="\/\//g, " data-src=\"https://").replace(/ src="http"/g, " data-src=\"http") + "</div>"),
						item = {
							title: itm.find("title").text().trim(),
							url: itm.find("link").text().trim(),
							image: html.find("img[data-src]").first().attr("data-src"),
							desc: html.find(".lh font:nth-of-type(2)").find("*").remove().end().text().trim()
						};

					if (item.desc == "") {
						item.desc = html.text().trim();
					}

					if (item.image == "") {
						delete item.image;
					}

					news.items.push(item);
				});

				this.data = news;

				this.render.call(this);

				this.utils.saveData(this.data);
			}.bind(this));
		},
		render: function() {
			var news = $.extend({}, this.data || {items:[]});

			news.items = news.items.slice(0, this.config.number);

			if (news.items[0]) {
				news.items[0].featured = true;
			}

			if (this.config.title && this.config.title !== "") {
				news.title = this.config.title;
			}

			if (this.config.link && this.config.link !== "") {
				news.link = this.config.link;
			}

			this.utils.render(news);
		}
	},
	5: {
		id: 5,
		size: 1,
		order: 16,
		name: "Wolfram|Alpha",
		nicename: "wolfram",
		sizes: ["small"],
		config: {
			size: "small"
		},
		desc: "Inserts a small Wolfram|Alpha search box.",
		render: function() {
			this.utils.render();
		}
	},
	6: {
		id: 6,
		size: 2,
		order: 6,
		name: "Unread",
		interval: 120000,
		nicename: "unread",
		sizes: ["tiny", "small"],
		desc: "Displays the current number of unread emails in your Gmail inbox.",
		settings: [
			{
				type: "text",
				nicename: "user",
				label: "Account ID",
				help: "If you're signed into multiple accounts, this is the \"authuser=\" value.<br /><br />For example, if you're signed into two accounts, jsmith1@gmail.com and jsmith2@gmail.com, the \"authuser\" value for jsmith2@gmail.com would be 1 since it's the second account (counting from zero) that you're signed into.",
				placeholder: "Your \"authuser=\" value"
			},
			{
				type: "size"
			},
			{
				type: "text",
				nicename: "label",
				label: "Label",
				help: "This is the label that's shown under the unread message count where <b>%m</b> is either <b>message</b> or <b>messages</b>.",
				placeholder: "unread %m"
			}
		],
		config: {
			size: "tiny",
			user: "0",
			label: "unread %m"
		},
		data: {
			count: 0,
			messages: [
				{
					subject: "This is a sample message subject",
					excerpt: "And this is some sample message content!!"
				}
			]
		},
		refresh: function() {
			$.get("http://mail.google.com/mail/feed/atom/?authuser=" + (this.config.user || 0), function(d) {
				try {
					var d = $(d),
						count = parseInt(d.find("fullcount").text()),
						messages = [];

					d.find("entry").each(function(i) {
						if (i > 4) return;

						var msg = $(this);

						messages.push({
							subject: msg.find("title").text(),
							excerpt: msg.find("summary").text()
						});
					});

					this.data.count = count || 0;
					this.data.messages = messages;

					this.render();

					this.utils.saveData(this.data);
				}
				catch (e) {
					this.utils.error("An error occurred while trying to update the Unread widget!");
				}
			}.bind(this));
		},
		render: function() {
			var data = {
				count: this.data.count,
				label: "messages",
				user: (this.config.user || 0),
				messages: this.data.messages
			};

			var m = "emails";

			if (data.count == 1) {
				m = "email";
			}

			data.label = (this.config.label || "unread %m").replace(/%m/g, m);

			this.utils.render(data);
		}
	},
	7: {
		id: 7,
		size: 4,
		order: 5,
		name: "iFrame",
		nicename: "iframe",
		sizes: ["variable"],
		desc: "Displays a webpage of your choice within an iframe.",
		settings: [
			{
				type: "text",
				nicename: "url",
				label: "Frame URL",
				placeholder: "http://www.google.com/"
			},
			{
				type: "number",
				label: "Frame Height",
				nicename: "height",
				min: 100,
				max: 800
			},
			{
				type: "radio",
				nicename: "padding",
				label: "Padding",
				options: {
					"true": "On",
					"false": "Off"
				}
			}
		],
		config: {
			height: 400,
			padding: "false",
			size: "variable",
			url: "http://mail.google.com/mail/mu/mp/?source=ig&mui=igh"
		},
		render: function() {
			this.utils.render({
				url: (this.config.url && this.config.url.parseUrl()) || "http://mail.google.com/mail/mu/mp/?source=ig&mui=igh",
				padding: (this.config.padding === "true"),
				height: this.config.height || 400
			});

			this.elm.addClass("tabbed");
		}
	},
	8: {
		id: 8,
		size: 5,
		order: 8,
		name: "RSS",
		interval: 300000,
		nicename: "rss",
		sizes: ["variable"],
		desc: "Displays items from a RSS or Atom feed with optional images.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "text",
				nicename: "link",
				label: "Title Link",
				placeholder: "Enter a link for the widget title"
			},
			{
				type: "text",
				nicename: "url",
				label: "Feed URL",
				placeholder: "The URL of the RSS feed to be displayed"
			},
			{
				type: "number",
				nicename: "number",
				label: "Articles Shown",
				min: 1,
				max: 20
			},
			{
				type: "select",
				nicename: "view",
				label: "View",
				options: {
					images: "Image friendly",
					"default": "Default"
				}
			},
			{
				type: "radio",
				nicename: "images",
				label: "Images",
				options: {
					"true": "On",
					"false": "Off"
				}
			},
			{
				type: "radio",
				nicename: "desc",
				label: "Descriptions",
				options: {
					"true": "On",
					"false": "Off"
				}
			}
		],
		config: {
			title: "Lifehacker",
			link: "",
			number: 5,
			view: "default",
			images: "true",
			desc: "true",
			size: "variable",
			url: "http://feeds.gawker.com/lifehacker/full"
		},
		data: {
			items: [
				{
					title: "Pandora for iOS has gained a nifty feature today: the app can act as an alarm clock so you can wake",
					url: "http://feeds.gawker.com/~r/lifehacker/full/~3/p-3zc3sNwyQ/pandora-for-ios-has-gained-a-nifty-feature-today-the-a-1479529870",
					desc: "Pandora for iOS has gained a nifty feature today: the app can act as an alarm clock so you can wake up to some music. Read more on the Pandora blog.Read more..."
				},
				{
					title: "Surfly Shares Your Browsing Session Without Downloading Anything",
					url: "http://feeds.gawker.com/~r/lifehacker/full/~3/TD7FbdZCHHk/surfly-shares-your-browsing-session-without-downloading-1479358895",
					image: "http://img.gawkerassets.com/img/198vaoqj1h8yspng/ku-medium.png",
					desc: "Sometimes, it's just easier to show someone what you're doing instead of explaining yourself. Over the web, that can be difficult, but Surfly makes it a bit easier.Read more..."
				},
				{
					title: "Design Your Home Bar with Ergonomics (and Guests) In Mind",
					url: "http://feeds.gawker.com/~r/lifehacker/full/~3/fT1J5LvVCBg/design-your-home-bar-with-ergonomics-and-guests-in-mi-1479090750",
					image: "http://img.gawkerassets.com/img/198s8jxvaur33jpg/small.jpg",
					desc: "If you're putting together a home bar, you're probably thinking about the essentials you'll need, but not necessarily how it's laid out and where in the room. Kevin Liu at Serious Eats suggests you think about positioning too—the right layout will ke"
				},
				{
					title: "Gawker Paris Hilton's Brother Bloodied in Attack Ordered By Lindsay Lohan | io9 Scientists listened",
					url: "http://feeds.gawker.com/~r/lifehacker/full/~3/QMRqfH-YUcA/@whitsongordon",
					desc: "Gawker Paris Hilton's Brother Bloodied in Attack Ordered By Lindsay Lohan | io9 Scientists listened to the heartbeat of a prisoner as he was executed | Jalopnik Comedian Dares To Make Fun Of Danica Patrick, Awkwardness Ensues | Jezebel No One Learns "
				},
				{
					title: "4 Unconventional Ways the Internet Can Help You Land Job",
					url: "http://feeds.gawker.com/~r/lifehacker/full/~3/B6gKevxTg3k/4-unconventional-ways-the-internet-can-help-you-land-jo-1479206108",
					image: "http://img.gawkerassets.com/img/198uydw1d3z7djpg/small.jpg",
					desc: "With thousands of new people entering the job market daily, you need to tap every available resource to stand out. The internet can help you hack into the minds of potential employers, if you know where to look.Read more..."
				}
			]
		},
		getItem: function(itm) {
			var html = $("<div>" + (itm.find("description").text() || itm.find("content").text() || itm.find("summary").text() || "").replace(/ src="\/\//g, " data-src=\"https://").replace(/ src="/g, " data-src=\"").replace(/ src='\/\//g, " data-src='https://").replace(/ src='/g, " data-src='") + "</div>"),
				item = {
					title: itm.find("title").text().trim(),
					url: (itm.find("link[href]").attr("href") || itm.find("link").text() || "").trim()
				};


			// Cleanup tracking images, feedburner ads, etc.
			html.find(".mf-viral, .feedflare, img[width=1], img[height=1], img[data-src^='http://da.feedsportal.com']").remove();


			item.image = html.find("img[data-src]").first().attr("data-src");

			if (!item.image || item.image == "") {
				if (html.find("iframe[data-chomp-id]").length) {
					item.image = "http://img.youtube.com/vi/" + html.find("iframe[data-chomp-id]").attr("data-chomp-id") + "/1.jpg";
				}
				else if (itm.find("media\\:content[url], media\\:thumbnail[url], enclosure[url][type^=image]").length) {
					item.image = itm.find("media\\:content[url], media\\:thumbnail[url], enclosure[url][type^=image]").attr("url");
				}
				else {
					delete item.image;
				}
			}


			// Fix various image sizing issues, etc.
			if (item.image) {
				if (item.image.indexOf("s-nbcnews.com") !== -1 && ((item.image.indexOf("?") == -1 && (item.image += "?")) || (item.image += "&"))) {
					item.image += "height=70";
				}
				else if (item.image.indexOf("gawkerassets.com") !== -1) {
					item.image = item.image.replace("/ku-xlarge", "/ku-medium");
				}
			}

			html.find("*").not("a, b, i, strong, u").each(function() {
				$(this).replaceWith(this.innerHTML || "");
			});

			html.find("*").not("a, b, i, strong, u").remove();

			item.desc = html.html().trim();

			if (!item.desc || item.desc == "") {
				delete item.desc;
			}
			else {
				html.find("a").each(function() {
					var span = $('<span class="nested-link" data-target="_blank"></span>'),
						href = this.getAttribute("href") || "http://www.google.com/";

					span.text(this.innerText.replace(/\n/g, "  ").trim());

					if (href.trim().indexOf("//") == 0) {
						href =  "http:" + href.trim();
					}
					else if (href.trim().indexOf("http") !== 0) {
						href =  "http://" + href.trim();
					}
					else {
						href = href.trim();
					}

					span.attr("data-href", href);

					$(this).replaceWith(span);
				});

				item.desc = html.html();
			}

			return item;
		},
		refresh: function() {
			var config = this.config,
				url = this.config.url;

			if (!url || url == "") {
				url = "http://feeds.gawker.com/lifehacker/full";
			}
			else {
				url = url.parseUrl();
			}

			$.get(url, function(d) {
				try {
					if (typeof d == "object") {
						d = $(d);
					}
					else {
						d = $($.parseXML(d));
					}

					var items = d.find("item"),
						that = this,
						rss = {
							items: []
						};

					if (!items.length) {
						items = d.find("entry");
					}

					items.each(function(i) {
						if (i > 19) return;

						rss.items.push(that.getItem($(this)));
					});

					this.data = rss;

					this.render.call(this);

					this.utils.saveData(this.data);
				}
				catch(e) {
					alert("An error occurred while trying to fetch the feed at: " + url + ".\r\nPlease double check the URL and/or modify the widget settings.");
				}
			}.bind(this));
		},
		render: function() {
			var rss = $.extend(true, {}, this.data || {items:[]});

			rss.items = rss.items.slice(0, this.config.number || 5);

			for (var i = rss.items.length - 1; i >= 0; i--) {
				if (this.config.desc == "false" && rss.items[i].desc) {
					delete rss.items[i].desc;
				}

				if (this.config.images == "false" && rss.items[i].image) {
					delete rss.items[i].image;
				}
			};

			if (this.config.title && this.config.title !== "") {
				rss.title = this.config.title;
			}

			if (this.config.link && this.config.link !== "") {
				rss.link = this.config.link.parseUrl();
			}

			if (this.config.view && this.config.view == "images") {
				rss.images = true;
			}

			this.utils.render(rss);

			if (rss.images) {
				this.elm.find("img").on("error", function(e) {
					this.style.height = "20px";
				});
			}
		}
	},
	9: {
		id: 9,
		size: 1,
		order: 14,
		name: "Traffic",
		interval: 300000,
		nicename: "traffic",
		sizes: ["tiny", "small"],
		desc: "Displays the current time in current traffic to home or work.",
		settings: [
			{
				type: "size"
			},
			{
				type: "time",
				nicename: "time",
				label: "I leave home at"
			},
			{
				type: "text",
				nicename: "home",
				label: "Home Address",
				placeholder: "The destination that should be used after work"
			},
			{
				type: "text",
				nicename: "work",
				label: "Work Address",
				placeholder: "The destination that should be used before work"
			},
			{
				type: "select",
				nicename: "mode",
				label: "Transit Method",
				options: {
					D: "Driving",
					W: "Walking",
					T: "Public Transit"
				}
			}
		],
		config: {
			time: "09:00",
			home: "1 Hacker Way, Menlo Park, CA 94025",
			work: "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
			mode: "D",
			size: "small"
		},
		data: {
			home: 653,
			work: 542
		},
		refresh: function() {
			$.get("http://www.bing.com/maps/directions.ashx?d=0~1&w=" + encodeURIComponent(this.config.work || "1600 Amphitheatre Pkwy, Mountain View, CA 94043") +
					"~" + encodeURIComponent(this.config.home || "1 Hacker Way, Menlo Park, CA 94025") + "&mode=" + (this.config.mode || "D"), function(hd) {
				$.get("http://www.bing.com/maps/directions.ashx?d=0~1&w=" + encodeURIComponent(this.config.home || "1 Hacker Way, Menlo Park, CA 94025") +
						"~" + encodeURIComponent(this.config.work || "1600 Amphitheatre Pkwy, Mountain View, CA 94043") + "&mode=" + (this.config.mode || "D"), function(wd) {
					var homed = JSON.parse(hd),
						workd = JSON.parse(wd),
						data = {
							home: 0,
							work: 0
						};


					if (homed.routeResults && workd.routeResults
						&& homed.routeResults[0] && workd.routeResults[0]
						&& homed.routeResults[0].routes && workd.routeResults[0].routes
						&& homed.routeResults[0].routes[0] && workd.routeResults[0].routes[0]
						&& homed.routeResults[0].routes[0].routeLegs && workd.routeResults[0].routes[0].routeLegs
						&& homed.routeResults[0].routes[0].routeLegs[0] && workd.routeResults[0].routes[0].routeLegs[0]
						&& homed.routeResults[0].routes[0].routeLegs[0].summary && workd.routeResults[0].routes[0].routeLegs[0].summary) {
						
						data.home = (homed.routeResults[0].routes[0].routeLegs[0].summary.timeWithTraffic || homed.routeResults[0].routes[0].routeLegs[0].summary.time || 0);
						data.work = (workd.routeResults[0].routes[0].routeLegs[0].summary.timeWithTraffic || workd.routeResults[0].routes[0].routeLegs[0].summary.time || 0);

						if (data.home && data.work) {
							this.data = data;

							this.render();

							this.utils.saveData(this.data);
						}
					}

					if (workd.resolvedWaypoints && workd.resolvedWaypoints[0]
						&& workd.resolvedWaypoints[0][0] && workd.resolvedWaypoints[0][0].address && workd.resolvedWaypoints[0][0].address.formattedAddress
						&& workd.resolvedWaypoints[0][1] && workd.resolvedWaypoints[0][1].address && workd.resolvedWaypoints[0][1].address.formattedAddress) {
						this.config.home = workd.resolvedWaypoints[0][0].address.formattedAddress;
						this.config.work = workd.resolvedWaypoints[0][1].address.formattedAddress;

						this.utils.saveConfig(this.config);
					}
				}.bind(this));
			}.bind(this));
		},
		render: function(dest) {
			var data = {};

			if (typeof dest == "string") {
				data.dest = dest;
			}
			else if (moment(this.config.time, "hh:mm").add("hours", 1).isAfter()) {
				data.dest = "work";
			}
			else {
				data.dest = "home";
			}

			var time = moment.duration(this.data[data.dest] || 0, "seconds"),
				hours = time.get("hours"),
				minutes = Math.round(time.asMinutes() % 60);

			if (this.config.size == "tiny") {
				data.time = (hours ? hours + ":" + minutes.pad() : minutes + " min" + (minutes !== 1 ? "s" : ""));
			}
			else {
				data.time = (hours > 0 ? hours : "");

				if (hours > 0 && hours !== 1) {
					data.time += "hours ";
				}
				else if (hours == 1) {
					data.time += "hour ";
				}

				if (minutes > 0) {
					data.time += minutes;
				}

				if (hours > 0) {
					data.time += " min";
				}
				else {
					data.time += " minute";
				}

				if (minutes !== 1) {
					data.time += "s";
				}
			}

			this.utils.render(data);

			this.elm.off("click.traffic").on("click.traffic", ".time, .dest", function() {
				if (this.elm.find(".dest").text().trim() == "to work") {
					this.render("home");
				}
				else {
					this.render("work");
				}
			}.bind(this));
		}
	},
	10: {
		id: 10,
		size: 1,
		order: 3,
		name: "Calendar",
		interval: 300000,
		nicename: "calendar",
		sizes: ["variable"],
		desc: "Displays upcoming events from one of your Google calendars.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "select",
				nicename: "calendar",
				label: "Calendar",
				options: "getCalendars"
			},
			{
				type: "number",
				nicename: "events",
				label: "Events Shown",
				min: 1,
				max: 10
			}
		],
		config: {
			title: "My Calendar",
			size: "variable",
			events: 5,
			calendar: false
		},
		data: {
			events: [
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAxMDNUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-01-03T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAxMTdUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-01-17T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAxMzFUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-01-31T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAyMTRUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-02-14T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAyMjhUMTkwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-02-28T11:00:00-08:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAzMTRUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-03-14T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDAzMjhUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-03-28T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDA0MTFUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-04-11T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDA0MjVUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-04-25T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				},
				{
					title: "Glass Developer Hangout Office Hours",
					link: "https://www.google.com/calendar/event?eid=djZkb2lkMmFyOG1hZGExbnE4NTFwcGpyMmNfMjAxNDA1MDlUMTgwMDAwWiBkZXZlbG9wZXItY2FsZW5kYXJAZ29vZ2xlLmNvbQ",
					date: "2014-05-09T11:00:00-07:00",
					location: "MTV-2015-2-Watkins Glen (5) GVC (No external guests)"
				}
			]
		},
		oAuth: false,
		setOAuth: function() {
			this.oAuth = new OAuth2("google2", {
				client_id: "559765430405-2710gl95r9js4c6m4q9nveijgjji50b8.apps.googleusercontent.com",
				client_secret: "",
				api_scope: "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar"
			});
		},
		getCalendars: function(cb) {
			if (!this.oAuth) this.setOAuth();

			this.oAuth.authorize.call(this.oAuth, function() {
				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/calendar/v3/users/me/calendarList/",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + this.oAuth.getAccessToken());
					}.bind(this),
					success: function(d) {
						if (!d || !d.items) return cb("error");

						var calendars = {};

						d.items.forEach(function(e, i) {
							calendars[e.id] = e.summary;
						});

						cb(calendars);
					}
				});
			}.bind(this));
		},
		refresh: function() {
			if (!this.oAuth) this.setOAuth();

			if (!this.config.calendar) {
				return false;
			}

			this.oAuth.authorize.call(this.oAuth, function() {
				$.ajax({
					type: "GET",
					dataType: "json",
					data: {
						maxResults: 10,
						singleEvents: true,
						orderBy: "startTime",
						timeZone: -(new Date().getTimezoneOffset() / 60),
						timeMin: moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
						fields: "items(description,htmlLink,id,location,start,summary)"
					},
					url: "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(this.config.calendar) + "/events",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + this.oAuth.getAccessToken());
					}.bind(this),
					success: function(d) {
						var events = [];

						if (d && d.items) {
							d.items.forEach(function(e, i) {
								var event = {
									title: e.summary,
									link: e.htmlLink,
									date: (e.start.dateTime || e.start.date + " 00:00:00")
								};

								if (e.location) {
									event.location = e.location;
								}

								events.push(event);
							});

							this.data = {
								events: events
							};

							this.render();

							this.utils.saveData(this.data);
						}
					}.bind(this)
				});
			}.bind(this));
		},
		render: function(demo) {
			var data = $.extend(true, {}, this.data);

			data.events = data.events.slice(0, this.config.events || 5);

			data.events.forEach(function(e, i) {
				var date = moment(e.date);

				if (date.diff(new Date(), "days") + 1 > 7) {
					e.date = date.format("dddd, MMMM Do YYYY");

					if ((date = date.format("h:mm A")) !== "12:00 AM") {
						e.date += " at " + date;
					}
				}
				else {
					e.date = date.calendar().replace("Today at ", "");
				}
			});

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (!demo && !data.events.length) {
				data.noEvents = true;
			}

			this.utils.render(data);
		}
	},
	11: {
		id: 11,
		size: 2,
		order: 13,
		name: "Apps",
		nicename: "apps",
		sizes: ["variable"],
		desc: "Displays your currently installed Google Chrome applications.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "select",
				nicename: "view",
				label: "Widget Format",
				options: {
					tiles: "Tiles",
					list: "List"
				}
			},
			{
				type: "radio",
				nicename: "show",
				label: "Show",
				options: {
					all: "All apps",
					enabled: "Only enabled apps"
				}
			},
			{
				type: "select",
				nicename: "sort",
				label: "Sort",
				options: {
					id: "ID",
					alpha: "Alphabetically",
					offline: "Offline Enabled",
					available: "Availability"
				}
			},
			{
				type: "radio",
				nicename: "target",
				label: "Open apps in",
				options: {
					_self: "The current tab",
					_blank: "A new tab"
				}
			}
		],
		config: {
			title: "",
			sort: "id",
			show: "all",
			view: "list",
			target: "_blank",
			size: "variable"
		},
		refresh: function() {
			this.render();
		},
		render: function() {
			chrome.management.getAll(function(d) {
				var list = d.filter(function(e) {
						return e.type !== "extension" && e.type !== "theme";
					}),
					apps = {
						items: []
					},
					id = chrome.app.getDetails().id,
					self = this.config.target == "_self",
					all = this.config.show == "all";

				list.unshift({
					enabled: true,
					shortName: "Store",
					offlineEnabled: false,
					id: "ahfgeienlihckogmohjhadlkjgocpleb",
					appLaunchUrl: "https://chrome.google.com/webstore?utm_source=iChrome-apps-widget"
				});

				switch (this.config.sort) {
					case "alpha":
						list.sort(function(a, b) {
							var c = a.shortName.toLowerCase(),
								d = b.shortName.toLowerCase();

							return c < d ? -1 : c > d;
						});
					break;
					case "offline":
						list.sort(function(a, b) {
							return a.offlineEnabled;
						});
					break;
					case "available":
						list.sort(function(a, b) {
							return ((!navigator.onLine && a.offlineEnabled) + a.enabled) - ((!navigator.onLine && b.offlineEnabled) + b.enabled);
						});
					break;
				}

				list.forEach(function(e, i) {
					if (e.id !== id && (all || e.enabled)) {
						apps.items.push({
							name: e.shortName,
							id: e.id,
							thumb: "chrome://extension-icon/" + e.id + "/64/1",
							available: (navigator.onLine && e.enabled) || (!navigator.onLine && e.offlineEnabled)
						});
					}
				});

				if (this.config.title && this.config.title !== "") {
					apps.title = this.config.title;
				}

				if (this.config.view == "tiles") {
					apps.tiles = true;
				}

				this.utils.render(apps);

				this.elm.off("click").on("click", ".app", function(e) {
					e.preventDefault();

					var id = this.getAttribute("data-id");

					chrome.management.launchApp(id, function() {
						if (self) {
							chrome.tabs.getCurrent(function(d) {
								chrome.tabs.remove(d.id);
							});
						}
					});
				});

				$(window).one("offline.apps online.apps", function() {
					this.render();
				}.bind(this));
			}.bind(this));
		}
	},
	12: {
		id: 12,
		size: 2,
		order: 15,
		name: "Top Sites",
		nicename: "topsites",
		sizes: ["variable"],
		desc: "Displays your most visited/top sites.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "number",
				nicename: "show",
				label: "Number of sites shown",
				min: 1,
				max: 20
			},
			{
				type: "radio",
				nicename: "target",
				label: "Open sites in",
				options: {
					_self: "The current tab",
					_blank: "A new tab"
				}
			}
		],
		config: {
			show: 5,
			target: "_self",
			size: "variable"
		},
		refresh: function() {
			this.render();
		},
		render: function() {
			var that = this;

			chrome.topSites.get(function(sites) {
				var sites = sites.slice(0, that.config.show),
					data = {
						title: that.config.title || false,
						newTab: that.config.target == "_blank",
						sites: sites
					};

				that.utils.render(data);
			});
		}
	},
	13: {
		id: 13,
		size: 2,
		order: 12,
		name: "Notes",
		nicename: "notes",
		sizes: ["tiny", "variable"],
		desc: "Inserts a simple, editable, note.",
		settings: [
			{
				type: "select",
				nicename: "color",
				label: "Note Color",
				options: {
					yellow: "Yellow",
					orange: "Orange",
					red: "Red",
					blue: "Blue",
					green: "Green",
					white: "White"
				}
			},
			{
				type: "select",
				nicename: "face",
				label: "Font Face",
				options: {
					arial: "Arial",
					times: "Times New Roman",
					sans: "Open Sans",
					tahoma: "Tahoma",
					calibri: "Calibri",
					georgia: "Georgia"
				}
			},
			{
				type: "number",
				nicename: "fontsize",
				label: "Font Size",
				min: 8,
				max: 45
			},
		],
		config: {
			fontsize: 14,
			face: "arial",
			color: "yellow",
			size: "variable"
		},
		syncData: {
			title: "Sample note title",
			content: 'This is sample note content.<br><br>This note widget can contain and display many things including images, <a href="http://www.google.com">links</a>, <b>bold</b>, <i>italic</i>&nbsp;and <u>underlined</u>&nbsp;text.<br><br>Via the settings menu (click the wrench icon in the top right) you can set the note color, font face and font size.<br><br>Have fun!'
		},
		saveNote: function() {
			if (this.titleElm && this.noteElm) {
				clearTimeout(this.timeout);

				// Speed is of the essence, use mostly vanilla JS here
				this.div.innerHTML = this.noteElm[0].innerHTML;

				[].forEach.call(this.div.querySelectorAll("div"), function(e, i) {
					$(e).replaceWith("<br>" + e.innerHTML);
				});

				[].forEach.call(this.div.querySelectorAll(":not(pre):not(blockquote):not(figure):not(hr):not(a):not(b):not(u):not(i):not(img):not(strong):not(p):not(sub):not(sup):not(br)"), function(e, i) {
					$(e).replaceWith(e.innerHTML);
				});

				[].forEach.call(this.div.querySelectorAll("pre, blockquote, figure, hr, a, b, u, i, img, strong, p, sub, sup, br"), function(e, i) {
					[].forEach.call(e.attributes, function(a, i) {
						if (a.name == "style" && a.value.indexOf("block;") !== -1) {
							e.innerHTML = "<br>" + e.innerHTML;

							e.removeAttribute(a.name);
						}
						else if (a.name !== "href") {
							e.removeAttribute(a.name);
						}
					});
				});

				this.syncData.title = this.titleElm.val();
				this.syncData.content = this.div.innerHTML;

				this.timeout = setTimeout(function() {
					this.utils.saveConfig(this.syncData);
				}.bind(this), 500);
			}
		},
		render: function() {
			if (this.data) {
				this.syncData = $.extend(true, {}, this.data);

				delete this.data;
			}

			var data = {
				title: this.syncData.title,
				content: this.syncData.content
			},
			faces = {
				arial: "Arial, sans-serif",
				times: "Times New Roman, serif",
				sans: "Open Sans, sans-serif",
				tahoma: "Tahoma, sans-serif",
				calibri: "Calibri, sans-serif",
				georgia: "Georgia, serif"
			};

			data.size = this.config.fontsize || 14;
			data.face = faces[this.config.face || "arial"];
			data.color = this.config.color || "yellow";

			this.utils.render(data);

			this.titleElm = this.elm.find("input.header").on("input", this.saveNote.bind(this));
			this.noteElm = this.elm.find(".note .content").on("input", this.saveNote.bind(this));

			this.div = document.createElement("div");
		}
	},
	14: {
		id: 14,
		size: 2,
		order: 10,
		name: "Stocks",
		interval: 30000,
		nicename: "stocks",
		sizes: ["tiny", "small"],
		desc: "Displays current information for any given stock symbol.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "size"
			},
			{
				type: "text",
				nicename: "symbol",
				label: "Stock Symbol(s), comma separated",
				placeholder: "e.g. NASDAQ:GOOG, INDEXNYSEGIS:NYA",
				help: "These are the stocks you'd like shown in a TICKER:EXCHANGE format.<br /><br />For indexes, please use the tickers and exchanges as shown on <a href=\"https://www.google.com/finance\" target=\"_blank\">Google Finance</a>. For example, the Dow Jones index is <b>INDEXDJX:.DJI</b> and NYSE is <b>INDEXNYSEGIS:NYA</b>."
			}
		],
		config: {
			title: "Google, Inc.",
			size: "small",
			symbol: "NASDAQ:GOOG"
		},
		data: [{
			value: "1<b>,</b>100.62",
			ticker: "GOOG",
			exchange: "NASDAQ",
			up: true,
			date: "Dec 20th 4:00 PM",
			change: "+14.40 (1.33%)",
			open: "1088.30",
			high: "1101.17",
			low: "1088.00",
			volume: "3.27M",
			extra: false
		}],
		refresh: function() {
			$.ajax({
				type: "GET",
				url: "https://clients1.google.com/finance/info?client=ob&hl=en&infotype=infoonebox&q=" + encodeURIComponent((this.config.symbol || "NASDAG:GOOG").trim()),
				success: function(d) {
					d = JSON.parse(d
							.replace("// [", "[") // Undo Google's escaping
							.replace(/\\x([A-z0-9]{2})/g, function(match, $1) { // This replaces \x escapes so the JSON doesn't have to be eval'd
								try {
									return String.fromCharCode(parseInt($1, 16));
								}
								catch(e) {
									return "?";
								}
							})
						);

					var stocks = [],
						stock,
						min = (d.length > 1 ? 1000000 : 10000);

					d.forEach(function(e, i) {
						stock = {
							value: parseFloat((e.el_fix || e.l_fix).replace(/[^0-9\.\-]/g, "")),
							ticker: e.t,
							exchange: e.e,
							up: (e.ec || e.c).indexOf("-") !== 0,
							date: moment(e.elt || e.lt).format("MMM Do h:mm A"),
							change: (e.ec || e.c) + " (" + (e.ecp_fix || e.cp_fix) + "%)",
							open: parseFloat((e.op || "0").replace(/[^0-9\.\-]/g, "")),
							high: parseFloat((e.hi || "0").replace(/[^0-9\.\-]/g, "")),
							low: parseFloat((e.lo || "0").replace(/[^0-9\.\-]/g, "")),
							volume: parseFloat(e.vo.replace(/[^0-9\.\-]/g, "")),
							extra: (e.s == "1" ? "Pre Market" : e.s == "2" ? "After Hours" : false)
						};

						stock.value = ((stock.value || 0) < min ? $.formatNumber((stock.value || 0), { locale: navigator.locale }) : (stock.value || 0).abbr(min)).replace(/,/g, "<b>,</b>");

						stock.open = $.formatNumber((stock.open || 0), { locale: navigator.locale, format: "#0.00" });
						stock.high = $.formatNumber((stock.high || 0), { locale: navigator.locale, format: "#0.00" });
						stock.low = $.formatNumber((stock.low || 0), { locale: navigator.locale, format: "#0.00" });

						stock.volume = (stock.volume || 0).abbr(1000000);

						stocks.push(stock);
					});

					this.data = stocks;

					this.render();

					this.utils.saveData(this.data);
				}.bind(this),
				dataType: "text" // Google comments out the opening array tag so the JSON parser crashes
			});
		},
		render: function() {
			if (Array.isArray(this.data)) {
				if (this.data.length > 1) {
					var data = {
						multiple: true,
						stocks: $.extend({}, { data: this.data || [] }).data
					};
				}
				else {
					var data = $.extend({}, { data: this.data || [] }).data[0];
				}
			}
			else {
				var data = $.extend({}, this.data || {});
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);
		}
	},
	15: {
		id: 15,
		size: 5,
		order: 9,
		name: "Sports",
		nicename: "sports",
		interval: 180000,
		sizes: ["tiny", "variable"],
		desc: "Displays scores and game information for selected leagues and/or teams.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide",
				sizes: ["variable"]
			},
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "league",
				label: "League",
				options: {
					nfl: "NFL",
					mlb: "MLB",
					nba: "NBA",
					nhl: "NHL",
					ncaaf: "NCAA Football"
				}
			},
			{
				type: "number",
				nicename: "number",
				label: "Games Shown",
				min: 1,
				max: 10,
				sizes: ["variable"]
			},
			{
				type: "select",
				nicename: "team",
				label: "Team",
				options: "getTeams",
				chained: "league",
				sizes: ["tiny"]
			},
			{
				type: "select",
				nicename: "teams",
				label: "Teams",
				options: "getTeams",
				multiple: true,
				chained: "league",
				sizes: ["variable"]
			},
			{
				type: "radio",
				nicename: "unavailable",
				label: "When team games are unavailable",
				options: {
					other: "Show other games",
					none: "Show \"No Games\""
				}
			}
		],
		config: {
			title: "NFL Games",
			size: "variable",
			league: "nfl",
			teams: [],
			number: 5,
			unavailable: "other"
		},
		data: {
			games: [
				{
					home_first: "San Francisco",
					home_last: "49ers",
					home_id: "nfl/sfo",
					away_first: "Atlanta",
					away_last: "Falcons",
					away_id: "nfl/atl",
					start: 1387849200000,
					status: "Today, 8:40 PM<br />ESPN",
					label: "8:40 pm ET",
					coverage: "ESPN",
					link: "http://sports.yahoo.com/nfl/atlanta-falcons-san-francisco-49ers-20131223025/",
					time: "Today, 8:40 PM"
				},
				{
					home_first: "Detroit",
					home_last: "Lions",
					home_id: "nfl/det",
					away_first: "New York",
					away_last: "Giants",
					away_id: "nfl/nyg",
					start: 1387746300000,
					status: "Yesterday<br />Final OT",
					label: "Final OT",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/new-york-giants-detroit-lions-20131222008/",
					home_score: "20",
					away_score: "23",
					time: "Yesterday"
				},
				{
					home_first: "Green Bay",
					home_last: "Packers",
					home_id: "nfl/gnb",
					away_first: "Pittsburgh",
					away_last: "Steelers",
					away_id: "nfl/pit",
					start: 1387747500000,
					status: "Yesterday<br />Final",
					label: "Final",
					coverage: "CBS",
					link: "http://sports.yahoo.com/nfl/pittsburgh-steelers-green-bay-packers-20131222009/",
					home_score: "31",
					away_score: "38",
					time: "Yesterday"
				},
				{
					home_first: "Washington",
					home_last: "Redskins",
					home_id: "nfl/was",
					away_first: "Dallas",
					away_last: "Cowboys",
					away_id: "nfl/dal",
					start: 1387735200000,
					status: "Yesterday<br />Final",
					label: "Final",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/dallas-cowboys-washington-redskins-20131222028/",
					home_score: "23",
					away_score: "24",
					time: "Yesterday"
				},
				{
					home_first: "Jacksonville",
					home_last: "Jaguars",
					home_id: "nfl/jac",
					away_first: "Tennessee",
					away_last: "Titans",
					away_id: "nfl/ten",
					start: 1387735200000,
					status: "Yesterday<br />Final",
					label: "Final",
					coverage: "CBS",
					link: "http://sports.yahoo.com/nfl/tennessee-titans-jacksonville-jaguars-20131222030/",
					home_score: "16",
					away_score: "20",
					time: "Yesterday"
				},
				{
					home_first: "Seattle",
					home_last: "Seahawks",
					home_id: "nfl/sea",
					away_first: "Arizona",
					away_last: "Cardinals",
					away_id: "nfl/ari",
					start: 1387746300000,
					status: "final",
					label: "Final",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/arizona-cardinals-seattle-seahawks-20131222026/",
					home_score: "10",
					away_score: "17"
				},
				{
					home_first: "Carolina",
					home_last: "Panthers",
					home_id: "nfl/car",
					away_first: "New Orleans",
					away_last: "Saints",
					away_id: "nfl/nor",
					start: 1387735200000,
					status: "final",
					label: "Final",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/new-orleans-saints-carolina-panthers-20131222029/",
					home_score: "17",
					away_score: "13"
				},
				{
					home_first: "San Diego",
					home_last: "Chargers",
					home_id: "nfl/sdg",
					away_first: "Oakland",
					away_last: "Raiders",
					away_id: "nfl/oak",
					start: 1387747500000,
					status: "final",
					label: "Final",
					coverage: "CBS",
					link: "http://sports.yahoo.com/nfl/oakland-raiders-san-diego-chargers-20131222024/",
					home_score: "26",
					away_score: "13"
				},
				{
					home_first: "St. Louis",
					home_last: "Rams",
					home_id: "nfl/stl",
					away_first: "Tampa Bay",
					away_last: "Buccaneers",
					away_id: "nfl/tam",
					start: 1387735200000,
					status: "final",
					label: "Final",
					coverage: "FOX",
					link: "http://sports.yahoo.com/nfl/tampa-bay-buccaneers-st-louis-rams-20131222014/",
					home_score: "23",
					away_score: "13"
				},
				{
					home_first: "New York",
					home_last: "Jets",
					home_id: "nfl/nyj",
					away_first: "Cleveland",
					away_last: "Browns",
					away_id: "nfl/cle",
					start: 1387735200000,
					status: "final",
					label: "Final",
					coverage: "CBS",
					link: "http://sports.yahoo.com/nfl/cleveland-browns-new-york-jets-20131222020/",
					home_score: "24",
					away_score: "13"
				}
			]
		},
		getTeams: function(cb, league) {
			var leagues = {
				nfl: {
					teams: {
						ari: "Arizona Cardinals",
						bal: "Baltimore Ravens",
						buf: "Buffalo Bills",
						chi: "Chicago Bears",
						cin: "Cincinnati Bengals",
						cle: "Cleveland Browns",
						dal: "Dallas Cowboys",
						den: "Denver Broncos",
						det: "Detroit Lions",
						gnb: "Green Bay Packers",
						hou: "Houston Texans",
						ind: "Indianapolis Colts",
						jac: "Jacksonville Jaguars",
						kan: "Kansas City Chiefs",
						mia: "Miami Dolphins",
						min: "Minnesota Vikings",
						nor: "New Orleans Saints",
						nwe: "New England Patriots",
						nyg: "New York Giants",
						nyj: "New York Jets",
						oak: "Oakland Raiders",
						phi: "Philadelphia Eagles",
						pit: "Pittsburgh Steelers",
						sdg: "San Diego Chargers",
						sea: "Seattle Seahawks",
						sfo: "San Francisco 49ers",
						stl: "St. Louis Rams",
						tam: "Tampa Bay Buccaneers",
						ten: "Tennessee Titans",
						was: "Washington Redskins"
					}
				},
				mlb: {
					teams: {
						ari: "Arizona Diamondbacks",
						atl: "Atlanta Braves",
						bal: "Baltimore Orioles",
						bos: "Boston Red Sox",
						chc: "Chicago Cubs",
						chw: "Chicago White Sox",
						cin: "Cincinnati Reds",
						cle: "Cleveland Indians",
						col: "Colorado Rockies",
						det: "Detroit Tigers",
						mia: "Miami Marlins",
						hou: "Houston Astros",
						kan: "Kansas City Royals",
						laa: "Los Angeles Angels",
						lad: "Los Angeles Dodgers",
						mil: "Milwaukee Brewers",
						min: "Minnesota Twins",
						nym: "New York Mets",
						nyy: "New York Yankees",
						oak: "Oakland Athletics",
						phi: "Philadelphia Phillies",
						pit: "Pittsburgh Pirates",
						sdg: "San Diego Padres",
						sfo: "San Francisco Giants",
						sea: "Seattle Mariners",
						stl: "St. Louis Cardinals",
						tam: "Tampa Bay Rays",
						tex: "Texas Rangers",
						tor: "Toronto Blue Jays",
						was: "Washington Nationals"
					}
				},
				nba: {
					teams: {
						atl: "Atlanta Hawks",
						bos: "Boston Celtics",
						bro: "Brooklyn Nets",
						cha: "Charlotte Bobcats",
						chi: "Chicago Bulls",
						cle: "Cleveland Cavaliers",
						dal: "Dallas Mavericks",
						den: "Denver Nuggets",
						det: "Detroit Pistons",
						gsw: "Golden State Warriors",
						hou: "Houston Rockets",
						ind: "Indiana Pacers",
						lac: "Los Angeles Clippers",
						lal: "Los Angeles Lakers",
						mem: "Memphis Grizzlies",
						mia: "Miami Heat",
						mil: "Milwaukee Bucks",
						min: "Minnesota Timberwolves",
						nor: "New Orleans Pelicans",
						nyk: "New York Knicks",
						okc: "Oklahoma City Thunder",
						orl: "Orlando Magic",
						phi: "Philadelphia 76ers",
						pho: "Phoenix Suns",
						por: "Portland Trail Blazers",
						sac: "Sacramento Kings",
						sas: "San Antonio Spurs",
						tor: "Toronto Raptors",
						uth: "Utah Jazz",
						was: "Washington Wizards"
					}
				},
				nhl: {
					teams: {
						ana: "Anaheim Ducks",
						bos: "Boston Bruins",
						buf: "Buffalo Sabres",
						car: "Carolina Hurricanes",
						cgy: "Calgary Flames",
						chi: "Chicago Blackhawks",
						cob: "Columbus Blue Jackets",
						col: "Colorado Avalanche",
						dal: "Dallas Stars",
						det: "Detroit Red Wings",
						edm: "Edmonton Oilers",
						fla: "Florida Panthers",
						los: "Los Angeles Kings",
						min: "Minnesota Wild",
						mon: "Montreal Canadiens",
						nas: "Nashville Predators",
						njd: "New Jersey Devils",
						nyi: "New York Islanders",
						nyr: "New York Rangers",
						ott: "Ottawa Senators",
						phi: "Philadelphia Flyers",
						pho: "Phoenix Coyotes",
						pit: "Pittsburgh Penguins",
						san: "San Jose Sharks",
						stl: "St. Louis Blues",
						tam: "Tampa Bay Lightning",
						tor: "Toronto Maple Leafs",
						van: "Vancouver Canucks",
						was: "Washington Capitals",
						wpg: "Winnipeg Jets"
					}
				},
				ncaaf: {
					teams: {
						aab: "Air Force",
						aac: "Akron",
						aad: "Alabama",
						aal: "Arizona",
						aam: "Arizona State",
						aan: "Arkansas",
						aap: "Arkansas State",
						aaq: "Army",
						aar: "Auburn",
						bba: "Ball State",
						bbb: "Baylor",
						bbe: "Boise State",
						bbf: "Boston College",
						bbh: "Bowling Green",
						bbp: "Buffalo",
						bbi: "BYU",
						ccd: "California",
						ccg: "Central Michigan",
						ccj: "Cincinnati",
						ccl: "Clemson",
						ccn: "Colorado",
						cco: "Colorado State",
						ccq: "Connecticut",
						ddf: "Duke",
						eea: "East Carolina",
						eef: "Eastern Michigan",
						fli: "FIU",
						ffa: "Florida",
						ffr: "Florida Atlantic",
						ffc: "Florida State",
						ffe: "Fresno State",
						ggb: "Georgia",
						gag: "Georgia State",
						ggc: "Georgia Tech",
						hhc: "Hawaii",
						hhe: "Houston",
						iia: "Idaho",
						iic: "Illinois",
						iie: "Indiana",
						iig: "Iowa",
						iih: "Iowa State",
						kka: "Kansas",
						kkb: "Kansas State",
						kkc: "Kent State",
						kkd: "Kentucky",
						ssq: "Louisiana",
						llg: "Louisiana Tech",
						nnb: "Louisiana-Monroe",
						llh: "Louisville",
						lli: "LSU",
						mmc: "Marshall",
						mmd: "Maryland",
						mme: "Massachusetts",
						mmg: "Memphis",
						mmi: "Miami (FL)",
						mmj: "Miami (OH)",
						mmk: "Michigan",
						mml: "Michigan State",
						mmm: "Middle Tennessee",
						mmn: "Minnesota",
						mmq: "Mississippi State",
						mms: "Missouri",
						nna: "Navy",
						nnd: "Nebraska",
						nnf: "Nevada",
						nnh: "New Mexico",
						nni: "New Mexico State",
						nnl: "North Carolina",
						nnn: "North Carolina State",
						nnp: "North Texas",
						nns: "Northern Illinois",
						nnv: "Northwestern",
						nnx: "Notre Dame",
						ooa: "Ohio",
						oob: "Ohio State",
						ooc: "Oklahoma",
						ood: "Oklahoma State",
						mmo: "Ole Miss",
						ooe: "Oregon",
						oof: "Oregon State",
						ppb: "Penn State",
						ppd: "Pittsburgh",
						ppj: "Purdue",
						rrb: "Rice",
						rrd: "Rutgers",
						ssb: "San Diego State",
						ssc: "San Jose State",
						ssh: "SMU",
						sal: "South Alabama",
						ssi: "South Carolina",
						sbn: "South Florida",
						sso: "Southern Miss",
						sss: "Stanford",
						ssw: "Syracuse",
						tta: "TCU",
						ttb: "Temple",
						ttd: "Tennessee",
						tth: "Texas",
						ttj: "Texas A&M",
						ssv: "Texas State",
						tto: "Texas Tech",
						ttp: "Toledo",
						ttv: "Troy",
						tts: "Tulane",
						ttt: "Tulsa",
						aaz: "UAB",
						ccf: "UCF",
						uua: "UCLA",
						nne: "UNLV",
						uub: "USC",
						uuc: "Utah",
						uud: "Utah State",
						ttl: "UTEP",
						tsa: "UTSA",
						vva: "Vanderbilt",
						vvb: "Virginia",
						vvd: "Virginia Tech",
						wwa: "Wake Forest",
						wwb: "Washington",
						wwc: "Washington State",
						wwh: "West Virginia",
						wwk: "Western Kentucky",
						wwl: "Western Michigan",
						wwo: "Wisconsin",
						wwq: "Wyoming",
						abilene_christian: "Abilene Christian (FCS)",
						aae: "Alabama A&M (FCS)",
						aaf: "Alabama State (FCS)",
						aag: "Albany (FCS)",
						aah: "Alcorn State (FCS)",
						aak: "Appalachian State (FCS)",
						aao: "Arkansas-Pine Bluff (FCS)",
						aas: "Austin Peay (FCS)",
						bbc: "Bethune-Cookman (FCS)",
						bbj: "Brown (FCS)",
						bvx: "Bryant (FCS)",
						bbk: "Bucknell (FCS)",
						bbr: "Butler (FCS)",
						caa: "Cal Poly (FCS)",
						cam: "Campbell (FCS)",
						uca: "Central Arkansas (FCS)",
						cce: "Central Connecticut State (FCS)",
						ccz: "Charleston Southern (FCS)",
						nad: "Charlotte (FCS)",
						cas: "Chattanooga (FCS)",
						cck: "Citadel (FCS)",
						cbi: "Coastal Carolina (FCS)",
						ccm: "Colgate (FCS)",
						ccp: "Columbia (FCS)",
						ccr: "Cornell (FCS)",
						dda: "Dartmouth (FCS)",
						ddb: "Davidson (FCS)",
						ddj: "Dayton (FCS)",
						ddc: "Delaware (FCS)",
						ddd: "Delaware State (FCS)",
						dde: "Drake (FCS)",
						ddi: "Duquesne (FCS)",
						eed: "Eastern Illinois (FCS)",
						eee: "Eastern Kentucky (FCS)",
						eeg: "Eastern Washington (FCS)",
						eeo: "Elon (FCS)",
						ffb: "Florida A&M (FCS)",
						ffl: "Fordham (FCS)",
						ffg: "Furman (FCS)",
						ggf: "Gardner-Webb (FCS)",
						ggk: "Georgetown (FCS)",
						ggh: "Georgia Southern (FCS)",
						ggd: "Grambling State (FCS)",
						hha: "Hampton (FCS)",
						hhb: "Harvard (FCS)",
						hhd: "Holy Cross (FCS)",
						hhf: "Howard (FCS)",
						iib: "Idaho State (FCS)",
						iid: "Illinois State (FCS)",
						incarnate_word: "Incarnate Word (FCS)",
						iif: "Indiana State (FCS)",
						jja: "Jackson State (FCS)",
						jjg: "Jacksonville (FCS)",
						jjc: "Jacksonville State (FCS)",
						jjb: "James Madison (FCS)",
						lla: "Lafayette (FCS)",
						lab: "Lamar (FCS)",
						llc: "Lehigh (FCS)",
						lle: "Liberty (FCS)",
						mma: "Maine (FCS)",
						mad: "Marist (FCS)",
						mmf: "McNeese State (FCS)",
						mercer: "Mercer (FCS)",
						mmr: "Mississippi Valley State (FCS)",
						ssu: "Missouri State (FCS)",
						mae: "Monmouth (FCS)",
						mmu: "Montana (FCS)",
						mmv: "Montana State (FCS)",
						mmw: "Morehead State (FCS)",
						mmx: "Morgan State (FCS)",
						mmz: "Murray State (FCS)",
						nng: "New Hampshire (FCS)",
						nnk: "Nicholls (FCS)",
						nan: "Norfolk State (FCS)",
						nnm: "North Carolina A&T (FCS)",
						nac: "North Carolina Central (FCS)",
						nno: "North Dakota (FCS)",
						nds: "North Dakota State (FCS)",
						nnr: "Northern Arizona (FCS)",
						nnz: "Northern Colorado (FCS)",
						nnw: "Northwestern State (FCS)",
						oah: "Old Dominion (FCS)",
						ppc: "Penn (FCS)",
						ppe: "Portland State (FCS)",
						ppf: "Prairie View A&M (FCS)",
						ppg: "Presbyterian (FCS)",
						pph: "Princeton (FCS)",
						rra: "Rhode Island (FCS)",
						rrc: "Richmond (FCS)",
						rri: "Robert Morris (FCS)",
						ses: "Sacramento State (FCS)",
						sbe: "Sacred Heart (FCS)",
						sps: "Saint Francis U (FCS)",
						ssa: "Sam Houston State (FCS)",
						sks: "Samford (FCS)",
						sbc: "San Diego (FCS)",
						ssx: "Savannah State (FCS)",
						ssj: "South Carolina State (FCS)",
						ssk: "South Dakota (FCS)",
						sds: "South Dakota State (FCS)",
						ssf: "Southeast Missouri State (FCS)",
						sse: "Southeastern Louisiana (FCS)",
						ssn: "Southern Illinois (FCS)",
						ssl: "Southern University (FCS)",
						ssp: "Southern Utah (FCS)",
						sst: "Stephen F. Austin (FCS)",
						stetson: "Stetson (FCS)",
						sbf: "Stony Brook (FCS)",
						ttf: "Tennessee State (FCS)",
						ttg: "Tennessee Tech (FCS)",
						ttn: "Texas Southern (FCS)",
						ttq: "Towson (FCS)",
						ccb: "UC Davis (FCS)",
						nnt: "UNI (FCS)",
						tte: "UTM (FCS)",
						vvi: "Valparaiso (FCS)",
						vvh: "Villanova (FCS)",
						vve: "VMI (FCS)",
						waa: "Wagner (FCS)",
						wwe: "Weber State (FCS)",
						wwi: "Western Carolina (FCS)",
						wwj: "Western Illinois (FCS)",
						wwn: "William & Mary (FCS)",
						wwp: "Wofford (FCS)",
						yya: "Yale (FCS)",
						yyb: "Youngstown State (FCS)"
					}
				}
			};

			if (leagues[league] && leagues[league].teams) {
				cb(leagues[league].teams);
			}
			else {
				cb({
					unk: "Something seems to have gone wrong"
				});
			}
		},
		refresh: function() {
			var teams = this.config.team || "";

			if (!this.config.team && this.config.teams) {
				if (typeof this.config.teams == "object") {
					teams = (this.config.teams || []).join(",");
				}
				else {
					teams = this.config.teams;
				}
			}

			$.get("https://my.yahoo.com/_td_api/resource/sports;count=10;league=" + (this.config.league || "nfl") + ";range=curr;teams=" + encodeURIComponent(teams), function(d) {
				var games = [];

				d.forEach(function(e, i) {
					var game = {
						home_first: e.home_team ? (e.home_team.first_name || "Unknown") : "Unknown Error",
						home_last: e.home_team ? (e.home_team.last_name || "Error") : "Unknown Error",
						home_id: e.home_team ? (e.home_team.id || "unk.unk").replace(".", "/") : "unk/unk",

						away_first: e.away_team ? (e.away_team.first_name || "Unknown") : "Unknown Error",
						away_last: e.away_team ? (e.away_team.last_name || "Error") : "Unknown Error",
						away_id: e.away_team ? (e.away_team.id || "unk.unk").replace(".", "/") : "unk/unk",

						start: e.start_ts || new Date().getTime(),
						status: e.status.type || "final",
						label: e.status.label || "Final",
						coverage: ((e.tv_coverage) ? (e.tv_coverage.channels || []) : []).join(", "),
						link: (e.status && e.status.link) ? (e.status.link.href || "http://sports.yahoo.com/") : "http://sports.yahoo.com/"
					};

					if (e.score) {
						game.home_score = e.score.home_team;
						game.away_score = e.score.away_team;
					}

					games.push(game);
				});

				this.data = {
					games: games
				};

				this.render.call(this);
			}.bind(this));
		},
		render: function() {
			var data = {
					games: []
				},
				games = (this.data || {games:[]}).games;
			
			if (games.length) {
				var done = 0;

				if (this.config.size == "tiny") {
					games.forEach(function(game, i) {
						if (data.games.length >= 1 || (this.config.unavailable == "none" && this.config.teams.length && this.config.teams.indexOf(game.home_id.replace("/", ".")) == -1 && this.config.teams.indexOf(game.away_id.replace("/", ".")) == -1)) {
							return;
						}

						game.time = moment(game.start);

						game.detail = "<b>" + game.home_first + " " + game.home_last + "</b> vs <b>" + game.away_first + " " + game.away_last + "</b><br />" + game.time.calendar();

						if (game.time.isAfter()) {
							if (game.time.isSame(new Date(), "day")) {
								game.status = game.time.format("h:mm A");
							}
							else {
								game.status = game.time.format("MM/DD")
							}

							if (game.coverage) {
								game.detail += "<br />Watch on: <b>" + game.coverage + "</b>";
							}
						}
						else {
							game.detail += "<br /><b>" + game.label + "</b>";

							if (game.coverage && game.status == "in_progress") {
								game.detail += "<br />Watch on: <b>" + game.coverage + "</b>";
							}

							game.status = game.home_score + " - " + game.away_score;
						}

						data.games.push(game);
					}.bind(this));
				}
				else {
					games.forEach(function(game, i) {
						if ((this.config.number && data.games.length >= this.config.number) || (this.config.unavailable == "none" && this.config.teams.length && this.config.teams.indexOf(game.home_id.replace("/", ".")) == -1 && this.config.teams.indexOf(game.away_id.replace("/", ".")) == -1)) {
							return;
						}

						game.time = moment(game.start);

						if (game.time.isAfter()) {
							game.time = game.time.calendar().replace(/^(Yesterday|[A-Z][a-z]{5,8}|[Ll]ast [A-Z][a-z]{5,8}) (at )?.*?$/g, "$1").replace("Today at", "Today,");

							game.status = game.time + "<br />" + (game.coverage ? game.coverage : "");
						}
						else {
							game.time = game.time.calendar().replace(/^(Yesterday|[A-Z][a-z]{5,8}|[Ll]ast [A-Z][a-z]{5,8}) (at )?.*?$/g, "$1").replace("Today at", "Today,");

							game.status = game.time + "<br />" + game.label;
						}

						data.games.push(game);
					}.bind(this));
				}
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);
		}
	},
	16: {
		id: 16,
		size: 2,
		order: 11,
		name: "Bookmarks",
		nicename: "bookmarks",
		sizes: ["tiny", "variable"],
		desc: "Displays selected and customized bookmarks and other links.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title"
			},
			{
				type: "size"
			},
			{
				type: "select",
				nicename: "columns",
				label: "Layout",
				options: {
					one: "Single column",
					two: "Double column"
				},
				sizes: "variable"
			},
			{
				type: "radio",
				nicename: "target",
				label: "Open bookmarks in",
				options: {
					_self: "The current tab",
					_blank: "A new tab"
				}
			}
		],
		config: {
			title: "Bookmarks",
			size: "variable",
			columns: "one",
			target: "_self"
		},
		syncData: {
			bookmarks: [
				{
					title: "Google",
					url: "http://www.google.com/"
				},
				{
					title: "Facebook",
					url: "http://www.facebook.com/"
				},
				{
					title: "Youtube",
					url: "http://www.youtube.com/"
				},
				{
					title: "Amazon",
					url: "http://www.amazon.com/"
				},
				{
					title: "Wikipedia",
					url: "http://www.wikipedia.org/"
				}
			]
		},
		save: function() {
			this.syncData.bookmarks = this.sortable.sortable("serialize").get();

			this.utils.saveData(this.syncData);
		},
		addItem: function(data) {
			var html = '<a class="link" href="' + data.url + '"><img class="favicon" src="chrome://favicon/' +
				data.url + '" /><span class="title">' + data.title + '</span><div class="tools"><span class="' + 
				'edit">	&#xE606;</span><span class="delete">&#xE678;</span><span class="move">&#xE693;</span></div>';

			this.editItem($(html).appendTo(this.sortable));

			this.save();
		},
		editItem: function(item) {
			var modal = this.modal;

			modal.url.val(item.attr("href"));
			modal.title.val(item.find(".title").text());

			modal.save = function(e) {
				e.preventDefault();

				this.adding = false;

				modal.hide();

				item.attr("href", modal.url.val().trim().parseUrl())
					.find(".title").text(modal.title.val().trim()).end()
					.find(".favicon").attr("src", "chrome://favicon/" + modal.url.val().trim().parseUrl());

				this.save();
			}.bind(this);

			modal.show();
		},
		adding: false,
		render: function() {
			if (this.data) {
				this.syncData = $.extend(true, {}, this.data);

				delete this.data;
			}

			var data = $.extend({}, this.syncData || {});

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (this.config.columns && this.config.columns !== "one" && this.config.size !== "tiny") {
				data.two = true;
			}

			if (this.config.target && this.config.target == "_blank") {
				data.newTab = true;
			}

			this.utils.render(data);


			var modalHTML = '<h2 class="title">Edit Bookmark</h2>\
				<form>\
					<div class="form-group">\
						<label for="bookmark-title">Bookmark Title</label>\
						<input type="text" class="form-control" id="bookmark-title" maxlength="255" placeholder="Google" />\
					</div>\
				\
					<div class="form-group">\
						<label for="bookmark-url">Bookmark URL</label>\
						<input type="text" class="form-control" id="bookmark-url" maxlength="500" placeholder="http://www.google.com/" />\
					</div>\
				\
				</form>\
				\
				<button class="btn btn-primary">Save</button>';

			this.modal = new iChrome.Modal({
				width: 400,
				height: 290,
				html: modalHTML,
				classes: "bookmarks-modal"
			}, function() {
				this.adding = false;

				this.modal.hide();
			}.bind(this));

			this.modal.save = function() {};

			this.modal.title = this.modal.elm.find("#bookmark-title");
			this.modal.url = this.modal.elm.find("#bookmark-url");
			this.modal.btn = this.modal.elm.find(".btn").click(function(e) {
				this.modal.save(e);
			}.bind(this));

			this.modal.title.add(this.modal.url).on("keydown", function(e) {
				if (e.which == 13) {
					this.modal.save(e);
				}
			}.bind(this));

			var that = this;

			this.sortable = this.elm.on("click", ".link .delete", function(e) {
				e.preventDefault();

				$(this).parent().parent().slideUp(function() {
					$(this).remove();

					that.save.call(that);
				});
			}).on("click", ".link .edit", function(e) {
				e.preventDefault();

				that.editItem.call(that, $(this).parent().parent());
			}).on("dragenter dragover", function() {

				$(this).find(".drop").addClass("active");

			}).on("dragleave dragexit", ".drop", function() {

				$(this).removeClass("active");

			}).on("input", ".catch", function(e) {
				e.preventDefault();
				
				var link = $(this).find("a").first();

				if (link.length) {
					that.addItem.call(that, {
						title: link.text(),
						url: link.attr("href")
					});
				}

				link.end().end().html("").parent().removeClass("active");
			}).on("click", ".new", function(e) {
				if (!that.adding) {
					that.adding = true;

					that.addItem.call(that, {
						title: "",
						url: ""
					});
				}
			}).find(".list").sortable({
				handle: ".move",
				itemSelector: "a",
				placeholder: "<a class=\"link holder\"/>",
				onDragStart: function(item, container, _super) {
					item.css({
						height: item.outerHeight(),
						width: item.outerWidth()
					});

					item.addClass("dragged");

					$(document.body).addClass("dragging");
				},
				onDrag: function(item, position, _super) {
					var ctx = $(item.context),
						ctp = ctx.position(),
						ctpp = ctx.parent().position();

					position.top -= ctp.top + ctpp.top + 10;
					position.left -= ctp.left + ctpp.left + 10;

					item.css(position);
				},
				onDrop: function(item, container, _super) {
					that.save.call(that);

					_super(item, container);
				},
				serialize: function(item, children, isContainer) {
					if (isContainer) {
						return children;
					}
					else {
						return {
							title: item.find(".title").text().trim().slice(0, 255),
							url: item.attr("href").trim().slice(0, 500)
						};
					}
				},
			});
		}
	},
	17: {
		id: 17,
		size: 2,
		order: 17,
		name: "To-do",
		nicename: "todo",
		sizes: ["variable"],
		desc: "Displays an interactive to-do list with important and completed items.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			}
		],
		config: {
			title: "To-do list",
			size: "variable"
		},
		syncData: {
			items: [
				{
					title: "These are sample to-do items"
				},
				{
					title: "This one is important",
					important: true
				},
				{
					title: "This one is done",
					done: true
				},
				{
					title: "And this one is undone"
				}
			]
		},
		save: function() {
			this.syncData.items = this.sortable.sortable("serialize").get();

			this.utils.saveConfig(this.data);
		},
		addItem: function(title, after) {
			if (typeof title !== "string") {
				after = title;
				title = "";
			}

			var html = '<div class="item"><div class="check">&#x2713;</div><input class="title" type="text" maxlength="255" value="' +
				title + '" /><div class="tools"><span class="important">&#x1F4A5;</span><span class="delete">&#x2715;</span><span c' +
				'lass="move">&#xE005;</span></div></div>';

			if (after) $(html).insertAfter(after).find(".title").focus();
			else $(html).appendTo(this.sortable).find(".title").focus();

			this.save();
		},
		render: function() {
			if (this.data) {
				this.syncData = $.extend(true, {}, this.data);

				delete this.data;
			}

			var data = $.extend({}, this.syncData || {});

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);

			var that = this;

			this.sortable = this.elm.on("click", ".item .delete", function(e) {
				$(this).parent().parent().slideUp(function() {
					$(this).remove();

					that.save.call(that);
				});
			}).on("click", ".item .important", function(e) {
				$(this).parent().parent().toggleClass("important");

				that.save.call(that);
			}).on("click", ".item .check", function(e) {
				$(this).parent().toggleClass("done");

				that.save.call(that);
			}).on("keydown", ".item .title", function(e) {
				if (e.which == 13) {
					e.preventDefault();

					that.addItem.call(that, $(this).parent());
				}
			}).on("input", ".item .title", function(e) {
				that.save.call(that);
			}).on("click", ".new", function(e) {
				that.addItem.call(that);
			}).find(".list").sortable({
				handle: ".move",
				itemSelector: ".item",
				placeholder: "<div class=\"item holder\"/>",
				onDragStart: function(item, container, _super) {
					item.css({
						height: item.outerHeight(),
						width: item.outerWidth()
					});

					item.addClass("dragged");

					$(document.body).addClass("dragging");
				},
				onDrag: function(item, position, _super) {
					var ctx = $(item.context),
						ctp = ctx.position(),
						ctpp = ctx.parent().position();

					position.top -= ctp.top + ctpp.top + 10;
					position.left -= ctp.left + ctpp.left + 10;

					item.css(position);
				},
				onDrop: function(item, container, _super) {
					that.save.call(that);

					_super(item, container);
				},
				serialize: function(item, children, isContainer) {
					if (isContainer) {
						return children;
					}
					else {
						var ret =  {
							title: item.find(".title").val().trim().slice(0, 255)
						};

						if (item.hasClass("important")) {
							ret.important = true;
						}

						if (item.hasClass("done")) {
							ret.done = true;
						}

						return ret;
					}
				},
			});
		}
	},
	18: {
		id: 18,
		size: 6,
		order: 15.5,
		name: "Reddit",
		interval: 300000,
		nicename: "reddit",
		sizes: ["variable"],
		desc: "Displays the top items on Reddit for any given subreddit.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "text",
				nicename: "subreddit",
				label: "Subreddit",
				help: "Enter any subreddit by the part past <b>/r/</b> when on Reddit.<br /><br />For example, Technology is at: <a href=\"http://www.reddit.com/r/technology\">http://www.reddit.com/r/technology</a>, therefore you would enter <b>technology</b>",
				placeholder: "Enter a subreddit to show links from. (i.e. technology)"
			},
			{
				type: "select",
				nicename: "sort",
				label: "Sort Order",
				options: {
					hot: "Hot",
					top: "Top",
					"new": "New",
					gilded: "Gilded",
					rising: "Rising",
					controversial: "Controversial"
				}
			},
			{
				type: "number",
				nicename: "number",
				label: "Links Shown",
				min: 1,
				max: 10
			},
			{
				type: "radio",
				nicename: "click",
				label: "When I click a link show me",
				options: {
					link: "The link",
					comments: "The comments"
				}
			},
			{
				type: "radio",
				nicename: "link",
				label: "Footer Link",
				options: {
					show: "Show",
					hide: "Hide"
				}
			}
		],
		config: {
			size: "variable",
			title: "Reddit",
			number: 5,
			sort: "hot",
			subreddit: "all",
			link: "show",
			click: "link"
		},
		data: {
			links: [
				{
					id: "t3_1u5nzu",
					link: "http://imgur.com/pa5X7gH",
					user: "BigGulpsHuh7",
					score: 1740,
					title: "Worst lady of 2013 (fixed) (fixed)",
					domain: "imgur.com",
					subreddit: "funny",
					permalink: "/r/funny/comments/1u5nzu/worst_lady_of_2013_fixed_fixed/",
					created: 1388583609000,
					comments: "124",
					image: "http://f.thumbs.redditmedia.com/x1LB_aco57Z-zBEk.jpg"
				},
				{
					id: "t3_1u5j8t",
					link: "http://www.youtube.com/watch?v=-N_UuImPL4E",
					user: "untranslatable_pun",
					score: 2060,
					title: "THE WIRE: Snoop Buys a Nail Gun. My favorite scene from the entire series. (No spoilers)",
					domain: "youtube.com",
					subreddit: "videos",
					permalink: "/r/videos/comments/1u5j8t/the_wire_snoop_buys_a_nail_gun_my_favorite_scene/",
					created: 1388574231000,
					comments: "697",
					image: "http://b.thumbs.redditmedia.com/OINzo6WMdTbZUHQa.jpg"
				},
				{
					id: "t3_1u5m1r",
					link: "http://i.imgur.com/fBHxyZl.jpg",
					user: "hms90",
					score: 1471,
					title: "Meet the latest addition to our family, Slim Shady.",
					domain: "i.imgur.com",
					subreddit: "aww",
					permalink: "/r/aww/comments/1u5m1r/meet_the_latest_addition_to_our_family_slim_shady/",
					created: 1388579835000,
					comments: "78",
					image: "http://c.thumbs.redditmedia.com/oJNpAN5uFgXD9zH8.jpg"
				},
				{
					id: "t3_1u5gru",
					link: "http://i.imgur.com/Ia845vX.gif",
					user: "teap0ts",
					score: 2449,
					title: "Best use of my tax dollars I've seen yet",
					domain: "i.imgur.com",
					subreddit: "gifs",
					permalink: "/r/gifs/comments/1u5gru/best_use_of_my_tax_dollars_ive_seen_yet/",
					created: 1388569461000,
					comments: "209"
				},
				{
					id: "t3_1u5ier",
					link: "http://www.reuters.com/article/2014/01/01/us-hongkong-democracy-idUSBREA0005420140101?feedType=RSS&amp;feedName=worldNews",
					user: "Litteratur",
					score: 1967,
					title: "Thousands march in Hong Kong in escalating battle for democracy",
					domain: "reuters.com",
					subreddit: "worldnews",
					permalink: "/r/worldnews/comments/1u5ier/thousands_march_in_hong_kong_in_escalating_battle/",
					created: 1388572611000,
					comments: "365"
				},
				{
					id: "t3_1u5ieg",
					link: "http://www.aljazeera.com/indepth/opinion/2013/12/what-snowden-really-revealed-20131228113515573236.html",
					user: "jstratg",
					score: 1886,
					title: "What Snowden really revealed: We have sacrificed our freedoms and morals in order to make war on those abroad, and, more subtly, on ourselves",
					domain: "aljazeera.com",
					subreddit: "politics",
					permalink: "/r/politics/comments/1u5ieg/what_snowden_really_revealed_we_have_sacrificed/",
					created: 1388572589000,
					comments: "230"
				},
				{
					id: "t3_1u5dj5",
					link: "http://imgur.com/ISzszsN",
					user: "cp3woo",
					score: 2910,
					title: "Mike Tyson just posted this on twitter with the caption, \"Happy New Ears\"",
					domain: "imgur.com",
					subreddit: "funny",
					permalink: "/r/funny/comments/1u5dj5/mike_tyson_just_posted_this_on_twitter_with_the/",
					created: 1388563858000,
					comments: "217",
					image: "http://f.thumbs.redditmedia.com/bK1m2Urw9lDtWVoA.jpg"
				},
				{
					id: "t3_1u5gow",
					link: "http://i.imgur.com/6QXBwM9.jpg",
					user: "Our_gamers",
					score: 2148,
					title: "One of my favorite family guy scenes",
					domain: "i.imgur.com",
					subreddit: "funny",
					permalink: "/r/funny/comments/1u5gow/one_of_my_favorite_family_guy_scenes/",
					created: 1388569299000,
					comments: "59"
				},
				{
					id: "t3_1u5mwr",
					link: "http://i.imgur.com/COeUCqr.gif",
					user: "not_a_famous_actor",
					score: 1028,
					title: "Richie wouldn't let his blindness stop him from following his dreams of becoming a graffiti artist",
					domain: "i.imgur.com",
					subreddit: "wheredidthesodago",
					permalink: "/r/wheredidthesodago/comments/1u5mwr/richie_wouldnt_let_his_blindness_stop_him_from/",
					created: 1388581499000,
					comments: "17",
					image: "http://d.thumbs.redditmedia.com/JWoNW_i9l2zful9o.jpg"
				},
				{
					id: "t3_1u5e3d",
					link: "http://i.imgur.com/SglJI42.jpg",
					user: "queen_of_the_koopas",
					score: 2236,
					title: "Wicked awesome bunk bed my friend built her kid!",
					domain: "i.imgur.com",
					subreddit: "gaming",
					permalink: "/r/gaming/comments/1u5e3d/wicked_awesome_bunk_bed_my_friend_built_her_kid/",
					created: 1388564740000,
					comments: "107"
				}
			]
		},
		refresh: function() {
			var config = this.config;

			$.get("http://www.reddit.com/" + (config.subreddit && config.subreddit !== "" ? "r/" + config.subreddit : "") + (config.sort && config.sort !== "" && config.sort !== "hot" ? "/" + config.sort : "") + ".json?limit=10", function(d) {
				var links = [];

				d.data.children.slice(0, 10).forEach(function(e, i) {
					e = e.data;

					var link = {
						id: e.name,
						link: e.url,
						user: e.author,
						score: e.score,
						title: e.title,
						domain: e.domain,
						subreddit: e.subreddit,
						permalink: e.permalink,
						created: e.created_utc * 1000,
						comments: e.num_comments.toLocaleString()
					};

					if (e.thumbnail && e.thumbnail !== "" && e.thumbnail.trim().indexOf("http") == "0") {
						link.image = e.thumbnail.trim();
					}

					links.push(link);
				});

				this.data = {
					links: links
				};

				this.render.call(this);

				this.utils.saveData(this.data);
			}.bind(this));
		},
		render: function(demo) {
			var data = $.extend(true, {}, this.data || {links:[]});

			data.links = data.links.slice(0, this.config.number || 5);

			data.links.forEach(function(e, i) {
				if (demo) e.created = moment(e.created).from([2014, 0, 1, 11]).replace("hour", "hr").replace("minute", "min").replace("a few ", "");
				else e.created = moment(e.created).fromNow().replace("hour", "hr").replace("minute", "min").replace("a few ", "");

				if (!e.subreddit.toLowerCase || e.subreddit.toLowerCase() == this.config.subreddit.toLowerCase()) {
					e.subreddit = false;
				}

				if (this.config.click && this.config.click == "comments") {
					e.link = "http://www.reddit.com" + e.permalink;
				}

				if (e.score < 0) {
					e.direction = " down"
				}

				e.score = e.score.toLocaleString();
			}.bind(this));

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			if (this.config.link && this.config.link == "show") {
				data.link = "http://www.reddit.com/" + (this.config.subreddit && this.config.subreddit !== "" ? "r/" + this.config.subreddit : "");
			}

			this.utils.render(data);
		}
	},
	19: {
		id: 19,
		size: 6,
		order: 6.5,
		name: "Feedly",
		interval: 300000,
		nicename: "feedly",
		sizes: ["variable"],
		desc: "Displays articles from your Feedly account in a configurable format.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "select",
				nicename: "source",
				label: "Show articles from",
				options: "getSources"
			},
			{
				type: "radio",
				nicename: "show",
				label: "Show",
				options: {
					all: "All articles",
					unread: "Only unread articles"
				}
			},
			{
				type: "select",
				nicename: "view",
				label: "Layout",
				options: {
					list: "Titles only",
					magazine: "Magazine",
					cards: "Cards",
					"cards dual": "Cards (two columns)"
				}
			},
			{
				type: "radio",
				nicename: "mark",
				label: "Mark an article as read when I",
				options: {
					scroll: "Scroll past it or click it",
					click: "Just click it"
				}
			},
			{
				type: "radio",
				nicename: "sort",
				label: "Sort Order",
				options: {
					newest: "Newest first",
					oldest: "Oldest first"
				}
			},
			{
				type: "radio",
				nicename: "link",
				label: "Footer Link",
				options: {
					show: "Show",
					hide: "Hide"
				}
			}
		],
		config: {
			size: "variable",
			title: "Feedly",
			source: "feed/http://feeds.gawker.com/lifehacker/vip/",
			show: "all",
			view: "cards dual",
			mark: "click",
			sort: "newest",
			link: "show"
		},
		data: {
			articles: [
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_14354a6731b:d089:623b9014",
					content: "<img alt=\"\" src=\"http://cdn1.sbnation.com/entry_photo_images/9627611/shutterstock_61775431_large.jpg\">\n<p>A few weeks ago, the Innocence Project of New York (IP) announced that it had helped to release another innocent person from prison. This time it was Gerard Richardson. As <a target=\"_blank\" href=\"http://www.theverge.com/2013/9/25/4770070/biting-controversy-forensic-dentistry-battles-to-prove-its-not-junk\"><i>The Verge</i> outlined in September</a>, Richardson was convicted of murdering a New Jersey woman in 1994 after a forensic odontologist concluded that the shape of Richardson’s jaw and the orientation of his teeth matched a bite mark on the murdered woman’s back.</p>\n<p>After years of legal wrangling, IP was finally allowed to conduct a DNA test to double-check the odontologist’s conclusions. Their goal: to determine whether saliva swabbed from the bite mark in 1994 matched Richardson’s genetic makeup. It didn’t. The odontologist’s conclusion was proven false. Given this new information, prosecutors dropped Richardson’s case, and a judge declared him exonerated. After serving 19 years behind bars for a crime he had nothing to do with, <a target=\"_blank\" href=\"http://www.usatoday.com/story/news/nation/2013/12/18/gerald-richardson-exonerated-dna/4107817/\">Richardson finally walked home to his family as a free man on December 17th</a>.</p>\n<p>Richardson’s ordeal is but one in a steadily increasing number of cases overturned using DNA evidence. To this day, IP is aware of <a target=\"_blank\" href=\"http://www.innocenceproject.org/know/\">311 such exonerations</a> — cases in which someone was declared innocent of a crime long after they had been convicted in court. About 70 percent of those exonerations relied on DNA evidence.</p>\n<p>But if you ask David A. Harris, that number should be much higher. Not only that; he also says new technology could accelerate such exonerations now — if only law enforcement would make the decision to use it.</p>\n<p><q>DNA has exonerated hundreds of innocent prisoners</q></p>\n<p>Harris is <a target=\"_blank\" href=\"http://law.pitt.edu/people/full-time-faculty/david-a-harris\">a law professor at the University of Pittsburgh</a> who focuses on police behavior and law enforcement regulation. Last year, he published his third book, <a target=\"_blank\" href=\"http://nyupress.org/books/book-details.aspx?bookid=7958#.UrNXR2RDt9c\"><i>Failed Evidence</i></a>, which argues that people in law enforcement are not only late to adopt state-of-the-art technology and scientific breakthroughs, they’re also fundamentally resistant to new innovations and to science.</p>\n<p>An example of this, he writes, can be found in law enforcement’s approach to DNA.</p>\n<p>While DNA evidence is often seen as a hyper-advanced, solve-anything, find-anyone technology from its portrayal on TV shows like <i>Law and Order: SVU</i> and <i>Dexter</i>, many of the FBI’s standards for DNA analysis are nearly 20 years old. (The <a target=\"_blank\" href=\"http://www.fbi.gov/about-us/lab/biometric-analysis/codis/swgdam-interpretation-guidelines\">FBI’s current standards cite a committee report</a> from the National Research Council titled, <i>An Update: The Evaluation of Forensic DNA Evidence</i>. That update occurred in 1996.)</p>\n<p>Those FBI standards, Harris writes, are way out of date. And as those standards sink further into obsolescence, many criminal cases are likely going unsolved, and many faulty convictions are likely going unchallenged.</p>\n<p>Today’s forensic DNA analysis relies on &quot;rules and procedures set up to allow relatively easy processing by lab personnel,&quot; Harris explains. Human beings, in other words, are expected to interpret DNA evidence one piece at a time, and then explain their analysis in court. Because current standards require a human being, and not a computer, to interact with every DNA sample, the analysis is labor intensive and can take a long time to carry out. As a result, crime labs can get bogged down if there’s a lot of evidence to analyze. And most DNA evidence gets tossed aside because it’s too complicated for a human to interpret.</p>\n<p><q>&quot;DNA evidence is much more complex than most labs can handle.&quot;</q></p>\n<p>About that: an ideal DNA swab has one clear contributor. The Gerard Richardson case is a perfect example: one <i>unknown</i> person bit into a <i>known</i> person’s flesh. Analysts needed only to determine whether Richardson’s DNA matched that of the <i>unknown</i> person. It didn’t, and so his charges were dropped.</p>\n<p>But when the number of unknown contributors to a DNA sample goes above one — or when the sample is tarnished in some way, or determined to be too miniscule to be analyzed by a person — there’s not much than can be done under current standards. Complicated DNA samples are thus called &quot;uninterpretable&quot; and often ignored.</p>\n<p>This is no secret, either. Even the quintessential document about forensic science written in the last decade — the National Academy of Sciences’ (NAS) <a target=\"_blank\" href=\"https://www.ncjrs.gov/pdffiles1/nij/grants/228091.pdf\">Strengthening Forensic Science in the United States</a>, published in August, 2009 — laments that &quot;DNA tests performed on a contaminated or otherwise compromised sample cannot be used reliably to identify or eliminate an individual as the perpetrator of a crime.&quot;</p>\n<p>In reality, that’s not true anymore. DNA analysis has moved way beyond both FBI standards and NAS’ depiction of DNA’s limits.</p>\n<p>Harris points to <a target=\"_blank\" href=\"http://www.cybgen.com/\">Cybergenetics</a>, a company based down the road from his university office in Pittsburgh, that’s developed software called TrueAllele. An allele is a gene form that helps distinguish one person’s DNA as unique. TrueAllele uses algorithms rather than the naked eye to identify contributors to a DNA sample. Because it’s computer-based, it can interpret a lot of DNA evidence at once. The technique can also interpret DNA evidence currently considered tarnished. And it can identify as many as five unknown contributors to a DNA sample instead of just one.</p>\n<p>&quot;DNA evidence is much more complex than most labs can handle,&quot; says Dr. Ria David, one of Cybergenetics’ principals, who says as much as 80 percent of the evidence collected at crime scenes gets thrown away or cast aside. Cybergenetics’ software has been used in a number of high-profile cases, she says, but its use is limited.</p>\n<p>According to Harris, law enforcement’s resistance to accepting computer-based DNA analysis amounts to a travesty. Think about it: if Dr. David is correct, and 80 percent of the DNA evidence collected at crime scenes today is neglected, what would happen if even half of that neglected evidence were able to be tested going forward? &quot;You would get many more convictions and probably many more exonerations, too,&quot; Harris says. &quot;If you thought DNA was a powerful tool for finding the truth, [Cybergenetics’] method is just that much more powerful and precise.&quot;</p>\n<p><q>&quot;If you thought DNA was a powerful tool for finding the truth...&quot;</q></p>\n<p>Harris sees computer-aided DNA analysis as &quot;indisputably better&quot; than what’s available today. (The technical descriptor for Cybergenetics’ software is &quot;automated short tandem repeat STR analysis,&quot; and other companies such as the <a target=\"_blank\" href=\"http://advancedforensicdna.com/corporate/management/\">Center for Advanced DNA Analysis</a>, <a target=\"_blank\" href=\"http://www.bodetech.com/forensic-solutions/dna-identification/\">Bode Technology</a>, and <a target=\"_blank\" href=\"http://www.zygem.com/about/the-company\">ZyGem</a> are making similar strides forward.) &quot;In five years,&quot; he predicts, &quot;law enforcement will have no choice. But that moment hasn't come yet.&quot; He imagines it could arrive, however, as more prisoners such as Gerard Richardson force courts to allow the retesting of old DNA evidence.</p>\n<p>&quot;It’s my belief that we’re just at the tip of the iceberg when it comes to exonerations,&quot; he says. &quot;Three hundred may not sound like a lot in comparison to the number of people who are in prison right now. But the number is only going to rise as advanced DNA analysis finds its way into the hands of more law enforcement agencies, more prosecutors, more defense attorneys.&quot;</p>",
					excerpt: "A few weeks ago, the Innocence Project of New York (IP) announced that it had helped to release another innocent person from prison. This time it was Gerard Richardson. As The Verge outlined in September, Richardson was convicted of murdering a New Jersey woman in 1994 after a forensic odontologist ",
					author: "mattstroud",
					title: "Is DNA analysis stuck in the past?",
					date: 1388692811000,
					link: "http://www.theverge.com/2014/1/2/5266196/is-dna-analysis-stuck-in-the-past",
					source: "The Verge -\tAll Posts",
					image: "http://b.vimeocdn.com/ts/452/218/452218069_1280.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143548aea14:cd7b:623b9014",
					content: "<img alt=\"\" src=\"http://cdn3.sbnation.com/entry_photo_images/9628447/2013-09-09_21-23-13-1020_large.jpg\">\n<p>Intel spent much of the last year talking up its <a href=\"http://www.theverge.com/2013/2/12/3980948/intel-confirms-internet-tv-plans-complete-with-a-set-top-box\">ambitious plan to launch an internet TV service</a> — but its grand plans eventually <a href=\"http://www.theverge.com/2013/11/25/5145508/intel-looking-to-sell-internet-tv-technology-for-500-million\">fell by the wayside</a>. Now, we're hearing why: new CEO Brian Krzanich told <i>Recode</i> that Intel's plans went up in smoke because it wasn't able to get the content it needed. &quot;When you go and play with the content guys, it's all about volume,&quot; said Krzanich. &quot;and we come at it with no background, no experience, no volume. We were ramping from virtually zero.&quot;</p>\n<p>Verizon has been <a href=\"http://www.theverge.com/2013/10/30/5046510/intel-may-leave-web-tv-service-in-verizons-hands\">rumored to be the front-runner</a> to purchase Intel's failed venture, and Krzanich's quotes make it sound like they'd be a natural match for what Intel has developed thus far. &quot;What we've said is we are out looking for a partner that can help us scale that volume at a much quicker rate,&quot; he said. Verizon already has extensive relationships with content providers for its cable services — the hardware that Intel's been building could eventually power Verizon's content network if the deal comes to pass. Krzanich still sounds proud of that hardware, saying that Intel build a &quot;great device&quot; with &quot;great technology.&quot;</p>\n<p>Krzanich's admissions come after earlier reports said that Intel's new CEO <a href=\"http://www.theverge.com/tech/2013/11/21/5128592/why-intel-canned-its-planned-intel-tv-service\">decided not to focus on TV</a> almost immediately after he <a href=\"http://www.theverge.com/2013/5/2/4292976/intel-brian-krzanich-ceo\">took over in May of last year.</a> Breaking into the TV market would have ultimately been to costly and too much of a distraction to Intel, particularly as he tried to focus Intel's efforts on two bigger threats: the declining PC industry and Intel's lack of progress in the fast-growing mobile and tablet markets. The saga of Intel's failed TV venture still isn't quite over yet, though — despite the rumors of Verizon's interest, the company hasn't sold off its work just yet.</p>",
					excerpt: "Intel spent much of the last year talking up its ambitious plan to launch an internet TV service — but its grand plans eventually fell by the wayside. Now, we're hearing why: new CEO Brian Krzanich told Recode that Intel's plans went up in smoke because it wasn't able to get the content it needed. \"",
					author: "Nathan Ingraham",
					title: "Intel killed its internet TV project because it couldn't make content deals",
					date: 1388692408000,
					link: "http://www.theverge.com/2014/1/2/5266924/intel-killed-its-internet-tv-project-because-it-couldnt-make-content-deals",
					source: "The Verge -\tAll Posts",
					image: "http://cdn1.sbnation.com/entry_photo_images/9188405/LG_G_Flex-3_large_verge_medium_landscape.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143548aea14:cd7a:623b9014",
					content: "<img alt=\"\" src=\"http://cdn3.sbnation.com/entry_photo_images/9628429/IMG_4234-1024_large.jpg\">\n<p>Microsoft has started updating the Intel processor in its Surface Pro 2 tablets. The software giant originally released the Surface Pro 2 on October 22nd, and after just two months the latest retail units now contain a processor clocked at 1.9GHz instead of the stock 1.6GHz Intel i5-4200U chip that originally shipped with the tablet.</p>\n<p>A Microsoft spokesperson confirmed the change in a statement to <i>The Verge</i>. &quot;Microsoft routinely makes small changes to internal components over the lifetime of a product, based on numerous factors including supply chain partnerships, availability, and value for our customers,&quot; says a Microsoft spokesperson. &quot;With any change to hardware or software, we work to ensure that the product experience remains excellent.&quot;</p>\n<p><q>New models appear to have started shipping in late December</q></p>\n<p>One Surface Pro 2 owner <a target=\"_blank\" href=\"http://answers.microsoft.com/en-us/surface/forum/surfpro2-surfhardware/surface-pro-25-i5-4300u-19-ghz-25-ghz/bb77fa47-1516-4979-ad74-af6b021d6656\">noticed the change</a> after swapping his faulty unit following a recent<a href=\"http://www.theverge.com/2013/12/18/5224996/microsoft-pulls-latest-surface-pro-2-firmware-update\"> firmware update issue</a>. Recent <a target=\"_blank\" href=\"http://browser.primatelabs.com/geekbench3/search?page=1&q=Surface+Pro+2&utf8=%E2%9C%93\">Geekbench scores</a> suggest Microsoft made the change in late December, but Microsoft has not provided timing to<i> The Verge</i>. Aside from the speed improvement, the two Intel i5 processors (<a target=\"_blank\" href=\"http://ark.intel.com/products/75459/\">4200U</a> and <a target=\"_blank\" href=\"http://ark.intel.com/products/76308/\">4300U</a>) are relatively similar. The new i5-4300U chipset is clocked higher, and it also includes Intel’s Trusted Execution Technology for improved software security.</p>\n<p>The rationale behind a processor speed bump is unclear, and Microsoft isn’t commenting on its decision to improve the Surface Pro 2 components after just two months. Several <a target=\"_blank\" href=\"http://mashable.com/2013/12/15/microsoft-surface-pro-2-and-surface-2-sold-out-at-many-locations/\">recent reports</a> have noted that Microsoft’s Surface 2 and Surface Pro 2 tablets have remained largely out of stock over the holidays, alongside the timing of the processor change on the Pro 2 model. The refreshed model is now filtering into retail channels, so any future stock should start to ship with the faster Intel processor.</p>\n<p><i>Thanks, Leonardo!</i></p>",
					excerpt: "Microsoft has started updating the Intel processor in its Surface Pro 2 tablets. The software giant originally released the Surface Pro 2 on October 22nd, and after just two months the latest retail units now contain a processor clocked at 1.9GHz instead of the stock 1.6GHz Intel i5-4200U chip that ",
					author: "Tom Warren",
					title: "Surface Pro 2 now shipping with faster processor, just two months after launch",
					date: 1388691929000,
					link: "http://www.theverge.com/2014/1/2/5266988/surface-pro-2-intel-i5-processor-updated-specifications",
					source: "The Verge -\tAll Posts",
					image: "http://cdn1.sbnation.com/entry_photo_images/9188405/LG_G_Flex-3_large_verge_medium_landscape.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143546f6d54:ca14:623b9014",
					excerpt: "That was quick. BlackBerry is parting ways with Alicia Keys, less than a year after recording artist was hired to come on as the company's \"global creative director.\" The partnership was unveiled at an event last January when the company launched its BlackBerry 10 OS. Keys was tapped to \"inspire the",
					content: "<img alt=\"\" src=\"http://cdn2.sbnation.com/entry_photo_images/9628193/alicia-keys-blackberry-thorsten-heins-stock2_1020_large.jpg\">\n<p>That was quick. BlackBerry is parting ways with Alicia Keys, less than a year after recording artist was hired to<a href=\"http://www.theverge.com/2013/1/30/3932048/blackberry-announces-alicia-keys-as-global-creative-director\"> come on as the company's &quot;global creative director.</a>&quot; The partnership was unveiled at an event last January when the company launched its BlackBerry 10 OS. Keys was tapped to &quot;inspire the future&quot; of the company, which took years to ready a new platform to more readily compete with the burgeoning crop of smartphones and tablets from competitors like Google and Apple. In a statement to <a target=\"_blank\" href=\"http://www.ctvnews.ca/business/singer-alicia-keys-to-leave-blackberry-after-year-long-collaboration-1.1615273#ixzz2pGl0TGTH\">CTV News</a> today, the company thanked Keys for her service, without going detail about what exactly she had done during her tenure.</p>\n<hr>\n<p><q>Less than a year later</q></p>\n<p>Keys' hire was just the latest in <a href=\"http://www.theverge.com/2013/1/30/3934122/why-alicia-keys-for-blackberry-10\">a string of celebrity endorsements for tech companies</a>, though came with some controversy. Prior to signing on with BlackBerry, Keys was an avid iPhone user, and had even developed an iOS app that let users add her image to their own photos. Just a month after signing on with BlackBerry, she sent out <a href=\"http://www.theverge.com/2013/2/11/3977958/blackberry-creative-director-alicia-keys-tweeting-iphone-hacked\">a tweet from her iPhone</a>, something she later attributed to being hacked.\tShe also walked away from a very active, and well-followed Instagram account, which at the time was only available on iOS and Android.</p>\n<p>Keys already appears to be back to using other platforms; the artist tweeted from her iPad on New Year's Eve:</p>\n<blockquote lang=\"en\">\n<p>Wishing u a blissful new year! Let go of our shadows; Old things,old thoughts, old ways. Lets step nto our light! Here's 2 the best 2 come!</p>\n— Alicia Keys (@aliciakeys) <a href=\"https://twitter.com/aliciakeys/statuses/418257194308476928\">January 1, 2014</a>\n</blockquote>\n<p>\n</p>\n<p>The end of the partnership comes as BlackBerry continues its attempt at a comeback. The beleaguered company tallied up billions in losses last year, while shedding executives like CEO Thorsten Heins, who <a href=\"http://www.theverge.com/2013/11/4/5064278/blackberry-ceo-steps-down-as-company-secures-1-billion-funding-from\">left in November</a>, <a href=\"http://www.theverge.com/2013/11/25/5143144/three-key-blackberry-executives-ousted\">and was quickly followed by other top executives</a>. Attempts to take over the company have also been scrapped, <a href=\"http://www.theverge.com/2013/10/10/4824858/blackberry-co-founders-lazaridis-fregin-considering-acquisition\">including one from Mike Lazaridis</a>, who co-founded the company and was its CEO, though more recently has been <a target=\"_blank\" href=\"http://www.vancouversun.com/business/Lazaridis+sells+BlackBerry+shares/9327084/story.html\">selling off millions of his shares</a> in the company.</p>",
					author: "Josh Lowensohn",
					title: "BlackBerry and singer Alicia Keys part ways",
					date: 1388690688000,
					link: "http://www.theverge.com/2014/1/2/5266838/blackberry-and-singer-alicia-keys-part-ways",
					source: "The Verge -\tAll Posts",
					unread: true,
					recommendations: 35,
					image: "http://cdn0.sbnation.com/entry_photo_images/9628193/alicia-keys-blackberry-thorsten-heins-stock2_1020_large.jpg"
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143546f6d54:ca13:623b9014",
					excerpt: "Just as loud noises can make small objects jitter on a table, powerful acoustic vibrations can lift things like toothpicks or water droplets into mid-air. Rather than just letting them levitate, though, researchers from the University of Tokyo and Nagoya Institute of Technology set tiny particles in",
					content: "<img alt=\"\" src=\"http://cdn1.sbnation.com/entry_photo_images/9628187/Screen_Shot_2014-01-02_at_11.11.00_AM_large.png\">\n<p>Just as loud noises can make small objects jitter on a table, powerful acoustic vibrations can lift things like toothpicks or water droplets into mid-air. Rather than just letting them levitate, though, researchers from the University of Tokyo and Nagoya Institute of Technology set tiny particles in a dance between shifting, overlapping ultrasonic beams that could shift them around a small cubic space. The resulting video combines graceful, gravity-defying motion with an explanation of how the system actually works, and the <a target=\"_blank\" href=\"http://arxiv.org/pdf/1312.4006.pdf\">full research paper</a> goes deeper into the technology's precise details.</p>\n<p>The roughly millimeter-sized balls that perform the most impressive stunts are composed of polystyrene, but the group also tested screws, matchsticks, and other objects — other researchers have successfully levitated <a target=\"_blank\" href=\"http://www.nature.com/news/2006/061127/full/news061127-6.html\">ants and even small fish</a>. While the sound must be extremely intense, its high frequency makes it inaudible to human ears, and levitation can open up new ways for us to manipulate objects. Earlier this year, another group of researchers made a similar breakthrough in moving floating particles, <a target=\"_blank\" href=\"http://www.webcitation.org/6I9uYzTzr\">mixing together solutions</a> in mid-air without fear of contamination from a container.</p>\n<hr>\n<p><iframe height=\"315\" width=\"560\" src=\"http://www.youtube.com/embed/odJxJRAxdFU\"></iframe></p>",
					author: "Adi Robertson",
					title: "Watch the intricate dance of objects levitated by sound",
					date: 1388690282000,
					link: "http://www.theverge.com/2014/1/2/5266670/watch-the-intricate-dance-of-objects-levitated-by-sound",
					source: "The Verge -\tAll Posts",
					unread: true,
					recommendations: 35,
					image: "http://cdn1.sbnation.com/entry_photo_images/9628187/Screen_Shot_2014-01-02_at_11.11.00_AM_large.png"
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_1435453eecb:c6f4:623b9014",
					content: "<img alt=\"\" src=\"http://cdn1.sbnation.com/entry_photo_images/9628153/_MG_7923_large.jpg\">\n<p>Mount Royal Avenue in Montreal has a new, comic book-inspired look — and all it took was some new lights. Created by Estelle Jugant and Yazid Belkhir from design firm Turn Me On, the &quot;<a target=\"_blank\" href=\"http://turnmeondesign.com/projets/idee-o-rama.html\">Idea-O-Rama</a>&quot; project has filled up the street with light fixtures reminiscent of cartoon speech bubbles. The new lamps were born from a city-wide competition, in which Turn Me On won, aimed at creating &quot;a unique winter atmosphere and conversation on the Avenue.&quot; Each light features original graphics from artists <a target=\"_blank\" href=\"http://misterastro.com/\">Astro</a> and <a target=\"_blank\" href=\"http://jaimelejaune.com/\">Jean-François Poliquin</a>. You can check out the installation from now until the end of February, but if you can't make it, don't worry — it's expected to pop up again over the following two winters.</p>\n<p><em>Image credit: <a target=\"new\" href=\"https://drive.google.com/a/theverge.com/folderview?id=0BwGYWIZt99SUSjVnbF8wUHVqclU&usp=drive_web#\">Bernard Fougères</a></em></p>\n<div>\n<br><img alt=\"3\" src=\"http://cdn3.sbnation.com/assets/3797451/_MG_7634.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn3.sbnation.com/assets/3797459/_MG_7652.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn1.sbnation.com/assets/3797467/_MG_7658.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn3.sbnation.com/assets/3797475/_MG_7669.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn0.sbnation.com/assets/3797483/_MG_7763.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn3.sbnation.com/assets/3797491/_MG_7917.jpg\">\n</div>\n<div>\n<br><img alt=\"3\" src=\"http://cdn0.sbnation.com/assets/3797499/_MG_7967.jpg\">\n</div>",
					excerpt: "Mount Royal Avenue in Montreal has a new, comic book-inspired look — and all it took was some new lights. Created by Estelle Jugant and Yazid Belkhir from design firm Turn Me On, the \"Idea-O-Rama\" project has filled up the street with light fixtures reminiscent of cartoon speech bubbles. The new lam",
					author: "Andrew Webster",
					title: "Street lamps transform Montreal into a living comic book",
					date: 1388688187000,
					link: "http://www.theverge.com/2014/1/2/5266704/street-lamps-transform-montreal-into-a-living-comic-book",
					source: "The Verge -\tAll Posts",
					image: "http://www.blogcdn.com/www.engadget.com/media/2013/10/irlbanner-1382819058.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143541cf505:c032:623b9014",
					content: "<img alt=\"\" src=\"http://cdn1.sbnation.com/entry_photo_images/9627981/netflix-recommendations_1020_large.jpg\">\n<p>Netflix's extraordinarily specific micro-categories have become both a running joke and a <a href=\"http://www.theverge.com/2012/4/8/2934375/netflix-recommendation-system-explained\">surprisingly effective recommendation tool</a>, but how does it serve up personalized recommendations for &quot;violent sci-fi thrillers&quot; and &quot;gory action and adventure,&quot; and why are &quot;violent&quot; and &quot;gory&quot; separate descriptors? And why, when you reverse-engineer Netflix categories as <a target=\"_blank\" href=\"http://www.theatlantic.com/technology/archive/2014/01/how-netflix-reverse-engineered-hollywood/282679/\">Ian Bogost and Alexis Madrigal did</a> for <i>The Atlantic</i>, are there 19 genres dedicated to the man who played Perry Mason? By scraping the tens of thousands of possible Netflix categories (most of which users will never see), Bogost and Madrigal put together a strangely effective map of how Hollywood makes movies and how we seek them. And behind it all is Todd Yellin, the Netflix VP who envisioned the tagging system in the first place: &quot;Predicting something is 3.2 stars is kind of fun if you have an engineering sensibility, but it would be more useful to talk about dysfunctional families and viral plagues.&quot;</p>",
					excerpt: "Netflix's extraordinarily specific micro-categories have become both a running joke and a surprisingly effective recommendation tool, but how does it serve up personalized recommendations for \"violent sci-fi thrillers\" and \"gory action and adventure,\" and why are \"violent\" and \"gory\" separate descri",
					author: "Adi Robertson",
					title: "A quantum theory of Netflix's genre tags",
					date: 1388684996000,
					link: "http://www.theverge.com/2014/1/2/5266526/a-quantum-theory-of-netflixs-genre-tags",
					source: "The Verge -\tAll Posts",
					image: "http://b.vimeocdn.com/ts/451/794/451794956_1280.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_143541cf505:c031:623b9014",
					content: "<img alt=\"\" src=\"http://cdn2.sbnation.com/entry_photo_images/9627943/Moto_G_review11_1020_large.jpg\">\n<p>Verizon Wireless prepaid customers will be able to order the Moto G starting January 9th for $99.99. Motorola's budget handset will be available first online and will appear at the carrier's retail stores &quot;in the coming weeks.&quot; A picture of the Moto G in Verizon's prepaid retail packaging emerged at the end of December, and <a href=\"http://www.theverge.com/2013/12/31/5260988/moto-g-for-verizon-coming-to-best-buy-off-contract-for-99-99\">Best Buy confirmed it would be selling the device</a> almost immediately. In fact, Best Buy stores are reportedly allowed to sell the Moto G as soon as shipments arrive, so it may be a better option if you're eager to get a hold of the low-cost smartphone. As we've said before, it may be cheap (and Verizon's price is the lowest yet), but the Moto G is plenty capable for those core mobile tasks. The lack of LTE may be harder to swallow on &quot;America's largest LTE network,&quot; but it's still a fantastic device for the price.</p>\n<p>Separately, <a target=\"_blank\" href=\"http://newsroom.boostmobile.com/press-release/products-offers/boost-mobile-reunites-motorola-launch-smart-and-stylish-moto-g-nextrad\">Boost Mobile has announced</a> that it too will be selling the Moto G, but you'll have to wait a bit longer and pay slightly more. It's set to be released on January 14th for $129.99. If you can't wait until then, apparently Boost Mobile's version of the Moto G will be appearing on the Home Shopping Network (and its website) today.</p>",
					excerpt: "Verizon Wireless prepaid customers will be able to order the Moto G starting January 9th for $99.99. Motorola's budget handset will be available first online and will appear at the carrier's retail stores \"in the coming weeks.\" A picture of the Moto G in Verizon's prepaid retail packaging emerged at",
					author: "Chris Welch",
					title: "Moto G coming to Verizon Wireless on January 9th for $99.99 off-contract",
					date: 1388684565000,
					link: "http://www.theverge.com/2014/1/2/5266532/moto-g-verizon-release-date-january-9",
					source: "The Verge -\tAll Posts",
					image: "http://b.vimeocdn.com/ts/451/794/451794956_1280.jpg",
					unread: true,
					recommendations: 35
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_1435401781b:bbf7:623b9014",
					excerpt: "Next week, LG will unveil new televisions running webOS, the ill-fated operating system it acquired in last February. Although LG is expected to retain some form of webOS’ interface, exactly what that will mean on a television instead of a phone or tablet is still a mystery. If LG has any luck at al",
					content: "<img alt=\"\" src=\"http://cdn3.sbnation.com/entry_photo_images/9627107/webos-lost-2-theverge-4_1020_large.jpg\">\n<p>Next week, <a href=\"http://www.theverge.com/2013/12/19/5226634/lg-webos-smart-tv-coming-at-ces-2014\">LG will unveil new televisions running webOS</a>, the ill-fated operating system <a href=\"http://www.theverge.com/2013/2/25/4027018/lg-buys-webos-smart-tv/in/2388197\">it acquired in last February</a>. Although LG is <a href=\"http://www.theverge.com/2013/12/30/5256186/lg-webos-smart-tv-cards-interface-rumor\">expected to retain some form of webOS’ interface</a>, exactly what that will mean on a television instead of a phone or tablet is still a mystery. If LG has any luck at all, it will be more successful than the last consumer webOS products. It's been over two years since HP’s TouchPad and the Pre 3 were released and then discontinued in a surprise decision from then-CEO Léo Apotheker. In fact, most people within HP were blindsided when executives decided to stop hardware production and left the software team twisting in the winds of uncertainty. Apotheker's decision ultimately led to the open sourcing of some parts of webOS and the sale of the rest to LG under current CEO Meg Whitman.</p>\n<p>But back in 2011, before and after Apotheker's fateful decision, Palm had been actively working on both new hardware and new software. <em>The Verge</em> has obtained documents describing Palm's plans and even a design prototype of a new smartphone. They tell a story of a company struggling to innovate in the face of daunting competition and perishingly few resources. They also show that, even at the end, Palm’s ambition outstretched its ability.</p>\n<p>This is the webOS that never was.</p>\n<div>\n<div>\n<img alt=\"Hp-web_640\" src=\"http://cdn3.sbnation.com/assets/820341/hp-web_640.jpg\"><h2>Embark</h2>\n<p>On February 9th, 2011, Palm's Jon Rubinstein took to the stage to unveil the first major products to come out of the division since the HP sale. The Pre 3 and Veer phones weren't much better than the Pre phones that came before them, but the TouchPad showed promise, at least on the software side. Unbeknownst to Rubinstein and his staff, the event — known internally as &quot;Embark&quot; — would be the high point of Palm's brief tenure at HP.</p>\n</div>\n</div>\n<div>\n<div>\n<p>But the good vibes from the event didn't last long. Apple announced the iPad 2 on March 2nd, less than one month later and well before Palm's TouchPad was released. Though webOS on the TouchPad had some clever features and an elegant software design, the TouchPad itself was a hulking, plastic monster. It was for all intents and purposes a glossy black look-alike of the original iPad.</p>\n<p>Apple's iPad 2 was as much of a revelation as the original iPad. It was radically thinner, lighter, and faster than what had come before and it immediately made the TouchPad — not to mention competing Android tablets — look stale by comparison. Apple released the iPad 2 to consumers just over a week after it was announced, while the TouchPad wasn't released until July.</p>\n</div>\n</div>\n<div>\n<div>\n<h2>Sapphire</h2>\n<div><img alt=\"Topaz-theverge-1_560\" src=\"http://cdn2.sbnation.com/assets/3796403/topaz-theverge-1_560.jpg\"></div>\n<p>If the documents we obtained detailing HP's product plans are any indication, the iPad 2 sent the company into a panic. In a document distributed in late March, HP admitted that the iPad 2 had &quot;changed the competitive trajectory&quot; and foresaw rapid responses from Samsung — which had shaved over 2mm from its Galaxy Tab tablet in response to the iPad 2. HP had also gotten pushback from the likes of AT&amp;T, which wasn't happy with the TouchPad's &quot;thickness, weight, [and industrial design].&quot;</p>\n<p>HP created a plan to refresh the TouchPad with the &quot;Sapphire&quot; (the TouchPad's codename was Topaz, and the Sapphire was also referred to as the &quot;Topaz2&quot;), with the unrealistic goal of developing it in &quot;record time&quot; and releasing it in late 2011. At the same time, it was working on another tablet that would feature a high resolution screen to be released in the latter half of 2012. The former would have brought the company to some kind of parity with Apple (albeit a year late), while the latter would have arrived a few months after Apple introduced a Retina display iPad. It also planned to work on a successor to the &quot;Opal,&quot; the 7-inch tablet that was nearly released as the TouchPad Go before it was canceled.</p>\n<p>HP's tablet plans looked reactionary in both specs and design. It was caught flat-footed by Apple and was rushing to make its traditional tablets competitive. It’s not clear how far along HP got with any of these plans, but it seems unlikely that any of them would have made their ship-date targets.</p>\n</div>\n</div>\n<div>\n<div><img alt=\"Webos-lost-2-theverge-1_1020\" src=\"http://cdn3.sbnation.com/assets/3796411/webos-lost-2-theverge-1_1020.jpg\"></div>\n</div>\n<div>\n<div>\n<h2>Mako</h2>\n<p>HP was also painfully aware that though the Palm faithful still liked hardware keyboards and the slide-out design of the Pre (and even the Veer), the rest of the world was moving to touchscreen-only phones. It had developed a version of the Pre 3 that had no physical keyboard, codenamed &quot;<a href=\"http://www.webosnation.com/windsornot-webos-slate-smartphone-never-was\">WindsorNot</a>.&quot; The WindsorNot was meant for AT&amp;T but didn’t have LTE, and it was delayed past the point when AT&amp;T would require all smartphones to have LTE.</p>\n<div><img alt=\"Webos-lost-2-theverge-2_1020\" src=\"http://cdn3.sbnation.com/assets/3796419/webos-lost-2-theverge-2_1020.jpg\"></div>\n<p>However, HP was also working on a significantly more advanced phone, codenamed &quot;Mako.&quot; <em>The Verge</em> obtained a design prototype of the device that reveals a new design direction eschewing the soft, nature-inspired pebble look of the Pre for something much more angular. It was to have a glass front and back, wireless charging, LTE, and a high-resolution screen. By today's standards, the Mako looks thick and this particular prototype isn't exactly beautiful — but it is at least unique and presumably the final hardware would have been fairly elegant, especially compared to other devices in late 2011 and early 2012.</p>\n<p>In terms of specs, we are told that it was to be about on par with the HTC One X, and had things gone according to plan it would have possibly been released in early 2012, beating the One X to market. Had Palm managed to pull it off, the Mako would have been one of the first Palm devices in a long time to feature competitive performance — albeit in a form that was still thicker than other devices at the time. However, development on the Mako never made it very far, and to our knowledge no working models ever got off the development board, much less into real-world testing.</p>\n</div>\n</div>\n<div>\n<div><img alt=\"Webos-lost-1-theverge-10_1020\" src=\"http://cdn1.sbnation.com/assets/3796435/webos-lost-1-theverge-10_1020.jpg\"></div>\n</div>\n<div>\n<div>\n<h2>Twain</h2>\n<p>But HP wasn't just working on &quot;traditional tablets&quot; like the Topaz2 and Opal and &quot;traditional&quot; phones like the Mako: it was also in the process of developing a hybrid device that would combine a tablet with a keyboard and a new sliding hinge. It would have been a precursor to the many hybrid Windows 8 devices on the market today. HP codenamed it &quot;Twain.&quot;</p>\n<p>Development on Twain was already underway by March, 2011, when Apple’s iPad 2 blindsided HP. The knock on iOS on the iPad was always that it wasn't great at being &quot;productive,&quot; and HP intended to take that perceived weakness head on. In an early presentation outlining Twain's features, HP asked &quot;Are traditional notebooks a thing of the past?&quot; and answered &quot;If they are, Twain is the notebook of the future.&quot;</p>\n<img alt=\"Webos-lost-1-theverge-8_1020\" src=\"http://cdn2.sbnation.com/assets/3796443/webos-lost-1-theverge-8_1020.jpg\"><p>Twain's core design involved a touchscreen that could slide out and then up to reveal a keyboard underneath. The proposed hardware specs were up to date, but most importantly it was to feature the stark new industrial design direction meant for all future Palm products.</p>\n<p>HP wanted to add a magnetic charger, NFC, HDMI-out, and a set of software features designed to make the Twain appeal to enterprise and productivity customers. HP also planned on extending the &quot;Touch to share&quot; feature it had introduced on the original TouchPad so that you could swipe data from the Twain to another webOS device using &quot;ultrasonic transmission to sense the location of fellow webOS devices.&quot;</p>\n</div>\n</div>\n<div>\n<div><img alt=\"Webos-lost-1-theverge-2_1020\" src=\"http://cdn1.sbnation.com/assets/3796467/webos-lost-1-theverge-2_1020.jpg\"></div>\n</div>\n<div>\n<div>\n<h2>Eel</h2>\n<p>While most of HP's tablet and phone plans (save the Twain) were reactionary and predictable, the software team was working on some truly innovative designs.</p>\n<div>\n<img alt=\"Webos-lost-1-theverge-4_1020\" src=\"http://cdn3.sbnation.com/assets/3796475/webos-lost-1-theverge-4_1020.jpg\"><br>\n</div>\n<p>For the Twain to have any success, HP would need to do more than just release the hardware with webOS as it was currently known. webOS has had a long and fractured history of rushing to get a less-than-ideal product out the door — putting off necessary and important projects like unifying the OS under a single backend framework. Unfortunately, that trend was still fully in play as Palm began work on the next version of webOS. But while the underpinnings were still in flux, the actual design and functionality of webOS was moving forward in a surprisingly good direction.</p>\n<p>Under the leadership of its then-director of human interface, Itai Vonshak, Palm was moving forward with a software strategy to complement the productivity targets it had set for Twain. That meant webOS would need to become more useful for traditional work tasks — without turning itself into something that looked and felt like Windows.</p>\n<div>\n<img alt=\"Webos-lost-1-theverge-3_1020\" src=\"http://cdn2.sbnation.com/assets/3796491/webos-lost-1-theverge-3_1020.jpg\"><br>\n</div>\n<p>The answer to both of those questions would be &quot;Eel,&quot; the codename for the next major version of webOS in 2011. At the heart of Eel was an attempt to expand on the &quot;card&quot; metaphor that Matias Duarte had first unveiled with the original Palm Pre in 2009.</p>\n<p>webOS had already introduced &quot;card stacks&quot; in an earlier version, letting you stack your active application cards into logical groupings. It had also introduced another concept that was finally beginning to gain widespread adoption: responsive panels. In essence, a &quot;panel&quot; presented different views depending on where you were in the app and how large a screen you had, but did so without requiring you to rewrite the app. Thus, in the email app, you could tap through your list of emails to a single email on a phone, or on a tablet see both side by side.</p>\n<div>\n<img alt=\"Webos-lost-1-theverge-5_1020\" src=\"http://cdn2.sbnation.com/assets/3796499/webos-lost-1-theverge-5_1020.jpg\"><br>\n</div>\n<p>Vonshak and his team were tasked with extending both of those two UX metaphors and making them more useful. To do it, the team essentially mixed them together. In Eel, you could tap on a link to open it up in a new panel, which would appear on the left. But instead of simply being a panel within an app, it would be a separate card, which you could slide left or right to have multiple cards visible. You could also &quot;shear&quot; off the card and put it into an entirely different stack. It wasn’t dissimilar from the way that Windows 8 allows you to &quot;snap&quot; windows, but on Eel it was to be more flexible in terms of window size and grouping. Panels and cards weren't quite the &quot;windows&quot; that we're used to on desktops, but it approached their utility while still being manageable on both phones and tablets.</p>\n</div>\n</div>\n<iframe name=\"38285-chorus-video-iframe\" src=\"http://www.theverge.com/videos/iframe?id=38285\"></iframe>\n<div>\n<div>\n<h2>Design</h2>\n<p>Though Eel added more power to the core interface of webOS (along with, it must be said, more complexity), it also did something more. Years before Apple went &quot;flat&quot; with its design for iOS 7 and even well before Android cleaned itself up, the Vonshak and visual design director Liron Damir were finalizing a new software design language it called &quot;Mochi.&quot;</p>\n<p>In fact, Palm had been working on two different design languages for Eel. One was significantly harsher and more industrial-looking, the better to match the hard lines of products like Twain and Mako. However, when Apotheker made the decision to scuttle webOS hardware, the team focused its efforts on the softer Mochi design — which was more in fitting with Palm's ethos.</p>\n<img alt=\"Webos-lost-1-theverge-11_1020\" src=\"http://cdn2.sbnation.com/assets/3796483/webos-lost-1-theverge-11_1020.jpg\"><p>As HP's management struggled to decide what to do with webOS, Palm's software team moved forward on redesigning the entire OS with a flatter, cleaner look. Soft white backgrounds were mixed with bold colors. At one point, the team had proposed creating subtle animations for the panels, having them &quot;breathe&quot; as though they were pieces of paper, so you could tell that they could be moved around more easily. In lieu of back buttons, panels had a small curved tab at the bottom that indicated they could be grabbed and resized.</p>\n<p>Mochi wasn't completely flat in the vein of Windows Phone, or even what we'd eventually see with iOS 7. There were still gradients and curves — but they were mixed with big typography and an elegant use of white space to help make data easier to parse. Fonts were improved and Eel made heavy use of circles — an homage to the Palm logo of old.</p>\n</div>\n</div>\n<div>\n<div><img alt=\"Twain-hardware-d2i_03162011-4\" src=\"http://cdn2.sbnation.com/assets/3794319/Twain-Hardware-D2I_03162011-4.jpg\"></div>\n</div>\n<div>\n<div>\n<p>Obviously, none of these webOS dreams came to pass — nor did other ideas like a stylus that could read color in the real world and then use it to draw on a tablet. Even if HP had not decided to give up on webOS hardware and all but abandon webOS software, the chances that any of these products would have seen the market and gained any sort of real success seems awfully small. Both Palm and HP had difficulties shipping on time and competing successfully even in the best of circumstances — and it was clear that HP didn't think it would be able to take on the challenges that would have lain ahead for webOS.</p>\n<p>The competitive landscape for tablets and phones wasn't quite as locked down in late 2011 and early 2012 as it is now — back then, it still seemed like there might be space for at least four major players in the market. However, since then we've seen BlackBerry implode almost as spectacularly as Palm, and a host of other companies have failed to make a dent. Microsoft may have established itself in third place behind iOS and Android — but with the benefit of hindsight it seems obvious now that there wouldn't have been much space for webOS to hang on.</p>\n<p>Though it's painful to Palm fans to have to admit it (especially when looking at the clean lines on Mochi), the marketplace probably would have doomed these webOS products if HP hadn't done it first. We'll never be able to say definitively that HP made the right call in killing off webOS and selling what was left for LG to put on televisions. But now, in 2014, <a href=\"http://www.theverge.com/2014/1/2/5265490/lgs-webos-tv-ui-photo-leak\">LG's forthcoming TV</a> will be yet another new beginning for webOS — a smaller ambition for a bigger screen.</p>\n<p><em>Photography by Michael Shane</em></p>\n</div>\n</div>\n<p> </p>",
					author: "Dieter Bohn",
					title: "The lost secrets of webOS",
					date: 1388683692000,
					link: "http://www.theverge.com/2014/1/2/5264580/the-lost-secrets-of-webos",
					source: "The Verge -\tAll Posts",
					unread: true,
					recommendations: 35,
					image: "http://cdn3.sbnation.com/entry_photo_images/9627107/webos-lost-2-theverge-4_1020_large.jpg"
				},
				{
					id: "PSNTZO8gXFUe+cpCZyApw0vEKWPT4b14D6teBEocIAE=_1435401781b:bbf6:623b9014",
					excerpt: "Reliving movies on Twitter has become a trend, and a cult classic just popped up online. Argentinean advertising creative Jorge Zacher used 15 Twitter accounts and 1,125 tweets to recreate the entire Reservoir Dogs script. He made each character a Twitter account where they all tweeted lines from th",
					content: "<img alt=\"\" src=\"http://cdn0.sbnation.com/entry_photo_images/9627253/Screen_Shot_2014-01-02_at_10.43.44_AM_large.png\">\n<p>Reliving movies on Twitter has become a <a target=\"_blank\" href=\"http://www.theverge.com/2013/12/3/5170068/mob-city-miniseries-script-twitter-adaptation\">trend</a>, and a cult classic just popped up online. Argentinean advertising creative Jorge Zacher used <a target=\"_blank\" href=\"http://cargocollective.com/zacher/Reservoir-Tweets\">15 Twitter accounts and 1,125 tweets</a> to recreate the entire <i>Reservoir Dogs</i> script. He made each character a Twitter account where they all tweeted lines from the movie, which were then retweeted by the <a target=\"_blank\" href=\"https://twitter.com/ReservoirDogs_\">@ReservoirDogs_</a> account in reverse order so it could be read on Twitter.</p>\n<blockquote lang=\"en\">\n<p>What was that? I'm sorry. I didn't catch it. Would you repeat it?</p>\n— Mr. White (@MrWhite_z) <a href=\"https://twitter.com/MrWhite_z/statuses/417710398763040768\">December 30, 2013</a>\n</blockquote>\n<p>\n</p>\n<blockquote lang=\"en\">\n<p>Are you going to bark all day, little doggie, or are you going to bite?</p>\n— Mr. Blonde (@MrBlonde_z) <a href=\"https://twitter.com/MrBlonde_z/statuses/417720208921358336\">December 30, 2013</a>\n</blockquote>\n<p>Some of the best tweets are the short and sweet exposition lines from the @ReservoirDogs_ that tie the entire story together, capturing both the violent essence of the movie's most memorable scenes as well as the small gestures that make the movie a strange and beloved classic. Other films like <a target=\"_blank\" href=\"https://twitter.com/_hillvalley/the-hill-valley-project\"><i>Back to the Future</i></a> have been revitalized in the same way, but there's something about reading a Tarantino film in tweets that's both unsettling and awesome.</p>\n<blockquote lang=\"en\">\n<p>Mr Orange is now rehearsing outside, by a grafitii-covered wall. He's much more smooth and confident now. Holdaway is watching and listening</p>\n— Reservoir Dogs (@ReservoirDogs_) <a href=\"https://twitter.com/ReservoirDogs_/statuses/417892081093201920\">December 31, 2013</a>\n</blockquote>\n<p>\n</p>",
					author: "Valentina Palladino",
					title: "The story of 'Reservoir Dogs' retold in over 1,000 tweets",
					date: 1388682591000,
					link: "http://www.theverge.com/2014/1/2/5266094/reservoir-dogs-script-in-tweets",
					source: "The Verge -\tAll Posts",
					unread: true,
					recommendations: 35,
					image: "http://cdn0.sbnation.com/entry_photo_images/9627253/Screen_Shot_2014-01-02_at_10.43.44_AM_large.png"
				}
			]
		},
		names: {
			"feed/http://www.theverge.com/rss/full.xml": "The Verge",
			"feed/http://feeds.gawker.com/lifehacker/vip": "Lifehacker",
			"feed/http://feeds.feedburner.com/Techcrunch": "TechCrunch",
			"feed/http://feeds.betakit.com/betakit": "Betakit",
			"feed/http://www.engadget.com/rss.xml": "Engadget",
			"feed/http://feeds.gawker.com/gizmodo/vip": "Gizmodo",
			"feed/http://feeds2.feedburner.com/Mashable": "Mashable!",
			"feed/http://readwrite.com/main/feed/articles.xml": "ReadWrite",
			"feed/http://feeds2.feedburner.com/thenextweb": "The Next Web",
			"feed/http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml": "The New York Times",
			"feed/http://feeds.reuters.com/reuters/topNews?irpc=69": "Reuters",
			"feed/http://rss.cnn.com/rss/cnn_topstories.rss": "CNN",
			"feed/http://www.lemonde.fr/rss/sequence/0,2-3208,1-0,0.xml": "Le Monde",
			"feed/http://www.lefigaro.fr/rss/figaro_une.xml": "Le Figaro",
			"feed/http://www.rue89.com/homepage/feed": "Rue89",
			"feed/http://newsfeed.zeit.de/index": "Zeit Online",
			"feed/http://www.elpais.com/rss/feed.html?feedId=1022": "EL PAIS",
			"feed/http://www.guardian.co.uk/rssfeed/0,,1,00.xml": "The Guardian",
			"feed/http://newsrss.bbc.co.uk/rss/newsonline_world_edition/front_page/rss.xml": "BBC",
			"feed/http://feeds.feedburner.com/venturebeat": "VentureBeat",
			"feed/http://sethgodin.typepad.com/seths_blog/atom.xml": "Seth Godin",
			"feed/http://feeds.feedburner.com/AVc": "A VC : Venture Capital and Technology",
			"feed/http://feeds.feedburner.com/ommalik": "GigaOM",
			"feed/http://pandodaily.com/feed/": "Pando Daily",
			"feed/http://allthingsd.com/feed": "All Things D",
			"feed/http://www.calculatedriskblog.com/feeds/posts/default": "Calculated Risk",
			"feed/http://feeds.harvardbusiness.org/harvardbusiness/": "Harvard Business Review",
			"feed/http://www.polygon.com/rss/full.xml": "Polygon",
			"feed/http://www.joystiq.com/rss.xml": "Joystiq",
			"feed/http://feeds.feedburner.com/Massively": "Massively",
			"feed/http://www.indiegames.com/blog/atom.xml": "Indie Games",
			"feed/http://feeds.arstechnica.com/arstechnica/gaming/": "Opposable Thumbs",
			"feed/http://feed.500px.com/500px-editors": "500px",
			"feed/http://thomashawk.com/feed": "Thomas Hawk Digital Connection",
			"feed/http://www.boston.com/bigpicture/index.xml": "The Big Picture",
			"feed/http://www.nationalgeographic.com/rss/photography/photo-of-the-day": "National Geographic",
			"feed/http://wvs.topleftpixel.com/index.rdf": "Daily Dose Of Imagery",
			"feed/http://theimpossiblecool.tumblr.com/rss": "The Impossible Cool",
			"feed/http://feeds.feedburner.com/design-milk": "Design Milk",
			"feed/http://feeds.feedburner.com/FreshInspirationForYourHome": "Fresh Home",
			"feed/http://www.swiss-miss.com/feed": "Swiss Miss",
			"feed/http://www.home-designing.com/feed": "Home Designing",
			"feed/http://www.yatzer.com/feed/index.php": "Yatzer",
			"feed/http://feeds.feedburner.com/core77/blog": "Core77",
			"feed/http://www.yankodesign.com/feed/": "Yanko Design",
			"feed/http://feeds.feedburner.com/abduzeedo?format=xml": "Abduzeedo",
			"feed/http://blog.2modern.com/atom.xml": "2Modern",
			"feed/http://www.sfgirlbybay.com/feed/": "SF Girl By The Bay",
			"feed/http://feeds.feedburner.com/dezeen": "Dezeen",
			"feed/http://www.fastcodesign.com/rss.xml": "Co.Design",
			"feed/http://www.fubiz.net/en/feed/": "Fubiz",
			"feed/http://mocoloco.com/index.rdf": "Mocoloco",
			"feed/http://www.unplggd.com/unplggd/atom.xml": "Unplggd",
			"feed/http://www.apartmenttherapy.com/main/atom.xml": "Apartment Therapy",
			"feed/http://www.designspongeonline.com/feed": "Design*Sponge",
			"feed/http://ikeahacker.blogspot.com/feeds/posts/default": "IKEA Hackers",
			"feed/http://decor8blog.com/feed/": "Decor8",
			"feed/http://archinect.com/news.xml": "Archinect",
			"feed/http://www.archdaily.com/feed/": "Arch Daily",
			"feed/http://feeds.feedburner.com/contemporist": "Contemporist",
			"feed/http://www.trendir.com/house-design/atom.xml": "Modern House Designs",
			"feed/http://adsoftheworld.com/node/feed": "Ads Of The World",
			"feed/http://www.underconsideration.com/brandnew/atom.xml": "Brand New",
			"feed/http://feeds.feedburner.com/logodesignlove": "Logo Design World",
			"feed/http://www.corporate-identity-design.com/feed/": "Corporate Identity Design",
			"feed/http://feeds.frogdesign.com/frog-design-mind": "Design Mind",
			"feed/http://feeds.feedburner.com/whitneyhess": "Pleasure and Pain",
			"feed/http://feeds.feedburner.com/NirAndFar": "Nir and Far",
			"feed/http://metacool.typepad.com/metacool/atom.xml": "Metacool",
			"feed/http://www.jnd.org/index.xml": "JND",
			"feed/http://page2rss.com/rss/9fc3ae12a1465446684506f7461b9129": "Graphic Exchange",
			"feed/http://www.designworklife.com/feed/": "Design Work Life",
			"feed/http://feeds.feedburner.com/ucllc/fpo": "Under Consideration - For Print Only",
			"feed/http://www.aisleone.net/feed/": "Aisle One",
			"feed/http://grainedit.com/feed/": "Grain Edit",
			"feed/http://gridness.net/feed/": "Gridness",
			"feed/http://feeds.feedburner.com/TheDieline": "The Dieline",
			"feed/http://www.packagingoftheworld.com/feeds/posts/default": "Packaging Of The World",
			"feed/http://lovelypackage.com/feed/": "Lovely Package",
			"feed/http://ambalaj.se/feed/": "Ambalaj",
			"feed/http://thepackagingdesignblog.com/?feed=rss2": "The Packaging Design Blog",
			"feed/http://tdc.org/feed/": "tdc",
			"feed/http://feedproxy.google.com/ILoveTypography": "I Love Typography",
			"feed/http://www.typetoken.net/feed/": "Typetoken",
			"feed/http://feeds.feedburner.com/FontsInUse": "Fonts In Use",
			"feed/http://feeds.feedburner.com/TypographyDaily": "Typography Daily",
			"feed/http://ministryoftype.co.uk/words/rss/": "Ministry Of Type",
			"feed/http://feeds2.feedburner.com/veerlesblog": "Veerle's Blog",
			"feed/http://feeds.feedburner.com/adaptivepath": "Adaptive Path",
			"feed/http://feeds.feedburner.com/CssTricks": "CSS-Tricks",
			"feed/http://feeds.feedburner.com/cooper-journal": "Cooper",
			"http://feeds.feedburner.com/creativeapplicationsnet": "Creative Applications",
			"feed/http://feeds.feedburner.com/UXM": "UX Magazine",
			"feed/http://rss1.smashingmagazine.com/feed/": "Smashing Magazine",
			"feed/http://feeds.feedburner.com/FunctioningForm": "Luke W",
			"feed/http://feeds.feedburner.com/37signals/beMH": "Signal vs. Noise",
			"feed/http://www.chipple.net/rss/custom/alertbox/index.rdf": "Use It",
			"feed/http://feeds.feedburner.com/subtraction": "Subtraction",
			"feed/http://feeds.feedburner.com/52WeeksOfUx": "52 Weeks Of UX",
			"feed/http://feeds.feedburner.com/DesignStaff?format=xml": "Design Staff",
			"feed/http://feeds.feedburner.com/minimalsites": "Minimal Sites",
			"feed/http://feeds.feedburner.com/FlowingData": "Flowing Data",
			"feed/http://feeds.feedburner.com/Datavisualization": "Data Visualization",
			"feed/http://infosthetics.com/atom.xml": "Information Aesthetics",
			"feed/http://feeds.feedburner.com/thesartorialist": "The Sartorialist",
			"feed/http://seaofshoes.typepad.com/sea_of_shoes/atom.xml": "Sea of shoes",
			"feed/http://www.fashiontoast.com/feeds/posts/default": "fashiontoast",
			"feed/http://www.stylebubble.co.uk/style_bubble/atom.xml": "Style Bubble",
			"feed/http://www.theblondesalad.com/feeds/posts/default": "The Blonde Salad",
			"feed/http://www.cocosteaparty.com/feeds/posts/default": "Coco's Tea Party",
			"feed/http://feeds.feedburner.com/smittenkitchen": "smitten kitchen",
			"feed/http://cannelle-vanille.blogspot.com/feeds/posts/default": "Cannelle et Vanille",
			"feed/http://www.latartinegourmande.com/feed/": "La Tartine Gourmande",
			"feed/http://www.davidlebovitz.com/archives/index.rdf": "David Lebovitz",
			"feed/http://www.herbivoracious.com/atom.xml": "Herbivoracious",
			"feed/http://www.101cookbooks.com/index.rdf": "101 Cookbooks",
			"feed/http://feedproxy.google.com/elise/simplyrecipes": "Simply Recipes",
			"feed/http://daringfireball.net/index.xml": "Daring Fireball",
			"feed/http://www.macrumors.com/macrumors.xml": "MacRumors",
			"feed/http://www.tuaw.com/rss.xml": "The Unofficial Apple Weblog",
			"feed/http://feeds.arstechnica.com/arstechnica/apple/": "Infinite Loop",
			"feed/http://feeds.feedburner.com/cultofmac/bFow": "Cult of Mac",
			"feed/http://feeds.feedburner.com/theappleblog": "TheAppleBlog",
			"feed/http://www.mactrast.com/feed/": "MacTrast",
			"feed/http://androidandme.com/feed/": "Android and Me",
			"feed/http://androidcommunity.com/feed/": "Android Community",
			"feed/http://feeds.feedburner.com/blogspot/hsDu": "Android Developers Blog",
			"feed/http://www.androidcentral.com/feed": "Android Central",
			"feed/http://blog.makezine.com/index.xml": "Make",
			"feed/http://www.instructables.com/tag/type:instructable/rss.xml": "Instructables",
			"feed/http://blog.craftzine.com/index.xml": "Craft",
			"feed/http://www.hackaday.com/rss.xml": "Hack A Day",
			"feed/http://www.yougrowgirl.com/feed/": "You Grow Girl",
			"feed/http://www.gardenrant.com/my_weblog/atom.xml": "Garden Rant",
			"feed/http://awaytogarden.com/feed": "A Way To Garden",
			"feed/http://feeds.feedburner.com/LifeOnTheBalcony": "Life On The Balcony",
			"feed/http://feeds.feedburner.com/bridalmusings": "Bridal Musings",
			"feed/http://www.stylemepretty.com/feed/": "Style Me Pretty",
			"feed/http://ruffledblog.com/feed/": "Ruffled",
			"feed/http://bridalsnob.tumblr.com/rss": "Bridal Snob",
			"feed/http://thecinderellaproject.blogspot.com/feeds/posts/default": "The Cinderella Project",
			"feed/http://masterpieceweddings.blogspot.com/feeds/posts/default": "Adventures In Wedding Planning",
			"feed/http://bridechic.blogspot.com/feeds/posts/default": "Bride Chic",
			"feed/http://blogs.suntimes.com/ebert/atom.xml": "Roger Ebert's Journal",
			"feed/http://www.davidbordwell.net/blog/?feed=atom": "Observations On Film Art",
			"feed/http://feeds.feedburner.com/firstshowing": "First Showing",
			"feed/http://mubi.com/notebook/posts.atom": "The Daily Notebook",
			"feed/http://gdata.youtube.com/feeds/base/users/WSJDigitalNetwork/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "WSJ Digital Network",
			"feed/http://gdata.youtube.com/feeds/base/users/NationalGeographic/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "National Geographic",
			"feed/http://gdata.youtube.com/feeds/base/users/TEDtalksDirector/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Ted Talks",
			"feed/http://gdata.youtube.com/feeds/base/users/trailers/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Viso Trailers",
			"feed/http://gdata.youtube.com/feeds/base/users/TEDEducation/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "TED Education",
			"feed/http://gdata.youtube.com/feeds/base/users/TheEllenShow/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "The Ellen Show",
			"feed/http://gdata.youtube.com/feeds/base/users/JimmyKimmelLive/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Jimmy Kimmel Live",
			"feed/http://gdata.youtube.com/feeds/base/users/vsauce/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Vsauce",
			"feed/http://gdata.youtube.com/feeds/base/users/kevjumba/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "Kevin Jumba",
			"feed/feed/http://gdata.youtube.com/feeds/base/users/GOODMagazine/uploads?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile": "GOOD Magazine",
			"feed/http://vimeo.com/channels/staffpicks/videos/rss": "Vimeo Staff Pick",
			"feed/http://vimeo.com/channels/fubiz/videos/rss": "Fubiz",
			"feed/http://vimeo.com/channels/everythinganimated/videos/rss": "Everything Animated",
			"feed/http://vimeo.com/channels/nicetype/videos/rss": "Nice Type",
			"feed/http://vimeo.com/channels/documentaryfilm/videos/rss": "Documentary Film",
			"feed/http://vimeo.com/channels/40086/videos/rss": "Socially Minded Documentaries",
			"feed/http://vimeo.com/channels/hd/videos/rss": "The Vimeo HD Channel",
			"feed/http://www.etsy.com/shop/PerDozenDesign/rss": "Per Dozen Design",
			"feed/http://www.etsy.com/shop/TFrancisco/rss": "TFrancisco",
			"feed/http://www.etsy.com/shop/claireswilson/rss": "Claire S. Wilson",
			"feed/http://www.etsy.com/shop/skinblaster/rss": "Skinblaster",
			"feed/http://www.etsy.com/shop/SharonFosterArt/rss": "Sharon Foster Art",
			"feed/http://www.etsy.com/shop/tukeon/rss": "Tukeon",
			"feed/http://www.etsy.com/shop/dawndishawceramics/rss": "Dawn Dishaw Ceramics",
			"feed/http://www.etsy.com/shop/sarapaloma/rss": "Sara Paloma Pottery"
		},
		oAuth: false,
		setOAuth: function() {
			this.oAuth = new OAuth2("feedly", {
				client_id: "ichrome",
				client_secret: "",
				api_scope: "https://cloud.feedly.com/subscriptions"
			}, function(tab) {
				chrome.webRequest.onBeforeRequest.addListener(
					function extract(info) {
						if (!new RegExp("state=").test(info.url)) {
							return;
						}

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
						urls: [ "http://localhost/*" ]
					},
					["blocking", "requestBody"]
				);
			});
		},
		authorize: function(config) {
			if (!this.oAuth) this.setOAuth();

			this.oAuth.authorize(function() {
				$.ajax(config);
			});
		},
		getSources: function(cb) {
			if (!this.oAuth) this.setOAuth();

			var oAuth = this.oAuth;

			oAuth.authorize(function() {
				var categories = {};
					
				categories["user/" + oAuth.get().userId + "/category/global.all"] = "All",
				categories["user/" + oAuth.get().userId + "/tag/global.saved"] = "Saved for later",
				categories["user/" + oAuth.get().userId + "/category/global.uncategorized"] = "Uncategorized";

				$.ajax({
					type: "GET",
					url: "http://cloud.feedly.com/v3/subscriptions",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + oAuth.getAccessToken());
					},
					success: function(d) {
						var feeds = {
							label: "Feeds"
						};

						d.forEach(function(e, i) {
							e.categories.forEach(function(c, i) {
								categories[c.id] = c.label;
							});

							feeds[e.id] = e.title;
						});

						categories.feeds = feeds;

						cb(categories);
					}
				});
			});
		},
		getArticles: function(d) {
			if (!this.oAuth) this.setOAuth();

			var names = this.names,
				articles = [],
				oAuth = this.oAuth,
				getImage = function(article) {
					if (article.visual && article.visual.url && article.visual.url !== "none" && article.visual.url !== "") {
						if (article.visual.url.indexOf("files.wordpress.com") !== -1) {
							article.visual.url = article.visual.url.substr(0, article.visual.url.lastIndexOf("?")) + "?w=370&h=250&crop=1";
						}
						else if (article.visual.url.indexOf("blogcdn.com") !== -1) {
							article.visual.url = article.visual.url.replace("_thumbnail", "");
						}
						else if (article.visual.url.indexOf("img.gawkerassets.com") !== -1) {
							article.visual.url = article.visual.url.replace("ku-xlarge", "ku-medium");
						}

						return article.visual.url;
					}

					var image = false,
						srcs = [],
						html = $(("<div>" + (article.content || "") + "</div>")
									.replace(/ src="\/\//g, " data-src=\"https://")
									.replace(/ src="/g, " data-src=\"")
									.replace(/ src='\/\//g, " data-src='https://")
									.replace(/ src='/g, " data-src='"));

					Array.prototype.slice.apply(html[0].querySelectorAll(
						"img[data-src]" +
						':not(.mf-viral)' +								':not(.feedflare)' +
						':not([width="1"])' + 						':not([height="1"])' +
						':not([data-src*="feeds.wordpress.com"])' +		':not([data-src*="stats.wordpress.com"])' +
						':not([data-src*="feedads"])' +					':not([data-src*="tweet-this"])' +
						':not([data-src*="-ads"])' +					':not([data-src*="_ads"])' +
						':not([data-src*="zemanta"])' +					':not([data-src*="u.npr.org/iserver"])' +
						':not([data-src*="slashdot-it"])' +				':not([data-src*="smilies"])' +
						':not([data-src*="commindo-media.de"])' +		':not([data-src*="creatives.commindo-media"])' +
						':not([data-src*="i.techcrunch"])' +			':not([data-src*="adview"])' +
						':not([data-src*=".ads."])' +					':not([data-src*="/avw.php"])' +
						':not([data-src*="feed-injector"])' +			':not([data-src*="/plugins/"])' +
						':not([data-src*="_icon_"])' +					':not([data-src*="/ad-"])' +
						':not([data-src*="buysellads"])' +				':not([data-src*="holstee"])' +
						':not([data-src*="/ad_"])' +					':not([data-src*="/button/"])' +	
						':not([data-src*="/sponsors/"])' +				':not([data-src*="googlesyndication.com"])' +
						':not([data-src*="/adx"])' +					':not([data-src*="assets/feed-fb"])' +
						':not([data-src*="feedburner.com/~ff"])' +		':not([data-src*="gstatic.com"])' +
						':not([data-src*="feedproxy"])' +				':not([data-src*="feedburner"])' +
						':not([data-src*="/~"])' +						':not([data-src*="googleadservices.com"])' +
						':not([data-src*="fmpub"])' +					':not([data-src*="pheedo"])' +
						':not([data-src*="openx.org"])' +				':not([data-src*="/ico-"])' +
						':not([data-src*="doubleclick.net"])' +			':not([data-src*="/feed.gif"])' +
						':not([data-src*="wp-digg-this"])' +			':not([data-src*="tweetmeme.com"])' +
						':not([data-src*="share-buttons"])' +			':not([data-src*="musictapp"])' +
						':not([data-src*="donate.png"])' +				':not([data-src*="/pagead"])' +
						':not([data-src*="assets/feed-tw"])' +			':not([data-src*="feedsportal.com/social"])'
					)).forEach(function(e, i) {
						srcs.push(e.getAttribute("data-src"));
					});

					if (srcs.length) {
						image = srcs[0];
					}
					else if (html.find("iframe[data-chomp-id]").length) {
						image = "http://img.youtube.com/vi/" + html.find("iframe[data-chomp-id]").attr("data-chomp-id") + "/1.jpg";
					}

					if (image && image.indexOf("files.wordpress.com") !== -1) {
						image = image.substr(0, image.lastIndexOf("?")) + "?w=370&h=250&crop=1";
					}
					else if (image && image.indexOf("blogcdn.com") !== -1) {
						image = image.replace("_thumbnail", "");
					}
					else if (image && image.indexOf("http://img.gawkerassets.com/") !== -1) {
						image = image.replace("ku-xlarge", "ku-medium");
					}

					return image;
				},
				div = document.createElement("div");

			if (!(typeof d.items == "object" && typeof d.items.forEach !== "undefined")) {
				return articles;
			}

			d.items.forEach(function(e, i) {
				var article = {
					id: e.id,
					title: e.title,
					author: e.author,
					unread: !!e.unread,
					date: e.published || 0,
					recommendations: parseInt(e.engagement || 0).abbr(1000, 2)
				};

				if (e.content) {
					article.content = e.content.content || "";

					div.innerHTML = article.content;

					article.excerpt = div.innerText.trim().slice(0, 300).replace(/\n/g, "  ");
				}
				else if (e.summary) {
					article.content = e.summary.content || "";

					div.innerHTML = article.content;

					article.excerpt = div.innerText.trim().slice(0, 300).replace(/\n/g, "  ");
				}

				if (e.tags && e.tags[0]) {
					e.tags.forEach(function(t, i) {
						if (t.id == "user/" + oAuth.get().userId + "/tag/global.saved") {
							article.saved = true;
						}
					});
				}

				if (e.alternate && e.alternate[0]) {
					article.link = e.alternate[0].href || "";
				}

				if (e.origin) {
					article.source = names[e.origin.streamId || ""] || e.origin.title || e.title;
				}

				article.image = getImage(article);

				articles.push(article);
			});			

			return articles;
		},
		refresh: function() {
			if (this.config.source == "feed/http://feeds.gawker.com/lifehacker/vip/") var auth = $.ajax;
			else var auth = this.authorize;

			auth.call(this, {
				type: "GET",
				url: "http://cloud.feedly.com/v3/streams/contents?count=10&streamId=" + encodeURIComponent(this.config.source) + (this.config.show == "unread" ? "&unreadOnly=true" : "") + "&ranked=" + this.config.sort,
				beforeSend: function(xhr) {
					xhr.setRequestHeader("Authorization", "OAuth " + this.oAuth.getAccessToken());
				}.bind(this),
				success: function(d) {
					if (!d) {
						return;
					}

					var data = {
						articles: this.getArticles(d),
						next: d.continuation || false
					};

					this.data = data;

					this.render.call(this);

					this.utils.saveData(this.data);
				}.bind(this)
			});
		},
		setHandlers: function() {
			if (!this.oAuth) this.setOAuth();

			var loading = false,
				that = this,
				last = 0,
				sent = {},
				sendout = "",
				outset = false,
				submitting = false,
				next = this.data.next,
				submit = function() {
					var parent = $(this),
						ptop = parent.offset().top,
						pheight = this.offsetHeight,
						ids = [],
						id, elm;

					parent.find(".item").each(function() {
						if (((elm = $(this)).offset().top - ptop) + this.offsetHeight - pheight <= 0 && !sent.hasOwnProperty(id = elm.attr("data-id"))) {
							ids.push(id);

							sent[id] = true;
						}
					});

					submitting = true;

					that.authorize({
						type: "POST",
						data: JSON.stringify({
							action: "markAsRead",
							type: "entries",
							entryIds: ids
						}),
						contentType: "application/json",
						url: "http://cloud.feedly.com/v3/markers",
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "OAuth " + that.oAuth.getAccessToken());
						},
						success: function(d) {
							submitting = false;
						}
					});

					last = new Date().getTime();
				};

			this.elm.find(".items").on("click", ".item", function(e) {
				if (!sent.hasOwnProperty(id = $(this).attr("data-id"))) {
					sent[id] = true;

					that.authorize({
						type: "POST",
						data: JSON.stringify({
							action: "markAsRead",
							type: "entries",
							entryIds: [id]
						}),
						contentType: "application/json",
						url: "http://cloud.feedly.com/v3/markers",
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "OAuth " + that.oAuth.getAccessToken());
						}
					});
				}
			}).on("click", ".item .recommendations", function(e) {
				e.preventDefault();
				e.stopPropagation();

				var elm = $(this);

				if (elm.hasClass("saved")) {
					that.authorize({
						type: "DELETE",
						url: "http://cloud.feedly.com/v3/tags/" + encodeURIComponent("user/" + that.oAuth.get().userId + "/tag/global.saved") + "/" + encodeURIComponent(elm.parents(".item").first().attr("data-id")),
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "OAuth " + that.oAuth.getAccessToken());
						},
						complete: function(d) {
							elm.removeClass("saved").text(parseInt(elm.text()) - 1);
						}
					});
				}
				else {
					that.authorize({
						type: "PUT",
						data: JSON.stringify({
							entryId: elm.parents(".item").first().attr("data-id")
						}),
						url: "http://cloud.feedly.com/v3/tags/" + encodeURIComponent("user/" + that.oAuth.get().userId + "/tag/global.saved"),
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "OAuth " + that.oAuth.getAccessToken());
						},
						complete: function(d) {
							elm.addClass("saved").text(parseInt(elm.text()) + 1);
						}
					});
				}
			}).on("scroll", function(e) {
				if (!loading && next && (this.scrollHeight - this.offsetHeight) < (this.scrollTop + this.offsetHeight)) {
					loading = true;

					that.authorize({
						type: "GET",
						url: "http://cloud.feedly.com/v3/streams/contents?count=20&streamId=" + encodeURIComponent(that.config.source) + "&continuation=" + encodeURIComponent(next) + (that.config.show == "unread" ? "&unreadOnly=true" : "") + "&ranked=" + that.config.sort,
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "OAuth " + that.oAuth.getAccessToken());
						},
						success: function(d) {
							if (!(d)) {
								return;
							}

							next = d.continuation || false;

							var articles = that.getArticles(d);

							if (that.config.view == "cards dual") {
								var column1 = [],
									column2 = [],
									columns = $(this).find(".column");

								articles.forEach(function(e, i) {
									e.age = moment(e.date).fromNow(true).replace("hour", "hr").replace("minute", "min").replace("an ", "1 ").replace("a ", "1 ").replace("a few ", "");

									if (i % 2 == 0) {
										column2.push(e);
									}
									else {
										column1.push(e);
									}
								});

								columns.first().append(iChrome.render("widgets.feedly.articles", {
									articles: column1
								}));

								columns.last().append(iChrome.render("widgets.feedly.articles", {
									articles: column2
								}));
							}
							else {
								articles.forEach(function(e, i) {
									e.age = moment(e.date).fromNow(true).replace("hour", "hr").replace("minute", "min").replace("an ", "1 ").replace("a ", "1 ").replace("a few ", "");
								});

								$(this).append(iChrome.render("widgets.feedly.articles", {
									articles: articles
								}));
							}

							loading = false;

							delete articles;
							delete d;
						}.bind(this)
					});
				}

				if (that.config.mark == "scroll" && !submitting && new Date().getTime() - last > 5000) {
					clearTimeout(sendout);

					outset = false;

					submit.call(this);
				}
				else if (that.config.mark == "scroll" && !submitting && !outset) {
					setTimeout(function() {
						outset = false;

						submit.call(this);
					}.bind(this), 5000);

					outset = true;
				}
			});
		},
		render: function(demo) {
			var data = $.extend(true, {}, this.data || {articles:[]});

			if (this.config.view == "cards dual") {
				var articles = [],
					column2 = [];

				data.articles.forEach(function(e, i) {
					e.age = moment(e.date).fromNow(true).replace("hour", "hr").replace("minute", "min").replace("an ", "1 ").replace("a ", "1 ").replace("a few ", "");

					if (i % 2 == 0) {
						column2.push(e);
					}
					else {
						articles.push(e);
					}
				});

				data.articles = iChrome.render("widgets.feedly.articles", {
					articles: articles
				});

				data.column2 = iChrome.render("widgets.feedly.articles", {
					articles: column2
				});
			}
			else {
				data.articles.forEach(function(e, i) {
					e.age = moment(e.date).fromNow(true).replace("hour", "hr").replace("minute", "min").replace("an ", "1 ").replace("a ", "1 ").replace("a few ", "");
				});

				data.articles = iChrome.render("widgets.feedly.articles", {
					articles: data.articles
				});
			}

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			data.link = this.config.link == "show";

			data.class = this.config.view;

			this.utils.render(data);

			if (!demo) this.setHandlers();
		}
	},
	20: {
		id: 20,
		size: 1,
		order: 14.5,
		name: "Translate",
		nicename: "translate",
		sizes: ["small"],
		config: {
			size: "small"
		},
		data: {
			from: "auto",
			to: "en"
		},
		desc: "Contains a small inline Google Translate textbox.",
		render: function() {
			this.utils.render();

			var from = this.elm.find("select.from"),
				to = this.elm.find("select.to"),
				swap = this.elm.find(".switch"),
				btn = this.elm.find(".btn.translate"),
				auto = from.find('option[value="auto"]'),
				textarea = this.elm.find("textarea"),
				autochanged = false;

			var accepted = ["af", "sq", "ar", "hy", "az", "eu", "be", "bn", "bs", "bg", "ca", "ceb", "zh-CN", "hr", "cs", "da", "nl", "en", "eo", "et", "tl", "fi", "fr", "gl", "ka", "de", "el", "gu", "ht", "ha", "iw", "hi", "hmn", "hu", "is", "ig", "id", "ga", "it", "ja", "jw", "kn", "km", "ko", "lo", "la", "lv", "lt", "mk", "ms", "mt", "mi", "mr", "mn", "ne", "no", "fa", "pl", "pt", "pa", "ro", "ru", "sr", "sk", "sl", "so", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "ur", "vi", "cy", "yi", "yo", "zu"],
				submit = function(e) {
					untranslate = textarea.val();

					btn.text("Untranslate");

					this.data.from = from.val();
					this.data.to = to.val();

					$.ajax({
						type: "GET",
						url: "http://translate.google.com/translate_a/t?client=ichrome&sl=" + encodeURIComponent(this.data.from) + "&tl=" + encodeURIComponent(this.data.to) + "&q=" + encodeURIComponent(textarea.val()) + "",
						complete: function(d) {
							d = d.responseText;

							if (typeof d == "string" && d.indexOf("{") == 0 && (d = JSON.parse(d)) && d.sentences && d.sentences.length) {
								if (d.src && accepted.indexOf(d.src) !== -1) {
									var text = "";

									d.sentences.forEach(function(e, i) {
										if (i !== 0) {
											text += "\r\n";
										}

										text += e.trans;
									});

									if (text == "") {
										text = "Something went wrong while trying to translate that...";
									}

									textarea.val(text);

									if (from.val() == "auto") {
										auto.text("Auto (" + from.find('option[value="' + d.src + '"]').text() + ")");

										autochanged = true;
									}
								}
								else {
									auto.text("Unknown");

									autochanged = true;
								}
							}
							else {
								textarea.val("Something went wrong while trying to translate that...");
							}
						}
					});

					this.utils.saveData(this.data);
				}.bind(this),
				autochange = function(e) {
					untranslate = false;

					btn.text("Translate");

					if (autochanged) {
						auto.text("Auto");

						autochanged = false;
					}
				},
				untranslate = false;

			btn.on("click", function(e) {
				e.preventDefault();

				if (untranslate && untranslate !== "") {
					textarea.val(untranslate);

					untranslate = false;

					btn.text("Translate");
				}
				else {
					submit(e);
				}
			});

			from.val(this.data.from);
			to.val(this.data.to);

			from.add(to).on("keydown", function(e) {
				if (e.which == 13 && (!untranslate || untranslate == "")) {
					e.preventDefault();

					submit(e);
				}
			});

			from.on("change", autochange);

			to.on("change", function() {
				untranslate = false;

				btn.text("Translate");
			});

			swap.click(function(e) {
				e.preventDefault();

				var f = from.val(),
					t = to.val();

				if (f == "auto") {
					f = "en";
				}

				from.val(t);
				to.val(f);
			});

			textarea.on("input", autochange);
		}
	},
	21: {
		id: 21,
		size: 1,
		order: 15.25,
		name: "Currency",
		nicename: "currency",
		sizes: ["small"],
		config: {
			size: "small"
		},
		data: {
			from: "USD",
			to: "USD"
		},
		desc: "Let's you convert between any two of 169 currencies.",
		render: function() {
			this.utils.render();

			var from = this.elm.find("select.from"),
				to = this.elm.find("select.to"),
				selects = this.elm.find("select"),
				fval = this.elm.find("input.fromval"),
				tval = this.elm.find("input.toval"),
				inputs = this.elm.find("input"),
				caching = false,
				cache = {},
				ctrlDown = false;

			var load = function(from, to, cb) {
					caching = true;

					$.get("http://rate-exchange.appspot.com/currency?from=" + from + "&to=" + to + "&q=1", function(d) {
						if (d && d.from == from && d.to == to && d.rate) {
							cache[from + "-" + to] = d.rate;
						}

						caching = false;

						cb();
					});
				},
				convert = function(reverse) {
					this.data.from = from.val();
					this.data.to = to.val();

					var rev = false,
						conv = 0;

					if (reverse) {
						var fr = to.val(),
							tov = from.val(),
							f = tval.val(),
							t = fval;
					}
					else {
						var fr = from.val(),
							tov = to.val(),
							f = fval.val(),
							t = tval;
					}


					if (fr == tov) {
						return t.val(f);
					}


					if (cache[fr + "-" + tov]) {
						conv = f * cache[fr + "-" + tov];
					}
					else if (cache[tov + "-" + fr]) {
						conv = f / cache[tov + "-" + fr];
					}
					else {
						return load(fr, tov, function() {
							convert(reverse);
						});
					}

					t.val(conv);

					this.utils.saveData(this.data);
				}.bind(this);
				

			from.val(this.data.from);
			to.val(this.data.to);

			load(this.data.from, this.data.to, convert);


			inputs.on("keydown", function(e) {
				if (e.which == 17) {
					ctrlDown = true;
				}

				if (e.which == 13) {
					e.preventDefault();

					convert();
				}
				else if (!(ctrlDown ||
						((e.which > 47 && e.which < 58) ||
						(e.which > 36 && e.which < 41) ||
						(e.which > 95 && e.which < 106) ||
						e.which == 8 ||
						e.which == 9 ||
						e.which == 46 ||
						e.which == 17 ||
						e.which == 65 ||
						e.which == 190))) e.preventDefault();
			}).on("keyup", function(e) {
				if (e.which == 17) {
					ctrlDown = false;
				}
			});

			fval.on("input", function(e) {
				convert();
			});

			tval.on("input", function(e) {
				convert(true);
			});

			selects.on("change", function(e) {
				if (cache[from.val() + "-" + to.val()]) {
					convert();
				}
				else {
					load(from.val(), to.val(), convert);
				}
			});
		}
	},
	22: {
		id: 22,
		size: 2,
		order: 6,
		name: "Voice",
		interval: 120000,
		nicename: "voice",
		sizes: ["tiny", "small"],
		desc: "Displays the current number of missed calls and texts in your Google Voice account.",
		settings: [
			{
				type: "text",
				nicename: "user",
				label: "Account ID",
				help: "If you're signed into multiple accounts, this is the number right after \"/b/\" in the URL when on Google Voice.<br /><br />For example, if you're signed into two accounts, jsmith1@gmail.com and jsmith2@gmail.com, the \"/b/\" value for jsmith2@gmail.com would be 1 since it's the second account (counting from zero) that you're signed into.",
				placeholder: "Your \"/b/\" value"
			},
			{
				type: "size"
			}
		],
		config: {
			size: "tiny",
			user: "0"
		},
		data: {
			count: 1,
			texts: 0,
			missed: 1,
			messages: [
				{
					type: "Call",
					date: "1 hour ago",
					from: "(123) 456-7890",
					excerpt: "This is a sample transcript from a voicemail"
				}
			]
		},
		refresh: function() {
			$.get("https://www.google.com/voice/b/" + (this.config.user || 0) + "/inbox/recent/all/", function(d) {
				try {
					if (!(d && (d = $(d)) && (d = d.find("json")).length && (d = d.text()) && (d = JSON.parse(d)) && d.unreadCounts)) {
						return;
					}

					var data = {
							count: d.unreadCounts.all || 0,
							texts: d.unreadCounts.sms || 0,
							missed: d.unreadCounts.inbox || 0
						},
						messages = [],
						id, msg, type;

					for (id in d.messages) {
						msg = d.messages[id];

						if (messages.length > 4 || !msg || msg.isRead == true) continue;

						switch (msg.type) {
							case 10: case 11: 
								type = "Text message";
							break;
							default: 
								type = "Call";
							break;
						}

						messages.push({
							from: msg.displayNumber || "Unknown",
							date: msg.relativeStartTime || "Unknown Date",
							excerpt: msg.messageText || msg.note || false,
							type: type || "Call"
						});

						type = false;
					}

					data.messages = messages;

					this.data = data;

					this.render();

					this.utils.saveData(this.data);
				}
				catch (e) {
					this.utils.error("An error occurred while trying to update the Voice widget!");
				}
			}.bind(this));
		},
		render: function() {
			var data = {
				count: this.data.count,
				texts: this.data.texts,
				missed: this.data.missed,
				user: (this.config.user || 0),
				messages: this.data.messages
			};

			this.utils.render(data);
		}
	},
	23: {
		id: 23,
		size: 4,
		order: 7,
		name: "Keep",
		nicename: "keep",
		sizes: ["variable"],
		desc: "Embeds Google Keep in a widget",
		settings: [
			{
				type: "number",
				label: "Widget Height",
				nicename: "height",
				min: 100,
				max: 800
			}
		],
		config: {
			height: 400,
			size: "variable"
		},
		render: function() {
			this.utils.render({
				url: "https://keep.google.com/keep/u/0/",
				height: this.config.height || 400
			});

			this.elm.addClass("tabbed");
		}
	},
	24: {
		id: 24,
		size: 1,
		order: 2.5,
		name: "Google Now",
		interval: 300000,
		nicename: "now",
		sizes: ["variable"],
		desc: "Displays cards from Google Now including flight status and package tracking.",
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
		authorize: function(e) {
			e.preventDefault();

			chrome.identity.getAuthToken({ interactive: true }, this.refresh);
		},
		refresh: function() {
			chrome.identity.getAuthToken(function(token) {
				if (!token) {
					return this.render("authorize");
				}

				$.ajax({
					type: "GET",
					dataType: "json",
					url: "https://www.googleapis.com/chromenow/v1/notifications",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + token);
					},
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
			if (key == "authorize") {
				this.utils.render({ authorize: true });

				return this.elm.find(".authorize").on("click", this.authorize.bind(this));
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

				chrome.identity.getAuthToken(function(token) {
					$.ajax({
						type: "DELETE",
						url: "https://www.googleapis.com/chromenow/v1/notifications/" + card.id + "?chromeNotificationId=" + encodeURIComponent(card.cnId) + "&age=29&duration=" + card.duration,
						beforeSend: function(xhr) {
							xhr.setRequestHeader("Authorization", "OAuth " + token);
						},
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
	},
	25: {
		id: 25,
		size: 4,
		order: 4.5,
		name: "Gmail",
		nicename: "gmail",
		sizes: ["variable"],
		desc: "Displays your Gmail inbox where you can manage your email.",
		settings: [
			{
				type: "text",
				nicename: "user",
				label: "Account ID",
				help: "If you're signed into multiple accounts, this is the \"authuser=\" value.<br /><br />For example, if you're signed into two accounts, jsmith1@gmail.com and jsmith2@gmail.com, the \"authuser\" value for jsmith2@gmail.com would be 1 since it's the second account (counting from zero) that you're signed into.",
				placeholder: "Your \"authuser=\" value"
			},
			{
				type: "number",
				label: "Widget Height",
				nicename: "height",
				min: 100,
				max: 800
			}
		],
		config: {
			user: "0",
			height: 400,
			size: "variable"
		},
		render: function() {
			this.utils.render({
				user: this.config.user || 0,
				height: this.config.height || 400
			});

			this.elm.addClass("tabbed");
		}
	},
	26: {
		id: 26,
		size: 1,
		order: 3,
		name: "Twitter",
		interval: 300000,
		nicename: "twitter",
		sizes: ["variable"],
		desc: "Displays tweets from your home stream or a specified list.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "select",
				nicename: "source",
				label: "Show Tweets from",
				options: "getSources"
			},
			{
				type: "number",
				nicename: "tweets",
				label: "Tweets Shown",
				min: 1,
				max: 10
			}
		],
		config: {
			source: "home",
			title: "Twitter",
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
				return cb({ "home": "You'll need to authorize iChrome first" });
			}

			this.ajax({
				type: "GET",
				url: "https://api.twitter.com/1.1/lists/list.json",
				success: function(d) {
					var sources = {
						home: "Home",
						mentions: "Mentions",
						retweets: "Retweets of me"
					};

					if (d && d.length) {
						sources.lists = {
							label: "Lists"
						};

						d.forEach(function(e, i) {
							sources.lists[e.id_str] = e.name;
						});
					}

					cb(sources);
				}
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

							t.forEach(function(e, i) {
								var split = e.split("=");

								if (split[0] == "oauth_token") {
									token = split[1];
								}
								else if (split[0] == "oauth_token_secret") {
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

						t.forEach(function(e, i) {
							var split = e.split("=");

							if (split[0] == "oauth_token") {
								token = split[1];
							}
							else if (split[0] == "oauth_token_secret") {
								secret = split[1];
							}
						});

						if (token && secret) {
							var a = document.createElement("a");

							a.target = "_blank";
							a.href = "https://api.twitter.com/oauth/authorize?oauth_token=" + token;

							a.click();

							chrome.webRequest.onBeforeRequest.addListener(
								function extract(info) {
									chrome.webRequest.onBeforeRequest.removeListener(extract);

									var verifier = info.url.match(/[&\?]oauth_verifier=([^&]+)/)[1];

									if (verifier) {
										getFinal(token, secret, verifier);

										chrome.tabs.remove(info.tabId);
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

			if (!this.CryptoJS) {
				/*
					CryptoJS v3.1.2
					code.google.com/p/crypto-js
					(c) 2009-2013 by Jeff Mott. All rights reserved.
					code.google.com/p/crypto-js/wiki/License
				*/
				var CryptoJS=CryptoJS||function(g,l){var e={},d=e.lib={},m=function(){},k=d.Base={extend:function(a){m.prototype=this;var c=new m;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
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

				this.CryptoJS = CryptoJS;
			}
			else {
				var CryptoJS = this.CryptoJS;
			}

			var method = (options.type || "GET").toUpperCase(),
				code = "", key;

			// Parse parameters
			if (options.data) {
				var parameters = options.data,
					url = options.url;
			}
			else {
				var url = options.url.split("?"),
					parameters = {};

				((url && url[1]) || "").split("&").forEach(function(e, i) {
					var param = e.split("=");

					if (param[0]) parameters[param[0]] = param[1] || "";
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
				timestamp = Math.floor(new Date().getTime() / 1000),
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
				params.push(encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key]));
			}

			// Build base string
			var baseString = method + "&" + encodeURIComponent(url) + "&" +
				encodeURIComponent(params.sort(function(a, b) { return a < b ? -1 : a > b; }).join("&"));

			// Generate signature
			var signature = CryptoJS.HmacSHA1(baseString, "" + "&" + encodeURIComponent(secret)).toString(CryptoJS.enc.Base64);

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

			if (source == "home" || !source) {
				url = "https://api.twitter.com/1.1/statuses/home_timeline.json?"
			}
			else if (source == "retweets") {
				url = "https://api.twitter.com/1.1/statuses/retweets_of_me.json?"
			}
			else if (source == "mentions") {
				url = "https://api.twitter.com/1.1/statuses/mentions_timeline.json?"
			}
			else {
				url = "https://api.twitter.com/1.1/lists/statuses.json?list_id=" + source + "&"
			}

			this.ajax({
				type: "GET",
				url: url + "count=" + (this.config.tweets || 5),
				success: function(d) {
					var tweets = [];

					if (d && d.forEach) {
						var hEscape = function(str) {
							// Based off of Hogan.js' escape method

							var amp		= /&/g,
								lt		= /</g,
								gt		= />/g,
								apos	= /\'/g,
								quot	= /\"/g,
								brace	= /\{/g,
								all		= /[&<>\{\"\']/,
								str		= String(str || "");

							if (all.test(str)) {
								return str.replace(amp, "&amp;").replace(lt, "&lt;").replace(gt, "&gt;").replace(apos, "&#39;").replace(quot, "&quot;").replace(brace, "&#123;");
							}
							else {
								return str;
							}
						};

						d.forEach(function(e, i) {
							var retweet = e.retweeted_status || false;

							var tweet = {
								id: e.id_str,
								content: (retweet ? retweet.text : e.text),
								user: e.user.name,
								username: e.user.screen_name,
								image: e.user.profile_image_url_https,
								age: moment(e.created_at).toDate().getTime()
							};

							var replaces = [];

							(retweet ? retweet.entities : e.entities).hashtags.forEach(function(e, i) {
								replaces.push({
									loc: e.indices,
									text: '<a href="http://www.twitter.com/search?q=%23' +
												hEscape(encodeURIComponent(e.text)) +
											'&amp;src=hash" target="_blank">#' +
												hEscape(e.text) +
											'</a>'
								});
							});

							(retweet ? retweet.entities : e.entities).urls.forEach(function(e, i) {
								replaces.push({
									loc: e.indices,
									text: '<a href="' + hEscape(e.url) + '" target="_blank">' + hEscape(e.display_url) + '</a>'
								});
							});

							(retweet ? retweet.entities : e.entities).user_mentions.forEach(function(e, i) {
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

							replaces.forEach(function(e, i) {
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
			if (key == "authorize" || (!this.config.token && !key)) {
				this.utils.render({
					authorize: true,
					title: (this.config.title && this.config.title !== "" ? this.config.title : false)
				});

				return this.elm.find(".authorize").on("click", this.authorize.bind(this));
			}

			var data = $.extend(true, {}, this.data);

			data.tweets.forEach(function(e, i) {
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
	},
	27: {
		id: 27,
		size: 1,
		order: 7.5,
		name: "Drive",
		interval: 300000,
		nicename: "drive",
		sizes: ["variable"],
		desc: "Displays recently changed files from your Google Drive.",
		settings: [
			{
				type: "text",
				nicename: "title",
				label: "Widget Title",
				placeholder: "Enter a widget title or leave blank to hide"
			},
			{
				type: "number",
				nicename: "files",
				label: "Number of Files Shown",
				min: 1,
				max: 20
			}
		],
		config: {
			title: "Drive",
			size: "variable",
			files: 8
		},
		data: {
			files: [
				{
					name: "Recent trips",
					icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_collection_email.png",
					link: "https://drive.google.com/",
					user: "John Doe",
					date: 1396978331809
				},
				{
					name: "Getaway camping plans",
					icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_spreadsheet_email.png",
					link: "https://drive.google.com/",
					user: "John Doe",
					date: 1396961351031
				},
				{
					name: "20120716-213442_3-urban0_high_resolution.jpg",
					icon: "https://lh4.googleusercontent.com/HG7nuq3CpdLbTRIebHh0DrW7zwNco8aY9CIOTB4SDwBjNj7mrOxU_JNEsl2rIJqc8A=s75-c",
					link: "https://drive.google.com/",
					user: "Avi Kohn",
					date: 1396912248952
				},
				{
					name: "Engagement party menu ideas",
					icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_document_email.png",
					link: "https://drive.google.com/",
					user: "John Doe",
					date: 1395760856920
				},
				{
					name: "notifiersalpha",
					icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_document_email.png",
					link: "https://drive.google.com/",
					user: "John Doe",
					date: 1395760558164
				},
				{
					name: "Catering_agreement.pdf",
					icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_pdf_email.png",
					link: "https://drive.google.com/",
					user: "John Doe",
					date: 1395760364357
				},
				{
					name: "Grocery List.xlsx",
					icon: "https://ssl.gstatic.com/docs/doclist/images/icon_11_excel_email.png",
					link: "https://drive.google.com/",
					user: "John Doe",
					date: 1394551564697
				},
				{
					name: "H20120827-185744_3-urban2_high_resolution.jpg",
					icon: "https://lh6.googleusercontent.com/HFuWO2XkEPYSXvvMRDhXA5sD8k9Gamuas2aeMz4H-YxycnzGp3d62mOWPAJ1U5zc5w=s75-c",
					link: "https://drive.google.com/",
					user: "John Doe",
					date: 1394219609054
				}
			]
		},
		oAuth: false,
		setOAuth: function() {
			this.oAuth = new OAuth2("drive", {
				client_id: "559765430405-jtbjv5ivuc17nenpsl4dfk9r53a3q0hg.apps.googleusercontent.com",
				client_secret: "",
				api_scope: "https://www.googleapis.com/auth/drive.readonly"
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
					data: {
						maxResults: this.config.files || 8,
						fields: "items(alternateLink,iconLink,mimeType,thumbnailLink,lastModifyingUserName,modifiedDate,title)"
					},
					url: "https://www.googleapis.com/drive/v2/files",
					beforeSend: function(xhr) {
						xhr.setRequestHeader("Authorization", "OAuth " + this.oAuth.getAccessToken());
					}.bind(this),
					success: function(d) {
						var files = [];

						if (d && d.items) {
							d.items.forEach(function(e, i) {
								var file = {
									name: e.title,
									icon: e.iconLink,
									link: e.alternateLink,
									user: e.lastModifyingUserName,
									date: moment(e.modifiedDate).toDate().getTime()
								};

								if (e.thumbnailLink && e.mimeType && (e.mimeType.indexOf("image") == 0 || e.mimeType.indexOf("video") == 0)) {
									file.icon = e.thumbnailLink.replace(/=s220$/, "=s75-c"); // Replace the 220px picture with a 75px square one
								}
								else if (e.iconLink) {
									file.icon = e.iconLink.replace("_list.png", "_email.png").replace("icon_10", "icon_11"); // Replace the 16px icon with a 32px icon and version 10 icons with V11
								}

								files.push(file);
							});

							this.data = {
								files: files
							};

							this.render();

							this.utils.saveData(this.data);
						}
					}.bind(this)
				});
			}.bind(this));
		},
		render: function(key) {
			if (!this.oAuth) this.setOAuth();

			if (key == "authorize" || (!key && !this.oAuth.getAccessToken())) {
				this.utils.render({
					authorize: true,
					title: (this.config.title && this.config.title !== "" ? this.config.title : false)
				});

				return this.elm.find(".authorize").on("click", function(e) {
					e.preventDefault();

					this.oAuth.authorize.call(this.oAuth, this.refresh.bind(this));
				}.bind(this));
			}

			var data = $.extend(true, {}, this.data);

			data.files.forEach(function(e, i) {
				var date = moment(e.date);

				if (moment().diff(date, "days") > 7) {
					e.modified = date.format("MMMM Do YYYY") + " by " + e.user;
				}
				else {
					e.modified = date.calendar() + " by " + e.user;
				}
			});

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);
		}
	},
	28: {
		id: 28,
		size: 1,
		order: 5.5,
		name: "Calculator",
		nicename: "calc",
		sizes: ["tiny", "small", "medium"],
		settings: [
			{
				type: "size"
			}
		],
		config: {
			size: "medium"
		},
		desc: "Displays a calculator with support for basic operators.",
		render: function() {
			/*
				This calculator works for the most part, but can't really be expanded.

				If it needs to be it should be rewritten so problems are stored as an array, like so:

					["2", " x ", "3.14", " + ", ["2", " x ", ["sqrt", ["2", " + ", "3"]]]]

				That would be rendered as: 2 x 3.14 + (2 x √(2 + 3)).

				The syntax can be easily expanded so the calculator supports sin, cos, tan, square roots, exponents, etc.

				This also makes decimal point validation easier, and makes sure there are no missing parentheses or consecutive operators.

				But, right now it's unnecessary.
			*/

			this.utils.render();

			var btns = this.elm.find("button"),
				display = this.elm.find(".display"),
				d0 = display[0],
				overwrite = false,
				nums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
				f;

			var calculate = function() {
				var problem = d0.value
					.replace(/×/g, "*") // Multiplication symbol with *
					.replace(/x/gi, "*") // x with *
					.replace(/÷/g, "/") // Division symbol with /
					.replace(/[^ +\-()1234567890*\/]|[\-+\/\*\.]{2}/g, "") // Replace all invalid characters
					.replace(/ {1,}/g, " ") // Multiple spaces
					.replace(/([0-9]) ([0-9])/g, "$1$2") // Spaces in numbers
					.replace(/[0-9\.]+/g, function(match) { // Handle multiple decimal places within a number
						f = true;

						return " " +
								match.replace(/\./g, function() {
									return (f && !(f = false)) ? "." : "";
								})
							+ " ";
					})
					.replace(/ {1,}/g, " ") // Multiple spaces
					.replace(/([0-9]) ?\(/g, "$1 * (") // Handle parentheses adjacent to numbers by multiplying them
					.replace(/\) ?([0-9])/g, ") * $1") // Again
					.trim();

				if (problem.indexOf("(") !== -1 || problem.indexOf(")") !== -1) {
					// Modified from: http://stackoverflow.com/a/14369329/900747
					var check = function(str) {
						var s;

						str = str.replace(/[^()]/g, "");

						while (s != str) { 
							s = str;

							str = str.replace(/\(\)/g, "");
						}

						return !str;
					};

					while ((problem.match(/\(/g) || "").length > (problem.match(/\)/g) || "").length) {
						problem += ")";
					}

					while ((problem.match(/\)/g) || "").length > (problem.match(/\(/g) || "").length) {
						problem = "(" + problem;
					}

					if (!check(problem)) {
						alert("There appear to be mismatched parentheses in your problem! Please double-check it.");
					}
				}

				try {
					var answer = eval(problem);

					if (typeof answer !== "number" || isNaN(answer)) {
						d0.value = "Error!";
					}
					else if (answer == Infinity || answer == -Infinity) {
						d0.value = "Infinity";
					}
					else {
						d0.value = +answer.toFixed(8); // Maximum of 8 decimal places
					}
				}
				catch(e) {
					alert("Something went wrong while trying to solve your problem! Please double-check it.");
				}

				overwrite = true;
			};

			btns.on("click", function(e) {
				e.preventDefault();

				var which = this.getAttribute("data-id"),
					value;

				if (nums.indexOf(which) !== -1) {
					value = which;
				}
				else {
					switch (which) {
						case "oparen":
							value = "(";
						break;
						case "cparen":
							value = ")";
						break;
						case "plus":
							value = " + ";
						break;
						case "minus":
							value = " - ";
						break;
						case "multiply":
							value = " × ";
						break;
						case "divide":
							value = " ÷ ";
						break;
						case "decimal":
							value = ".";
						break;
						case "clear":
							d0.value = "";
						break;
						case "equals":
							calculate();
						break;
					}
				}

				if (value) {
					if (!overwrite) {
						/*var start = d0.selectionStart;

						d0.value = d0.value.slice(0, start) + value + d0.value.slice(d0.selectionEnd);

						d0.setSelectionRange(start, start);*/

						d0.value += value;
					}
					else {
						d0.value = value;

						overwrite = false;
					}
					
					d0.focus();
				}
			});

			display.on("keydown", function(e) {
				if (e.which == 13) {
					calculate();
				}
			}).on("input", function(e) {
				var val = d0.value.replace(/[^ +\-()1234567890*\/×x\.÷]/g, "");

				if (d0.value != val) {
					var start = d0.selectionStart - 1, // These are -1 since the cursor is just after the entered text and we want to be before
						end = d0.selectionEnd - 1;

					d0.value = val;

					d0.setSelectionRange(start, end);
				}
			}).on("focusout", function(e) {
				d0.value = d0.value // See calculate() for comments
					.replace(/[^ +\-()1234567890*\/x\.×÷]|[\-+\/\*\.]{2}/g, "")
					.replace(/[0-9\.]+/g, function(match) {
						f = true;

						return " " +
								match.replace(/\./g, function() {
									return (f && !(f = false)) ? "." : "";
								})
							+ " ";
					})
					.replace(/ {1,}/g, " ")
					.replace(/\( /g, "(")
					.replace(/ \)/g, ")")
					.replace(/([+\-x×÷*\/])(\()|(\))([+\-x×÷*\/])/g, "$1 $2")
					.trim();
			});
		}
	}
};

(initLog || (window.initLog = [])).push([new Date().getTime(), "Done with widgets JS loading and processing"]);