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
				resolvedNames: ["San Francisco, CA"],
				source: "0"
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

		getCondition2: function(code, id) {
			if (typeof id === "string") {
				id = parseInt(id);
			}
			id = id || 0;
			code = code || "";

			switch (code) {
				case "01d" : return "sunny";
				case "02d" : return "partlycloudy";
				case "03d" : return "cloudy";
				case "04d" : return "partlycloudy";
				case "09d" : return "rain";
				case "10d" :
					if (id >= 500 && id <= 501) {
						return "lightrain";
					}
					return "showers";
				case "11d" : return "tstorms";
				case "13d" : 
					if (id >= 600 && id <= 601) {
						return "lightrain-snow";
					}
					if (id >= 615 && id <= 622) {
						return "lightsnow";
					}
					return "snow";
				case "50d" : return "mist";
				case "01n" : return "clear-night";
				case "02n" : return "partlycloudy-night";
				case "03n" : return "cloudy";
				case "04n" : return "partlycloudy-night";
				case "09n" : return "rain";
				case "10n" : return "showers-night";
				case "11n" : return "tstorms";
				case "13n" : return "snow";
				case "50n" : return "mist";
				default: return "unknown";
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

					if (this.config.source === 1)
					{
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
					}else{
						this.Auth.ajax({
							url: "/weather/get2",
							data: {
								lat: loc[0],
								lon: loc[1],
								units: this.config.units || null,
								hourly: this.config.hourly === "enabled" ? true : null,
								nc: new Date().getTime()
								//force: 101
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

							var isF = this.config.units === "imperial";

							units = {
							 	temp: "C",
							 	pressure: "hPa",
							 	speed: "m/s",
							 	distance: "km"
							};
							if (isF) {
								units = {
									temp: "F",
									pressure: "in",
									speed: "mph",
									distance: "mi"
								};
							}

							if (!units && d.units2) {
								units = d.units2;
							}

							var ret = {
								index: i,
								name: this.config.resolvedNames[i],
								nameEnc: encodeURIComponent(this.config.resolvedNames[i]),
								current: d.current2,
								hourly: this.config.hourly === "enabled" && this.Auth.isPro ? "active" : "" 
							};
	
							var formatValues = function(i) {
								i.precip = Math.round(Number(i.pop || 0) * 100);

								if (i.icon) {
									i.conditions = this.getCondition2(i.icon, i.id);
								}

								if (isF) {
									if (i.barometer) {
										i.barometer = Math.round(Number(i.barometer) / 0.00029529983071445); //To in
									}

									if (i.temp) {
										i.temp = Number(i.temp) * 1.8 + 32; //To F
									}

									if (i.high) {
										i.high = Number(i.high) * 1.8 + 32; //To F
									}

									if (i.low) {
										i.low = Number(i.low) * 1.8 + 32; //To F
									}

									if (i.feelsLike) {
										i.feelsLike = Number(i.feelsLike) * 1.8 + 32; //To C
									}

									if (i.windSpeed) {
										i.windSpeed = Math.round(Number(i.windSpeed) * 2.237); //To mph
									}

									if (i.visibility) {
										i.visibility = Math.round(Number(i.visibility) * 0.00062137); //To mi
									}
								}
								else {
									if (i.visibility) {
										i.visibility = Math.round(Number(i.visibility) / 100) / 10;
									}
								}

								if (i.temp) {
									i.temp = Math.round(i.temp);
								}

								if (i.high) {
									i.high = Math.round(i.high);
								}

								if (i.low) {
									i.low = Math.round(i.low);
								}

								if (i.feelsLike) {
									i.feelsLike = Math.round(i.feelsLike);
								}

								if (i.sunrise) {
									i.sunrise = moment.utc((i.sunrise + d.offset2) * 1000).format("LT");
								}
	
								if (i.sunset) {
									i.sunset = moment.utc((i.sunset + d.offset2) * 1000).format("LT");
								}
	
								if (i.moonrise) {
									i.moonrise = moment.utc((i.moonrise + d.offset2) * 1000).format("LT");
								}
	
								if (i.moonset) {
									i.moonset = moment.utc((i.moonset + d.offset2) * 1000).format("LT");
								}

								return i;
							}.bind(this);
	
							formatValues(ret.current);
							delete ret.current.high;

							if (!this.config.forecast || this.config.forecast === "enabled") {
								var mergeIcons2 = function (hourly) {
									hourly = hourly || [];
									var numberIds = _.filter(_.map(hourly, function(i) { 
									  var res = {
										id: i.id,
										i: 0
									  };
									  var icon = i.icon;
									  if (icon && icon.length > 0) {
										res.i = Number(icon.substring(0, 2));
									  }
									  return res;
									}), function(i) { return !Number.isNaN(i.i); });
									
									var numbers = _.map(numberIds, function(i) { return i.i; });
									var ids = _.map(numberIds, function(i) { return i.id; });
									
									if (_.contains(numbers, 11)) {
									  return "tstorms";
									}
									
									if (_.contains(numbers, 13)) { //snow
									  if (_.contains(numbers, 9) || _.contains(numbers, 10) || _.any(ids, function(id) { return (id >= 600 && id <= 601) || (id >= 615 && id <= 622); } )) { //and rain
										return "lightrain-snow";
									  }
									  
									  return "snow";
									}

									if (_.contains(numbers, 10)) { //shower
										if (_.any(ids, function(id) { return (id >= 500 && id <= 501) || (id >= 615 && id <= 622); } )) {
											return "lightrain";
										}
									}

									if (_.contains(numbers, 9)) { //rain
										return "rain";
									}
								  
									var cloudies = _.filter(numbers, function(n) { return n === 3; }).length;
									var partCloudies = _.filter(numbers, function(n) { return n === 2 || n === 4; }).length;

									if (cloudies > (numbers.length / 2)) {
									  return "cloudy"; 
									}
								  
									if (partCloudies > (numbers.length / 2)) {
									  return "partlycloudy"; 
									}
									
									if ((cloudies + partCloudies) > (numbers.length / 2)) {
										if (cloudies > partCloudies) {
											return "cloudy"; 
										}

										return "partlycloudy"; 
									}

									if (_.filter(numbers, function(n) { return n === 50; }).length > (numbers.length * 3 / 4)) {
									  return "mist"; 
									}
								  
									return "sunny";
								  };

									var forecastGroups = _.groupBy(d.hourly2, function(i) {
										return moment.utc(i.date * 1000 + d.offset2 * 1000).startOf('day').unix();
									});
								  
								  var index = 0;	
								  ret.forecast = _.map(forecastGroups, function(hourly) {
									var res = {};
									res.index = index++;
									res.date = moment.utc((Number(hourly[0].date) + d.offset2)  * 1000).format("ddd");
									res.high = _.max(_.map(hourly, function(i) { return i.high; }));
									res.low = _.min(_.map(hourly, function(i) { return i.low; }));
									res.feelsLike = _.max(_.map(hourly, function(i) { return i.feelsLike; }));
									res.visibility = _.min(_.map(hourly, function(i) { return i.visibility; }));
									res.pop = _.max(_.map(hourly, function(i) { return i.pop || 0; }));
									//res.temp = res.high;
									res = formatValues(res);
									res.conditions = mergeIcons2(hourly);
									return res;
								  });

								  if (this.config.hourly === "enabled" && this.Auth.isPro)
								  {
									ret.forecast[0].hourly = _.map(d.hourly2, function(e, i) {
										e.index = i;
										e.date = moment.utc((e.date + d.offset2) * 1000).format("h A");
										delete e.high;
										return formatValues(e);
									  }).slice(0, 80);
								  }
							}
	
							weather[i] = ret;
	
							next();
						}.bind(this)).fail(function() {
							next(true);
						});
					}

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