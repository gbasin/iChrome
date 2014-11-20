/*
 * The Traffic widget.
 */
define(["jquery", "moment"], function($, moment) {
	return {
		id: 9,
		size: 1,
		order: 27,
		interval: 300000,
		nicename: "traffic",
		sizes: ["tiny", "small"],
		settings: [
			{
				type: "size"
			},
			{
				type: "time",
				nicename: "time",
				label: "i18n.settings.leave"
			},
			{
				type: "text",
				nicename: "home",
				label: "i18n.settings.home",
				placeholder: "i18n.settings.home_placeholder"
			},
			{
				type: "text",
				nicename: "work",
				label: "i18n.settings.work",
				placeholder: "i18n.settings.work_placeholder"
			},
			{
				type: "select",
				nicename: "mode",
				label: "i18n.settings.method",
				options: {
					D: "i18n.settings.method_options.driving",
					W: "i18n.settings.method_options.walking",
					T: "i18n.settings.method_options.transit"
				}
			}
		],
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
		},
		refresh: function() {
			$.get("http://www.bing.com/maps/directions.ashx?d=0~1&w=" + encodeURIComponent(this.config.work || "1600 Amphitheatre Pkwy, Mountain View, CA 94043") +
					"~" + encodeURIComponent(this.config.home || "1 Hacker Way, Menlo Park, CA 94025") + "&mode=" + (this.config.mode || "D"), function(hd) {
				$.get("http://www.bing.com/maps/directions.ashx?d=0~1&w=" + encodeURIComponent(this.config.home || "1 Hacker Way, Menlo Park, CA 94025") +
						"~" + encodeURIComponent(this.config.work || "1600 Amphitheatre Pkwy, Mountain View, CA 94043") + "&mode=" + (this.config.mode || "D"), function(wd) {
					var homed = JSON.parse(hd),
						workd = JSON.parse(wd),
						data = {
							home: 0,
							work: 0
						};


					if (homed.routeResults && workd.routeResults
						&& homed.routeResults[0] && workd.routeResults[0]
						&& homed.routeResults[0].routes && workd.routeResults[0].routes
						&& homed.routeResults[0].routes[0] && workd.routeResults[0].routes[0]
						&& homed.routeResults[0].routes[0].routeLegs && workd.routeResults[0].routes[0].routeLegs
						&& homed.routeResults[0].routes[0].routeLegs[0] && workd.routeResults[0].routes[0].routeLegs[0]
						&& homed.routeResults[0].routes[0].routeLegs[0].summary && workd.routeResults[0].routes[0].routeLegs[0].summary) {
						

						var homeSummary = homed.routeResults[0].routes[0].routeLegs[0].summary;

						if (homeSummary.timeWithTraffic && homeSummary.timeWithTraffic > 0) {
							data.home = homeSummary.timeWithTraffic;
						}
						else if (homeSummary.time && homeSummary.time > 0) {
							data.home = homeSummary.time;
						}


						var workSummary = workd.routeResults[0].routes[0].routeLegs[0].summary;

						if (workSummary.timeWithTraffic && workSummary.timeWithTraffic > 0) {
							data.work = workSummary.timeWithTraffic;
						}
						else if (workSummary.time && workSummary.time > 0) {
							data.work = homeSummary.time;
						}


						if (data.home && data.work) {
							this.data = data;

							this.render();

							this.utils.saveData(this.data);
						}
					}

					if (workd.resolvedWaypoints && workd.resolvedWaypoints[0]
						&& workd.resolvedWaypoints[0][0] && workd.resolvedWaypoints[0][0].address && workd.resolvedWaypoints[0][0].address.formattedAddress
						&& workd.resolvedWaypoints[0][1] && workd.resolvedWaypoints[0][1].address && workd.resolvedWaypoints[0][1].address.formattedAddress) {
						this.config.home = workd.resolvedWaypoints[0][0].address.formattedAddress;
						this.config.work = workd.resolvedWaypoints[0][1].address.formattedAddress;

						this.utils.saveConfig(this.config);
					}
				}.bind(this));
			}.bind(this));
		},
		render: function(dest) {
			if (typeof dest !== "string") {
				dest = moment(this.config.time, "hh:mm").add("hours", 1).isAfter() ? "work" : "home";
			}

			var data = {
				dest: this.utils.translate("to_" + dest)
			};

			var time = moment.duration(this.data[dest] || 0, "seconds"),
				hours = time.get("hours"),
				minutes = Math.round(time.asMinutes() % 60);

			if (this.config.size == "tiny") {
				data.time = (hours ? hours + ":" + minutes.pad() : minutes + " min" + (minutes !== 1 ? "s" : ""));
			}
			else {
				data.time = (hours > 0 ? hours : "");

				if (hours > 0 && hours !== 1) {
					data.time += "hours ";
				}
				else if (hours == 1) {
					data.time += "hour ";
				}

				if (minutes > 0) {
					data.time += minutes;
				}

				if (hours > 0) {
					data.time += " min";
				}
				else {
					data.time += " minute";
				}

				if (minutes !== 1) {
					data.time += "s";
				}
			}

			this.utils.render(data);

			this.elm.off("click.traffic").on("click.traffic", ".time, .dest", function() {
				if (this.elm.find(".dest").text().trim() == this.utils.translate("to_work")) {
					this.render("home");
				}
				else {
					this.render("work");
				}
			}.bind(this));
		}
	};
});