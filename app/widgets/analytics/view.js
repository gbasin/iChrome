define(["lodash", "widgets/views/main", "lib/gcloader"], function(_, WidgetView, GCLoader) {
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

			if (isPreview) {
				data.common = data.commonDefault;
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


			if (data.weekly) {
				var chartData = google.visualization.arrayToDataTable(data.weekly.items);
				var options = {
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
		  
				var chart = new google.visualization.AreaChart(document.getElementById('weekly_charts'));
				chart.draw(chartData, options);
			}

			if (data.yearly) {
				var chartData = google.visualization.arrayToDataTable(data.yearly.items);
				var options = {
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
		  
				var chart = new google.visualization.AreaChart(document.getElementById('yearly_charts'));
				chart.draw(chartData, options);
			}
			

			if (data.channels) {
				var chartData = google.visualization.arrayToDataTable(data.channels.items);

				var options = {
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
	
				var chart = new google.visualization.ColumnChart(document.getElementById("channels_charts"));
				chart.draw(chartData, options);
			}

		}
	});
});