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


			// var chartData = google.visualization.arrayToDataTable([
			// 	['Genre', 'Fantasy & Sci Fi', 'Romance', 'Mystery/Crime', 'General',
			// 	 'Western', 'Literature', { role: 'annotation' } ],
			// 	['2010', 10, 24, 20, 32, 18, 5, ''],
			// 	['2020', 16, 22, 23, 30, 16, 9, ''],
			// 	['2030', 28, 19, 29, 30, 12, 13, '']
			// ]);
		


			/*if (data.weekly) {
				var data = google.visualization.arrayToDataTable([
					['Week', 'This Week', 'Last Week'],
					['2013',  1000,      400],
					['2014',  1170,      460],
					['2015',  660,       1120],
					['2016',  1030,      540]
				  ]);
		  
				  var options = {
					title: 'This Week vs Last Week',
					hAxis: {},
					vAxis: {title: 'By Sessions',  titleTextStyle: {color: '#333'}, minValue: 0},
					animation: {
						startup: true,
						duration: 1000,
						easing: 'out',
					}
				  };
		  
				  var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
				  chart.draw(data, options);
				}*/

/*
			var data = new google.visualization.DataTable();
			data.addColumn('date', 'Date');
			data.addColumn('number', 'Kepler-22b mission');
			data.addColumn('string', 'Kepler title');
			data.addColumn('string', 'Kepler text');
			data.addColumn('number', 'Gliese 163 mission');
			data.addColumn('string', 'Gliese title');
			data.addColumn('string', 'Gliese text');
			data.addRows([
			  [new Date(2314, 2, 15), 12400, undefined, undefined,
									  10645, undefined, undefined],
			  [new Date(2314, 2, 16), 24045, 'Lalibertines', 'First encounter',
									  12374, undefined, undefined],
			  [new Date(2314, 2, 17), 35022, 'Lalibertines', 'They are very tall',
									  15766, 'Gallantors', 'First Encounter'],
			  [new Date(2314, 2, 18), 12284, 'Lalibertines', 'Attack on our crew!',
									  34334, 'Gallantors', 'Statement of shared principles'],
			  [new Date(2314, 2, 19), 8476, 'Lalibertines', 'Heavy casualties',
									  66467, 'Gallantors', 'Mysteries revealed'],
			  [new Date(2314, 2, 20), 0, 'Lalibertines', 'All crew lost',
									  79463, 'Gallantors', 'Omniscience achieved']
			]);
	
			var chart = new google.visualization.AnnotationChart(document.getElementById('chart_div'));
	
			var options = {
			  displayAnnotations: true,
			  tooltip: {isHtml: true}
			};
	
			chart.draw(data, options);		
*/
		}
	});
});