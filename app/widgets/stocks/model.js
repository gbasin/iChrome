define(["jquery", "lodash", "widgets/model", "moment"], function($, _, WidgetModel, moment) {
	return WidgetModel.extend({
		refreshInterval: function() {
			return this.Auth.isPro ? 10000 : 300000;
		},

		defaults: {
			config: {
				title: "My Stocks",
				size: "small",
				stocks: ["NASDAQ:AAPL", "NASDAQ:FB", "NASDAQ:GOOG", "NASDAQ:NFLX", "NASDAQ:TSLA", "INDEXDJX:.DJI"]
			},
			data: {
				stocks: [
					{
						name: "Apple Inc.",
						ticker: "AAPL",
						exchange: "NASDAQ",
						value: "118.47",
						change: "-0.31",
						changePercent: "-0.26",
						changeDirection: "down",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Facebook Inc",
						ticker: "FB",
						exchange: "NASDAQ",
						value: "106.20",
						change: "-0.06",
						changePercent: "-0.06",
						changeDirection: "down",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Alphabet Inc",
						ticker: "GOOG",
						exchange: "NASDAQ",
						value: "738.82",
						change: "+0.41",
						changePercent: "0.06",
						changeDirection: "up",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Netflix, Inc.",
						ticker: "NFLX",
						exchange: "NASDAQ",
						value: "120.20",
						change: "-0.02",
						changePercent: "-0.02",
						changeDirection: "down",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Tesla Motors Inc",
						ticker: "TSLA",
						exchange: "NASDAQ",
						value: "221.94",
						change: "+0.14",
						changePercent: "0.06",
						changeDirection: "up",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Dow Jones Industrial Average",
						ticker: ".DJI",
						exchange: "INDEXDJX",
						value: "17,732.75",
						change: "-4.41",
						changePercent: "-0.02",
						changeDirection: "down",
						date: "Nov 19th 11:28 AM"
					}
				]
			}
		},

		autocomplete: function(val, cb) {
			$.getJSON("https://www.google.com/finance/match?matchtype=matchall&q=" + encodeURIComponent(val), function(d) {
				if (!d || !d.matches || !d.matches.length) {
					return cb([]);
				}

				cb(_(d.matches).map(function(e) {
					if (!e.e || !e.t) {
						return;
					}

					return {
						value: e.e + ":" + e.t,
						label: e.n + " (" + e.e + ":" + e.t + ")"
					};
				}).compact().take(5).value());
			});
		},


		initialize: function() {
			WidgetModel.prototype.initialize.call(this);

			if (this.config.symbol) {
				this.config.stocks = this.config.symbol.split(",").map(function(e) {
					return e.trim();
				});

				delete this.config.symbol;

				this.saveConfig();
			}
		},


		/**
		 * Loads chart data for the given period
		 *
		 * @param  {String}   ticker    The ticker
		 * @param  {String}   exchange  The exchange
		 * @param  {String}   period    The period to load data for, must be one of
		 *                              1d, 5d, 1m, 3m, 1y, 5y, or max
		 * @param  {Function} cb        The callback
		 */
		getChartData: function(ticker, exchange, period, cb) {
			if (period === "max") {
				period = "40y";
			}

			var intervals = {
				"1d": 300,
				"5d": 1800,
				"1m": 86400,
				"3m": 86400,
				"1y": 86400,
				"5y": 604800,
				"40y": 604800
			};

			var displayIntervals = {
				"1d": "hour",
				"5d": "day",
				"1m": "day",
				"3m": "month",
				"1y": "month",
				"5y": "year",
				"40y": "year"
			};

			$.ajax({
				type: "GET",
				url: "https://www.google.com/async/finance_chart_data?async=q:" + encodeURIComponent(ticker) +
					",x:" + encodeURIComponent(exchange) +
					",p:" + (period[1] === "d" ? period.toLowerCase() : period.toUpperCase()) +
					",i:" + intervals[period] +
					",ext:true,_fmt:json",
				success: function(d) {
					d = JSON.parse(JSON.parse(d.replace(")]}'", "").trim()).tnv.value);

					var ret = {
						times: d.t,
						values: d.v[0],
						interval: displayIntervals[period]
					};

					ret.start = (d.m && d.m.include && d.m.include.t1) || ret.times[0];
					ret.end = (d.m && d.m.include && d.m.include.t2) || ret.times[ret.times.length - 1];

					cb.call(this, ret);
				}.bind(this),
				dataType: "text"
			});
		},


		/**
		 * Retrieves news for a given stock ticker ID
		 *
		 * @param  {String}   id  The ID of the ticker to fetch news for
		 * @param  {Function} cb  The callback
		 */
		getNews: function(id, cb) {
			$.ajax({
				type: "GET",
				dataType: "text",
				url: "https://www.google.com/finance/kd?output=json&sort=date&keydevs=1&recnews=0&cid=" + id,
				success: function(d) {
					// We unfortunately need to eval the response to properly parse it
					//
					// This is no more or less safe than JSONP however, and the data is
					// coming via a secure connection with Google
					try {
						d = eval("(" + d + ")"); // jshint ignore:line
					}
					catch (e) {
						return;
					}

					if (!d || !d.clusters) {
						return;
					}

					cb(_(d.clusters).map(function(e) {
						e = e.a && e.a[0];

						if (!e) {
							return;
						}

						return {
							url: e.u,
							title: e.t,
							desc: e.sp,
							source: e.s,
							date: moment(e.tt * 1000).fromNow()
						};
					}).compact().take(10).value());
				}
			});
		},


		refresh: function() {
			var isDetail = this.get("state") === "detail",
				symbol = (this.config.stocks || ["NASDAG:GOOG"]).join(",");

			if (isDetail) {
				symbol = this.activeSymbol.join(":");

				if (this.Auth.isPro) {
					this.getChartData(this.activeSymbol[0], this.activeSymbol[1], this.chartPeriod || "1d", function(chartData) {
						if (isDetail && this.activeSymbol.join(":") === symbol) {
							this.trigger("chart:loaded", chartData);
						}
					});
				}
			}

			$.ajax({
				type: "GET",
				url: "https://finance.google.com/finance/info?infotype=infoquoteall&q=" + encodeURIComponent(symbol),
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

					var stocks = _.map(d, function(e) {
						return {
							id: e.id,
							name: e.name,
							ticker: e.t,
							exchange: e.e,

							value: e.el || e.l,
							change: e.ec || e.c,
							changePercent: e.ecp || e.cp,
							changeDirection: (e.ec || e.c).indexOf("-") !== 0 ? "up" : "down",
							date: moment(e.elt_dts || e.lt_dts || e.elt || e.lt).format("MMM Do h:mm A"),

							low: e.lo,
							high: e.hi,
							open: e.op,
							low52: e.lo52,
							high52: e.hi52,
							previousClose: parseFloat(e.pcls || e.pcls_fix).toLocaleString(),

							volume: e.vo,
							marketCap: e.mc,
							shares: e.shares,
							averageVolume: e.avvo,
							institutional: e.inst_own,

							beta: e.beta,
							earningsPerShare: e.eps,
							priceToEarnings: e.pe || ((e.el || e.l) / e.eps).toLocaleString(),
							extraInfo: e.s === "1" ? "Pre Market" : e.s === "2" ? "After Hours" : null
						};
					});

					if (isDetail && this.activeSymbol.join(":") === symbol) {
						this.trigger("stock:loaded", stocks[0]);
					}
					else if (!isDetail) {
						this.saveData({
							stocks: stocks
						});
					}
				}.bind(this),
				dataType: "text" // Google comments out the opening array tag so the JSON parser crashes
			});
		}
	});
});