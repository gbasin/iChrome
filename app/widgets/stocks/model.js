define(["jquery", "lodash", "widgets/model", "moment"], function($, _, WidgetModel, moment) {
	return WidgetModel.extend({
		widgetClassname: "tabbed-corner nomax",

		pro_tooltip: "stocks",

		refreshInterval: function() {
			return this.Auth.isPro ? 10000 : 300000;
		},

		defaults: {
			config: {
				title: "My Stocks",
				size: "small",
				stocks: ["AAPL", "META", "GOOG", "NFLX", "TSLA", "^DJI"],
				regularinpost: "1"
			},
			data: {
				stocks: [
					{
						name: "Apple Inc.",
						ticker: "AAPL",
						exchange: "NasdaqGS",
						value: "0.00",
						change: "+0.00",
						changePercent: "0.00",
						changeDirection: "up",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Facebook Inc",
						ticker: "META",
						exchange: "NasdaqGS",
						value: "0.00",
						change: "+0.00",
						changePercent: "0.00",
						changeDirection: "up",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Alphabet Inc",
						ticker: "GOOG",
						exchange: "NasdaqGS",
						value: "0.00",
						change: "+0.00",
						changePercent: "0.00",
						changeDirection: "up",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Netflix, Inc.",
						ticker: "NFLX",
						exchange: "NasdaqGS",
						value: "0.00",
						change: "+0.00",
						changePercent: "0.00",
						changeDirection: "up",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Tesla Motors Inc",
						ticker: "TSLA",
						exchange: "NasdaqGS",
						value: "0.00",
						change: "+0.00",
						changePercent: "0.00",
						changeDirection: "up",
						date: "Nov 19th 11:00 AM"
					},
					{
						name: "Dow Jones Industrial Average",
						ticker: "^DJI",
						exchange: "DJI",
						value: "0.00",
						change: "+0.00",
						changePercent: "0.00",
						changeDirection: "up",
						date: "Nov 19th 11:28 AM"
					}
				]
			}
		},

		autocomplete: function(val, cb) {
			$.getJSON("https://s.yimg.com/xb/v6/finance/autocomplete?nresults=5&output=json&lang=en-US&query=" + encodeURIComponent(val), function(d) {
				cb(_.map(d.ResultSet.Result, function(e) {
					return {
						value: e.symbol,
						label: e.name + " (" + e.symbol + ")"
					};
				}));
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
				"1d": "5m",
				"5d": "30m",
				"1mo": "1d",
				"3mo": "1d",
				"1y": "1d",
				"5y": "1wk",
				"40y": "1wk"
			};

			var displayIntervals = {
				"1d": "hour",
				"5d": "day",
				"1mo": "day",
				"3mo": "month",
				"1y": "month",
				"5y": "year",
				"40y": "year"
			};

			$.ajax({
				type: "GET",
				url: "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(ticker) + "?" +
					"range=" + period +
					"&interval=" + intervals[period] +
					"&includePrePost=false",
				dataType: "json",
				success: function(d) {
					var ret = {
						times: _.map(d.chart.result[0].timestamp, function(e) { return e * 1000; }),
						values: d.chart.result[0].indicators.quote[0].close,
						interval: displayIntervals[period]
					};

					ret.start = ret.times[0];
					ret.end = ret.times[ret.times.length - 1];

					cb.call(this, ret);
				}.bind(this)
			});
		},


		/**
		 * Retrieves news for a given stock ticker
		 *
		 * @param  {String}   ticker  The ticker to fetch news for
		 * @param  {Function} cb  The callback
		 */
		getNews: function(ticker, cb) {
			$.ajax({
				type: "GET",
				dataType: "xml",
				url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=" + ticker + "&region=US&lang=en-US",
				success: function(d) {
					const items = [];
					try {
						const itemNodes = d.querySelectorAll('item');
						if (itemNodes) {
							itemNodes.forEach((item) => {
								const getTextContent = (element, selector) => {
									const match = element.querySelector(selector);
									return match ? match.textContent : undefined;
								};								
								
								const itemTitle = getTextContent(item, "title");
								const itemLink = getTextContent(item, "link");
								//const itemGuid = getTextContent(item, "guid");
								const itemDescription = getTextContent(item, "description");
								var itemPubDate = getTextContent(item, "pubDate");
								try {
									itemPubDate = new Date(itemPubDate).toLocaleString(undefined, { timeZoneName: 'short' });
								}
								catch(e1) {}

								items.push({
									url: itemLink,
									title: itemTitle,
									desc: itemDescription,
									source: '',
									date: itemPubDate
								});
							});						
						}
					}
					catch (e) {
					}

					cb(items);
				},
				error: {
				}

			});
		},


		refresh: function() {
			var isDetail = this.get("state") === "detail",
			ticker = (this.config.stocks || ["GOOG"]).map(function(e) { return e.split(":").pop(); }).join(",");

			if (isDetail) {
				ticker = this.activeTicker;

				if (this.Auth.isPro) {
					this.getChartData(this.activeTicker, "", this.chartPeriod || "1d", function(chartData) {
						if (isDetail && this.activeTicker === ticker) {
							this.trigger("chart:loaded", chartData);
						}
					});
				}
			}

			var setError = function() {
				this.data.error = 1;
				this.saveData();
			}.bind(this);

      var parseQuotes = function(d)	{
				if (typeof d !== "object") {
					try {
						d = JSON.parse(d);
					}
					catch (e) {
						return;
					}
				}

				if (!d.quoteResponse || !d.quoteResponse.result || d.quoteResponse.error) {
					return;
				}

				var stocks = _.map(d.quoteResponse.result, function(e) {
					var marketType = "regularMarket";

					var getClosingPrice = function(e) {
						if (this.config.regularinpost !== "1") { return null; }
						return !e.regularMarketPrice ? null : e.regularMarketPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
					}.bind(this);

					var closingPrice = null;
					if ((!e.regularMarketTime || !e.regularMarketPrice || e.preMarketTime > e.regularMarketTime) && e.preMarketPrice) {
						marketType = "preMarket";
						closingPrice = getClosingPrice(e);
					}
					else if ((!e.regularMarketTime || !e.regularMarketPrice || e.postMarketTime > e.regularMarketTime) && e.postMarketPrice) {
						marketType = "postMarket";
						closingPrice = getClosingPrice(e);
					}

					return {
						name: e.shortName,
						ticker: e.symbol,
						exchange: e.fullExchangeName,

						closingPrice: closingPrice,

						value: (e[marketType + "Price"] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
						change: (e[marketType + "Change"] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
						changePercent: (e[marketType + "ChangePercent"] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }),
						changeDirection: (e[marketType + "Change"] || 0) > 0 ? "up" : "down",
						date: moment((e[marketType + "Time"] || 0) * 1000).format("MMM Do h:mm A"),

						low: (e.regularMarketDayLow || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
						high: (e.regularMarketDayHigh || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
						open: (e.regularMarketOpen || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
						low52: (e.fiftyTwoWeekLow || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
						high52: (e.fiftyTwoWeekHigh || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
						previousClose: (e.regularMarketPreviousClose || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),

						volume: (e.regularMarketVolume || 0).toLocaleString(),
						marketCap: (e.marketCap || 0).toLocaleString(),
						shares: (e.sharesOutstanding || 0).toLocaleString(),
						averageVolume: (e.averageDailyVolume3Month || 0).toLocaleString(),

						earningsPerShare: (e.epsTrailingTwelveMonths || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
						priceToEarnings: (e.trailingPE || 0).toLocaleString(),
						extraInfo: marketType === "preMarket" ? "Pre Market" : marketType === "postMarket" ? "After Hours" : null
					};
				}.bind(this));

				if (isDetail && this.activeTicker === ticker) {
					this.trigger("stock:loaded", stocks[0]);
				}
				else if (!isDetail) {
					this.data.error = 0;
					this.saveData({
						stocks: stocks
					});
				}
			}.bind(this);

			var url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + encodeURIComponent(ticker) + "&fields=" + [
				"symbol", "shortName", "regularMarketPrice", "regularMarketChangePercent",
				"regularMarketChange", "regularMarketVolume", "regularMarketDayLow", "regularMarketDayHigh", "fiftyTwoWeekLow", "fiftyTwoWeekHigh",
				"regularMarketOpen", "regularMarketPreviousClose", "preMarketPrice", "preMarketChangePercent", "preMarketTime", "postMarketPrice",
				"preMarketChange", "postMarketTime", "postMarketChange", "postMarketChangePercent", "epsTrailingTwelveMonths", "trailingPE", "marketCap",
				"averageDailyVolume3Month"
			].join(",");

			function convertUnicodeToCharacters(unicodeText) {
				const regex = /\\u([\dA-Fa-f]{4})/g;
				const normalText = unicodeText.replace(regex, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
				return normalText;
			}
			
			var crumb = convertUnicodeToCharacters(this.config.crumb || "");
			
			$.ajax({
				type: "GET",
				url: url + "&crumb=" + crumb,
				dataType: "json",
				success: function(d) {
					parseQuotes(d);
				}.bind(this),
					error: function (d) {
						if (d.status !== 401) {
							console.log("Error: Failed to call Y API", d);
							setError();
							return;							
						}

						var request = function() {
							$.ajax({
								type: "GET",
								url: "https://finance.yahoo.com/quote/AAPL?p=AAPL&.tsrc=fin-srch",
								dataType: "text",
								success: function (httpPageText) {
									const match = httpPageText.match(/"crumb":\s*"([^"]+)"/);
									if (match && match[1]) {
										var updatedCrumb = match[1];

										this.config.crumb = convertUnicodeToCharacters(updatedCrumb);
										this.saveData();

										$.ajax({
											type: "GET",
											url: url + "&crumb=" + updatedCrumb,
											dataType: "json",
											success: function (retryResponse) {
												parseQuotes(retryResponse);
											},
											error: function (error) {
												setError();
												console.log("Error: Failed to make retry request for " + updatedCrumb, error);
											}
										});
									} else {
										setError();
										console.log("Error find crumb");
									}
								}.bind(this),
								error: function (error) {
									setError();
									console.log("Error: Failed to fetch crumb page", error);
								}
							});
						}.bind(this);

						if (this.oldIframe) {
							request();
							return;
						}

						const iframe = document.createElement("iframe");
						iframe.src = "https://finance.yahoo.com/quote/AAPL?p=AAPL&.tsrc=fin-srch";
						iframe.style.display = "none";
						document.body.appendChild(iframe);
						this.oldIframe = iframe;
						iframe.onload = function () {
							request();
							return;
						};
					}.bind(this)
			});
		},

	});
});