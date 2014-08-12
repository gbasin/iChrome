/*
 * The Traffic widget.
 */
define(["jquery"], function($) {
	return {
		id: 9,
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
				label: "I leave home at"
			},
			{
				type: "text",
				nicename: "home",
				label: "Home Address",
				placeholder: "The destination that should be used after work"
			},
			{
				type: "text",
				nicename: "work",
				label: "Work Address",
				placeholder: "The destination that should be used before work"
			},
			{
				type: "select",
				nicename: "mode",
				label: "Transit Method",
				options: {
					D: "Driving",
					W: "Walking",
					T: "Public Transit"
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
						
						data.home = (homed.routeResults[0].routes[0].routeLegs[0].summary.timeWithTraffic || homed.routeResults[0].routes[0].routeLegs[0].summary.time || 0);
						data.work = (workd.routeResults[0].routes[0].routeLegs[0].summary.timeWithTraffic || workd.routeResults[0].routes[0].routeLegs[0].summary.time || 0);

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
			var data = {};

			if (typeof dest == "string") {
				data.dest = dest;
			}
			else if (moment(this.config.time, "hh:mm").add("hours", 1).isAfter()) {
				data.dest = "work";
			}
			else {
				data.dest = "home";
			}

			var time = moment.duration(this.data[data.dest] || 0, "seconds"),
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
				if (this.elm.find(".dest").text().trim() == "to work") {
					this.render("home");
				}
				else {
					this.render("work");
				}
			}.bind(this));
		}
	};
});