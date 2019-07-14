define(["lodash", "widgets/views/main", "lib/gcloader"], function(_, WidgetView, GCLoader) {
	/*global google */
	return WidgetView.extend({
		events: {
			"click header .select .options li": function(e) {
				this.model.set("range", e.currentTarget.getAttribute("data-id"));

				this.render({
					loading: true
				});
			}
		},

		initialize: function() {
			WidgetView.prototype.initialize.call(this);

			GCLoader.load(this.render, this);
			this.listenTo(this.model, "data:loaded", this.render);
		},

		onBeforeRender: function(data, isPreview) {
			if (this.model.config.title) {
				data.title = this.model.config.title;
			}

			if (!this.model.config.profile && !isPreview) {
				data.noProfile = true;
			}

			data.cid = this.cid;

			if (isPreview) {
				data.common = {
					visits: 5605,
					pageviews: 15033,
					bounceRate: 12.57,
					completions: 4853,
					pagesVisit: 8.54
				};
			}

			var activeView = this.model.get("range");

			data.views = _.map({
				today: "Today",
				yesterday: "Yesterday",
				pastweek: "Past Week"
			}, function(e, k) {
				if (k === activeView) {
					data.activeView = e;
				}

				return {
					id: k,
					name: e,
					active: k === activeView
				};
			}, this);

			return data;
		},

		onRender: function(data) {
			if (!GCLoader.isLoaded() || data.empty) {
				return;
			}

			var chartData, options, chart;
			if (data.weekly) {
				chartData = google.visualization.arrayToDataTable(data.weekly.items);
				options = {
					title: 'This Week vs Last Week',
					hAxis: { slantedText: true },
					vAxis: {textPosition: 'in', title: 'By Sessions',  titleTextStyle: {color: '#333'}, minValue: 0},
					animation: {
						startup: true,
						duration: 1000,
						easing: 'out',
					},
					legend: {
						position: 'bottom'
					},
					chartArea: { width: '92%' },
				};
		  
				chart = new google.visualization.AreaChart(document.getElementById('weekly_charts' + this.cid));
				chart.draw(chartData, options);
			}

			if (data.yearly) {
				chartData = google.visualization.arrayToDataTable(data.yearly.items);
				options = {
					title: 'This Year vs Last Year',
					hAxis: { slantedText: true },
					vAxis: { textPosition: 'in', title: 'By Sessions',  titleTextStyle: { color: '#333' }, minValue: 0 },
					animation: {
						startup: true,
						duration: 1000,
						easing: 'out',
					},
					legend: {
						position: 'bottom'
					},
					chartArea: { width: '92%' }
				};
		  
				chart = new google.visualization.AreaChart(document.getElementById('yearly_charts' + this.cid));
				chart.draw(chartData, options);
			}
			

			if (data.channels) {
				chartData = google.visualization.arrayToDataTable(data.channels.items);
				options = {
					title: 'Traffic Channels',
					width: "100%",
					height: 400,
					chartArea: { width: '85%' },
					legend: { position: 'bottom' },
					bar: { groupWidth: '75%' },
					isStacked: true,
					hAxis: { slantedText: true },
					vAxis: { textPosition: 'in', title: 'By Sessions',  titleTextStyle: { color: '#333' }, minValue: 0 },
					animation: {
						startup: true,
						duration: 1000,
						easing: 'out',
					}
				};			
	
				chart = new google.visualization.ColumnChart(document.getElementById("channels_charts" + this.cid));
				chart.draw(chartData, options);
			}

		}
	});
});