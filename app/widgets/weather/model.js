define(["lodash", "widgets/model", "moment"], function(_, WidgetModel, moment) {
	return WidgetModel.extend({
		refreshInterval: 300000,

		pro_tooltip: "weather",

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
				pro_tooltip: "text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 text 11 22 ",
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

		autocomplete: function(val, cb) {
			this.Auth.ajax({
				url: "/weather/autocomplete?s=" + val,
				success: function(d) {
					if (d && typeof(d) === "string") {
						try {
							var data = JSON.parse(d);
							var items = _.compact(_.flatten(_.map(data, function(e) {
								if (e === "%s" || e === "")	{ return null; }
								var tokens = e.split(",");
								var value = e;
								var label = e;
								if (tokens.length !== 3) {
									return {
										value: value,
										label: label
									};
								}
								
								return [
									{
										value: tokens[0] + "," +  tokens[2] /*+ "," + tokens[1] + " region"*/,
										label: tokens[0] + "," +  tokens[2] /*+ "," + tokens[1] + " region"*/,
									},
									{
										value: tokens[0] + "," +  tokens[2] + "," + tokens[1] + " region",
										label: tokens[0] + "," +  tokens[2] + "," + tokens[1] + " region",
									},
								];								
							})));
							if (items && items.length > 0) {
								var empty = {
									value: "<novalue>",
									label: "."
								};
	
								items = [empty].concat(items);
							}
							cb(items);
						} catch(e) {
						}							
					}
				}.bind(this)
			});
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
				case 2: //"Mostly Sunny"
				case 39: //"Fair"
					return "sunny";

				case 3:
				case 4:
					return "partlycloudy";

				case 5:
				case 6:
				case 7:
				case 9:
				case 12:
				case 32:
				case 36: //"Fog"
				case 90: //"Smoke"
				case 91:
					return "cloudy";

				case 8:
				case 19:
				case 46:
					return "lightrain";

				case 14:
				case 22:
				case 49: //"Rain"
					return "rain";

				case 10:
				case 15:
				case 25:
				case 52:
					return "snow";

				case 16:
				case 20:
				case 26:
				case 43:
				case 47:
				case 82:
					return "lightsnow";

				case 23:
					return "showers";

				case 24:
				case 75:
				case 76: //"Light Rain and Snow"
				case 77:
				case 78:
					return "lightrain-snow";

				case 27:
				case 54:
					return "tstorms";

				case 28:
				case 29: //"Mostly Clear"				
					return "clear-night";

				case 30:
				case 31: //"Mostly cloudy"
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
							hourly: this.config.hourly === "enabled" ? true : null,
							nc: new Date().getTime()
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
							current: d.current,
							hourly: this.config.hourly === "enabled" && this.Auth.isPro ? "active" : "" 
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

								e.date = moment(e.date).add(12, 'hours').format("ddd");

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

			var doResolve = function() {
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
			.bind(this);

			var isDefaultLoc = _.size(this.config.resolvedLocs) === 1 && _.head(this.config.resolvedLocs) === "defaultLoc";
			if (!isDefaultLoc) {
				doResolve();
			}
			else{
				this.Auth.ajax({
					url: "/weather/getLocation",
					success: function(d) {
						if (d && typeof(d) === "string") {
							var data = {};
							try {
								data = JSON.parse(d);
							} catch(e) {
							}							

							if (!data.geoplugin_city || data.geoplugin_city === "") { return; } //The resolve function does does not work if city is absent
							var name = data.geoplugin_city;
							if (!data.geoplugin_regionCode && data.geoplugin_regionCode !== "") {
								name += ", ";
								name += data.geoplugin_regionCode;
							}
							if (!data.geoplugin_countryName && data.geoplugin_countryName !== "") {
								name += ", ";
								name += data.geoplugin_countryName;
							}
							this.config.location = [name];
							this.config.resolvedNames = [name];
							this.config.resolvedLocs = [[data.geoplugin_latitude, data.geoplugin_longitude]];
							this.saveData();
						}
					}.bind(this),
				}).always(function() {
					doResolve();
				});
			}
		}
	});
});