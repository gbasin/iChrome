define(["lodash", "jquery", "widgets/model"], function(_, $, WidgetModel) {
	return WidgetModel.extend({
		refreshInterval: 300000,

		defaults: {
			config: {
				time: "09:00",
				home: "1 Hacker Way, Menlo Park, CA 94025",
				work: "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
				mode: "D",
				size: "small"
			},
			data: {
				home: 653,
				work: 542
			}
		},

		refresh: function() {
			var homeURL = "https://www.bing.com/maps/directions.ashx?d=0~1&w=" + encodeURIComponent(this.config.work || this.defaults.config.work) +
					"~" + encodeURIComponent(this.config.home || this.defaults.config.home) + "&mode=" + (this.config.mode || this.defaults.config.mode);

			var workURL = "https://www.bing.com/maps/directions.ashx?d=0~1&w=" + encodeURIComponent(this.config.home || this.defaults.config.home) +
						"~" + encodeURIComponent(this.config.work || this.defaults.config.work) + "&mode=" + (this.config.mode || this.defaults.config.mode);

			$.when($.getJSON(homeURL), $.getJSON(workURL)).then(function(homeResp, workResp) {
				var homeData = homeResp[0],
					workData = workResp[0];

				var data = {
					home: 0,
					work: 0
				};

				// We use a trycatch instead of existence checks because they get extremely long
				try {
					var homeSummary = homeData.routeResults[0].routes[0].routeLegs[0].summary;

					data.home = homeSummary.timeWithTraffic || homeSummary.time || 0;


					var workSummary = workData.routeResults[0].routes[0].routeLegs[0].summary;

					data.work = workSummary.timeWithTraffic || workSummary.time || 0;


					if (data.home && data.work) {
						this.saveData(data);
					}
				}
				catch (e) {}

				try {
					this.config.home = workData.resolvedWaypoints[0][0].address.formattedAddress;
					this.config.work = workData.resolvedWaypoints[0][1].address.formattedAddress;

					this.saveConfig();
				}
				catch (e) {}
			}.bind(this));
		}
	});
});