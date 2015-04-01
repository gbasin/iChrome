/*
 * The Weather widget.
 */
define(["jquery"], function($) {
	return {
		id: 1,
		size: 3,
		order: 1,
		interval: 300000,
		nicename: "weather",
		sizes: ["tiny", "small", "medium"],
		settings: [
			{
				type: "size"
			},
			{
				type: "list",
				nicename: "location",
				label: "i18n.settings.location",
				placeholder: "i18n.settings.location_placeholder"
			},
			{
				type: "radio",
				nicename: "units",
				label: "i18n.settings.temperature",
				options: {
					standard: "Fahrenheit",
					metric: "Celsius"
				}
			},
			{
				type: "radio",
				nicename: "wind",
				label: "i18n.settings.wind",
				options: {
					mph: "Miles",
					kph: "Kilometers"
				}
			}
		],
		config: {
			size: "medium",
			location: ["San Francisco, CA"],
			units: "standard",
			wind: "mph",
			woeid: ["2487956"],
			woeloc: ["San Francisco, CA"]
		},
		data: {
			weather: [
				{
					wind: "6",
					chill: "62",
					humidity: "53",
					temp: 62,
					status: "Cloudy",
					conditions: "cloudy",
					location: "San Francisco",
					forecast: [
						{
							date: "Wed",
							high: "62",
							low: "56",
							status: "Rain",
							conditions: "drizzle"
						},
						{
							date: "Thu",
							high: "64",
							low: "55",
							status: "AM Showers",
							conditions: "tstorms"
						},
						{
							date: "Fri",
							high: "62",
							low: "53",
							status: "Partly Cloudy",
							conditions: "partlycloudy"
						},
						{
							date: "Sat",
							high: "63",
							low: "54",
							status: "Partly Cloudy",
							conditions: "partlycloudy"
						},
						{
							date: "Sun",
							high: "65",
							low: "53",
							status: "Mostly Sunny",
							conditions: "partlycloudy"
						}
					]
				}
			]
		},
		getLocs: function(cb) {
			var arr = this.config.location.slice();

			arr.forEach(function(e, i, a) { a[i] = e.replace(/"/g, ""); });

			// Switched to placefinder instead of places since it handles punctuation and special characters much better. i.e. Strathmore, Alberta, Canada and Córdoba, Argentina
			$.get("http://query.yahooapis.com/v1/public/yql?q=select%20city%2C%20statecode%2C%20country%2C%20woeid%20from%20geo.placefinder%20where%20" +
					encodeURIComponent('woeid in (select woeid from geo.placefinder where text="' + arr.join('" limit 1) or woeid in (select woeid from geo.placefinder where text="') + '" limit 1)') + "&format=json",
			function(d) {
				if (d && d.query && d.query.results && d.query.results.Result && (d.query.results.Result.woeid || (d.query.results.Result[0] && d.query.results.Result[0].woeid))) {
					if (d.query.results.Result.woeid) {
						d.query.results.Result = [d.query.results.Result];
					}
					
					var m = d.query.results.Result;

					this.config.woeloc = [];
					this.config.location = [];
					this.config.woeid = [];

					m.forEach(function(e, i) {
						var loc = (e.city ? e.city : "") + (e.country || e.statecode ? ", " : "") + (e.statecode || "") + (e.country && e.country !== "United States" ? (e.statecode ? " " : "") + e.country : "");

						this.config.woeloc.push(loc);
						this.config.location.push(loc);
						this.config.woeid.push(e.woeid);
					}.bind(this));
				}
				else {
					this.config.woeid = ["2487956"];

					this.config.location = ["San Francisco, CA"];
					this.config.woeloc = ["San Francisco, CA"];
				}

				cb.call(this);
			}.bind(this));
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
				case 16:
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
				unknown = this.utils.translate("unknown"),
				get = function() {
					$.get("https://query.yahooapis.com/v1/public/yql?format=json&q=select%20*%20from%20weather.forecast%20where%20"
							+ encodeURIComponent("woeid=" + (this.config.woeid || ["2487956"]).join(" or woeid=")),
					function(res) {
						var weather = [];

						if (!(res && res.query && res.query.results && res.query.results.channel)) {
							return this.utils.error.call(this, "An error occurred while trying to fetch the weather.");
						}

						(res.query.results.channel.length ? res.query.results.channel : [res.query.results.channel]).forEach(function(res, i) {
							if (!(res && res.item && res.item.condition && res.item.condition.code)) {
								return this.utils.error.call(this, "An error occurred while trying to fetch the weather.");
							}

							var w = {
									wind: res.wind.speed || 0,
									chill: res.wind.chill || "0",
									humidity: res.atmosphere.humidity || 0,
									temp: parseInt(res.item.condition.temp || 0),
									status: res.item.condition.text || unknown,
									conditions: this.getCondition(res.item.condition.code) || "unknown",

									location: (res.location.city ? res.location.city : (res.location.region ? res.location.region : (res.location.country ? res.location.country : unknown))),
									forecast: []
								};

							res.item.forecast.forEach(function(e, i) {
								w.forecast.push({
									date: e.day || "NA",
									high: e.high || 0,
									low: e.low || 0,
									status: e.text || unknown,
									conditions: this.getCondition(e.code) || "unknown"
								});
							}.bind(this));

							weather.push(w);
						}.bind(this));

						this.data = {
							weather: weather
						};

						this.utils.saveData(weather);

						this.render.call(this);
					}.bind(this));
				}.bind(this);

			if (typeof config.woeid == "string") {
				this.config.woeid = config.woeid = [config.woeid];
			}

			if (typeof config.woeloc == "string") {
				this.config.woeloc = config.woeloc = [config.woeloc];
			}

			if (typeof config.location == "string") {
				this.config.location = config.location = [config.location];
			}

			if (config.woeid && config.woeloc.join("") == config.location.join("")) {
				get();
			}
			else {
				this.getLocs(get);
			}
		},
		render: function() {
			var data = $.extend(true, {}, this.data);

			if (data.temp) {
				data = {
					weather: [data]
				};
			}

			if (!data.weather) {
				data.weather = [];
			}

			data.weather.forEach(function(loc, i) {
				if (this.config.units == "metric") {
					loc.metric = true;
					loc.temp = Math.round(((loc.temp - 32) * 5) / 9);
					loc.chill = Math.round(((loc.chill - 32) * 5) / 9);

					loc.forecast.forEach(function(e, i) {
						e.high = Math.round(((e.high - 32) * 5) / 9);
						e.low = Math.round(((e.low - 32) * 5) / 9);

						loc.forecast[i] = e;
					});
				}

				if (this.config.wind == "kph") {
					loc.wind = Math.round(loc.wind * 1.609344) + " kph";
				}
				else {
					loc.wind += " mph";
				}

				switch (this.config.size) {
					case "small":
						delete loc.forecast;
					break;
					case "medium":
						loc.forecast = loc.forecast.slice(0, 5);
					break;
				}

				data.weather[i] = loc;
			}.bind(this));

			if (this.config.title && this.config.title !== "") {
				data.title = this.config.title;
			}

			this.utils.render(data);

			var that = this;

			this.elm.children(".cond, .temp, .details, .forecast").click(function() {
				// This method uses the default target
				var link = document.createElement("a");

				link.href = "https://www.google.com/search?q=weather";

				link.click();
			}).end().find(".temp sup a").click(function(e) {
				e.preventDefault();
				e.stopPropagation();

				that.config.units = (that.config.units == "standard" ? "metric" : "standard");

				that.render.call(that);

				that.utils.saveConfig(that.config);
			});
		}
	};
});