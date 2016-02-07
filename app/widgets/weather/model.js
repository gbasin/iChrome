define(["lodash", "widgets/model", "moment"], function(_, WidgetModel, moment) {
	return WidgetModel.extend({
		refreshInterval: 300000,

		defaults: {
			config: {
				size: "variable",
				units: "imperial",
				hourly: "enabled",
				forecast: "enabled",
				location: ["San Francisco, CA"],
				resolvedLocs: ["defaultLoc"],
				resolvedNames: ["San Francisco, CA"]
			},

			data: {
				units: {
					temp: "F",
					pressure: "in",
					speed: "mph",
					distance: "mi"
				},
				weather: [
					{
						name: "San Francisco, CA",
						current: {
							caption: "Mostly Sunny",
							icon: 2,
							temp: 59,
							windSpeed: 4,
							windDir: 136,
							precip: 0,
							conditions: "sunny"
						},
						forecast: [
							{
								caption: "Sunny",
								icon: 1,
								high: 62,
								low: 49,
								windSpeed: 9,
								precip: 0,
								windDir: 97,
								date: "Thu",
								conditions: "sunny"
							},
							{
								caption: "Sunny",
								icon: 1,
								high: 62,
								low: 50,
								windSpeed: 7,
								precip: 0,
								windDir: 109,
								date: "Fri",
								conditions: "sunny"
							},
							{
								caption: "Sunny",
								icon: 1,
								high: 60,
								low: 51,
								windSpeed: 13,
								precip: 30,
								windDir: 1,
								date: "Sat",
								conditions: "sunny"
							},
							{
								caption: "Sunny",
								icon: 1,
								high: 58,
								low: 47,
								windSpeed: 24,
								precip: 80,
								windDir: 123,
								date: "Sun",
								conditions: "sunny"
							},
							{
								caption: "Sunny",
								icon: 1,
								high: 58,
								low: 50,
								windSpeed: 17,
								precip: 10,
								windDir: 146,
								date: "Mon",
								conditions: "sunny"
							}
						]
					}
				]
			}
		},

		initialize: function() {
			WidgetModel.prototype.initialize.call(this);

			if (this.config.woeid || this.config.woeloc) {
				delete this.config.woeid;
				delete this.config.woeloc;
			}

			if (this.config.units && this.config.units === "standard") {
				this.config.units = "imperial";
			}

			if (this.get("size") === "small") {
				this.config.forecast = "disabled";

				this.set("size", "variable");
			}
			else if (this.get("size") === "medium") {
				this.set("size", "variable");
			}


			// If we're previewing, refresh anyway so Pro users can test a fully interactive version
			if (this.isPreview) {
				this.refresh();
			}
		},

		resolveLocs: function(cb) {
			var arr = this.config.location.slice();

			arr.forEach(function(e, i, a) { a[i] = e.replace(/\|/g, " "); });

			this.Auth.ajax({
				url: "/weather/locations/resolve/" + encodeURIComponent(arr.join("|")),
				success: function(d) {
					if (d && d.locations) {
						this.config.location = [];
						this.config.resolvedLocs = [];
						this.config.resolvedNames = [];

						_.each(d.locations, function(e) {
							this.config.location.push(e.name);
							this.config.resolvedNames.push(e.name);
							this.config.resolvedLocs.push([e.lat, e.lon]);
						}, this);
					}
					else {
						this.config.resolvedLocs = ["defaultLoc"];

						this.config.location = ["San Francisco, CA"];
						this.config.resolvedNames = ["San Francisco, CA"];
					}

					cb.call(this);
				}.bind(this)
			});
		},

		getCondition: function(code) {
			if (typeof code === "string") {
				code = parseInt(code);
			}

			switch (code) {
				case 1:
					return "sunny";

				case 3:
				case 4:
					return "partlycloudy";

				case 5:
				case 6:
				case 7:
				case 9:
				case 12:
				case 91:
					return "cloudy";

				case 8:
				case 19:
					return "lightrain";

				case 14:
				case 22:
					return "rain";

				case 10:
				case 15:
					return "snow";

				case 16:
				case 20:
				case 26:
				case 43:
				case 82:
					return "lightsnow";

				case 23:
					return "showers";

				case 24:
				case 77:
				case 78:
					return "lightrain-snow";

				case 27:
				case 54:
					return "tstorms";

				case 28:
					return "clear-night";

				case 30:
					return "partlycloudy-night";

				case 50:
					return "showers-night";

				default:
					return "sunny";
			}
		},

		refresh: function() {
			var get = function() {
				var done = 0,
					units,
					erred = false,
					locs = this.config.resolvedLocs.length,
					weather = new Array(this.config.resolvedLocs.length);

				var next = function(err) {
					if (err || erred) {
						erred = true;

						return;
					}

					done++;

					if (done !== locs) {
						return;
					}

					this.saveData({
						units: units,
						weather: weather
					});
				}.bind(this);

				_.each(this.config.resolvedLocs, function(loc, i) {
					var isDefaultLoc = loc === "defaultLoc";

					if (isDefaultLoc) {
						loc = [37.777, -122.42];
					}

					this.Auth.ajax({
						url: "/weather",
						data: {
							lat: loc[0],
							lon: loc[1],
							units: this.config.units || null,
							hourly: this.config.hourly === "enabled" ? true : null
						}
					}).done(function(d) {
						if (!d) {
							return next(true);
						}

						if (typeof d !== "object") {
							try {
								d = JSON.parse(d);
							}
							catch (e) {
								return next(true);
							}
						}

						if (!units && d.units) {
							units = d.units;
						}

						var ret = {
							index: i,
							name: this.config.resolvedNames[i],
							nameEnc: encodeURIComponent(this.config.resolvedNames[i]),
							current: d.current
						};

						var formatValues = function(d) {
							if (d.icon) {
								d.conditions = this.getCondition(d.icon);
							}

							if (d.sunrise) {
								d.sunrise = moment(d.sunrise).format("LT");
							}

							if (d.sunset) {
								d.sunset = moment(d.sunset).format("LT");
							}

							if (d.moonrise) {
								d.moonrise = moment(d.moonrise).format("LT");
							}

							if (d.moonset) {
								d.moonset = moment(d.moonset).format("LT");
							}

							return d;
						}.bind(this);

						formatValues(ret.current);

						if (!this.config.forecast || this.config.forecast === "enabled") {
							ret.forecast = _.map(d.forecast, function(e, i) {
								e.hourly = _.map(e.hourly, function(e, i) {
									e.index = i;

									e.date = moment(e.date).format("h A");

									return formatValues(e);
								});

								e.index = i;

								e.date = moment(e.date).format("ddd");

								return formatValues(e);
							});
						}

						weather[i] = ret;

						next();
					}.bind(this)).fail(function() {
						next(true);
					});
				}, this);
			};

			if (typeof this.config.location === "string") {
				this.config.location = [this.config.location];
			}

			if (this.config.resolvedNames && this.config.resolvedNames.join("|") === this.config.location.join("|")) {
				get.call(this);
			}
			else {
				this.resolveLocs(get);
			}
		}
	});
});