define(["lodash", "jquery", "moment", "./lib/chart", "widgets/views/main"], function(_, $, moment, Chart, WidgetView) {
	var displayFormats = {
		hour: "LT",
		day: "MMM D",
		month: "MMM YYYY",
		year: "YYYY"
	};

	// We create a custom scale type so we can control the spacing of labels
	var defaultConfig = {
		position: "bottom",

		time: {
			unit: false,
			round: false,
			format: false,
			displayFormat: false
		}
	};

	var StocksScale = Chart.scaleService.constructors.time.extend({
		/**
		 * This is a simplified version of the time scale's buildTicks function,
		 * removing a number of now-extraneous checks and making the number of
		 * ticks a fixed number.
		 */
		buildTicks: function() {
			this.ticks = [];


			var scaleLabelMoments = _.map(this.data.labels, this.parseTime, this);

			this.firstTick = this.parseTime(this.options.time.min || scaleLabelMoments[0]).clone();

			this.lastTick = this.parseTime(this.options.time.max || scaleLabelMoments[scaleLabelMoments.length - 1]).clone();

			this.labelMoments = _.map(this.data.datasets, function() {
				return scaleLabelMoments;
			});


			this.tickUnit = this.options.time.unit || "day";
			this.displayFormat = this.options.time.displayUnit;
			this.tickRange = Math.ceil(this.lastTick.diff(this.firstTick, this.tickUnit, true));


			this.smallestLabelSeparation = this.width;

			_.each(this.data.datasets, function(dataset, datasetIndex) {
				for (var i = 1; i < this.labelMoments[datasetIndex].length; i++) {
					this.smallestLabelSeparation = Math.min(this.smallestLabelSeparation, this.labelMoments[datasetIndex][i].diff(this.labelMoments[datasetIndex][i - 1], this.tickUnit, true));
				}
			}, this);


			// This is the key difference in the function. If we're showing more than 8 hours
			// of data generate 6 ticks, otherwise generate four.
			var numTicks = this.lastTick.diff(this.firstTick, "hours", true) > 8 ? 6 : 4;

			this.ticks = _.map(_.range(numTicks), function(i) {
				return this.firstTick.clone().add(((this.tickRange / numTicks) * i) + 1, this.tickUnit);
			}, this);
		}
	});

	Chart.scaleService.registerScaleType("stocksScale", StocksScale, defaultConfig);


	return WidgetView.extend({
		getTemplate: function() {
			return this.widget.templates.detail;
		},

		events: {
			"click header button.back": function() {
				this.model.set("state", "default");
			},

			"click header .tabs li": function(e) {
				if (!this.Auth.isPro) {
					$(e.currentTarget).addClass("active").siblings().removeClass("active");

					return;
				}

				if (e.currentTarget.getAttribute("data-id") === "overview") {
					clearInterval(this.newsInterval);

					this.off("before:destroy");

					this.state = "overview";

					this.render(this.stock);

					this.createChart();
				}
				else {
					this.state = "news";

					var loadNews = this.model.getNews.bind(this, this.stock.ticker, function(news) {
						this.render(_.assign({}, this.stock, {
							items: news
						}));
					}.bind(this));

					this.newsInterval = setInterval(loadNews, 120000);

					this.on("before:destroy", function() {
						clearInterval(this.newsInterval);
					});

					loadNews();
				}
			},

			"click .chart .picker li": function(e) {
				var elm = $(e.currentTarget);

				elm.addClass("active").siblings().removeClass("active");

				this.model.chartPeriod = elm.attr("data-value");

				this.model.refresh();
			}
		},


		initialize: function() {
			this.listenTo(this.model, "chart:loaded", function(data) {
				this.chartData = data;

				this.updateChart();
			});

			this.listenTo(this.model, "stock:loaded", function(stock) {
				this.stock = stock;

				this.updateData();
			});

			this.state = "overview";

			this.stock = _.find(this.model.data.stocks, {
				ticker: this.model.activeTicker
			});

			this.render(this.stock);
		},


		/**
		 * Updates the data stock data
		 */
		updateData: function() {
			var stock = this.stock;

			this.$("header .price")
				.children(".current").text(this.stock.value).end()
				.children(".change").text(this.stock.change + " (" + this.stock.changePercent + "%)");

			this.$(".details div span.value").each(function() {
				this.textContent = stock[this.getAttribute("data-field")];
			});
		},


		/**
		 * Updates the chart
		 */
		updateChart: function() {
			var data = this.chartData;

			if (!this.chart) {
				return this.createChart(data);
			}

			this.chart.data.labels = data.times;

			this.chart.data.datasets[0].data = data.values;

			this.chart.options.scales.xAxes[0].time.min = data.start;
			this.chart.options.scales.xAxes[0].time.max = data.end;

			this.chart.options.scales.xAxes[0].time.unit = data.interval || "hour";
			this.chart.options.scales.xAxes[0].time.displayFormat = displayFormats[data.interval || "hour"];

			this.chart.update();
		},


		/**
		 * Creates the chart
		 */
		createChart: function() {
			var data = this.chartData;

			var canvas = this.$(".chart canvas");

			if (!canvas.length) {
				return;
			}

			var tipElm = this.$(".chart .tooltip");

			this.chart = new Chart(canvas, {
				type: "line",
				data: {
					labels: data.times,
					datasets: [
						{
							fill: false,
							label: "Price",
							borderWidth: 2,
							data: data.values,
							borderColor: "#4184F3",
							pointHoverBorderWidth: 4,
							pointHoverBorderColor: "#4184F3",
							pointBorderColor: "rgba(0, 0, 0, 0)",
							pointHoverBackgroundColor: "#4184F3",
							pointBackgroundColor: "rgba(0, 0, 0, 0)",
						}
					]
				},
				options: {
					animation: {
						duration: 0
					},

					hover: {
						mode: "label",

						// This is a bit hacky, but it ensures that the hovered point is the same as the one
						// the tooltip is shown for, and that there's only ever one
						onHover: function() {
							this.active = this.tooltipActive = this.active.length ? [this.active[0]] : [];
						}
					},

					tooltips: {
						mode: "label",
						enabled: false,
						callbacks: {
							title: function(tooltipItems) {
								return tooltipItems && tooltipItems[0] && tooltipItems[0].yLabel;
							},
							label: function(tooltipItem) {
								return tooltipItem.xLabel;
							}
						},
						custom: function(tooltip) {
							if (!tipElm[0]) {
								this.$(".chart").append('<div class="tooltip"><span class="price"></span><span class="time"></span><span class="date"></span></div>');

								tipElm = this.$(".chart .tooltip");
							}

							if (!tooltip.opacity) {
								return tipElm.removeClass("visible");
							}

							if (tooltip.body) {
								var date = moment(parseInt(tooltip.body[0]));

								tipElm
									.find(".price").text(tooltip.title.toLocaleString())
									.next(".time").text(date.format("LT"))
									.next(".date").text(date.format("MMM Do, YYYY"));
							}

							// We move the tooltip to the right if anything in the first 150 pixels
							// is being hovered over
							tipElm.addClass("visible").toggleClass("right", tooltip.x < 150);
						}.bind(this)
					},

					elements: {
						line: {
							tension: 0.1
						}
					},

					scales: {
						xAxes: [{
							type: "stocksScale",
							time: {
								unit: data.interval || "hour",
								displayFormat: displayFormats[data.interval || "hour"],

								min: data.start,
								max: data.end,

								format: function (e) {
									return moment.utc(new Date(e));
								}
							},
							gridLines: {
								show: true,
								drawTicks: false,
								offsetGridLines: false,
								color: "rgba(0, 0, 0, 0)",
								zeroLineColor: "rgba(0, 0, 0, 0)"
							},
							ticks: {
								fontSize: 11,
								fontColor: "#AAA",
								fontFamily: "Roboto, sans-serif"
							}
						}],
						yAxes: [{
							type: "linear",
							gridLines: {
								offsetGridLines: true
							},
							ticks: {
								fontSize: 11,
								fontColor: "#AAA",
								fontFamily: "Roboto, sans-serif",
								callback: function(value) {
									// We need to pad the values so they don't get cut off
									return "  " + value.toLocaleString();
								}
							}
						}]
					}
				}
			});
		},

		onBeforeRender: function(data) {
			if (this.chart) {
				this.chart.destroy();

				delete this.chart;
			}

			if (this.Auth.isPro) {
				data[this.state] = true;
			}
			else {
				data.proSplash = true;
			}

			return data;
		}
	});
});