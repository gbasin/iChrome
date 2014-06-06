/**
 * Status logger and profiler
 */
define(["moment"], function(moment) {
	var first = 0,
		last = 0,
		logs = {
			info: [],
			error: [],
			status: []
		};

	return {
		get: function(which) {
			logs[which || "status"].forEach(function(e, i) {
				console.log(moment(e[0]).toISOString().replace("T", " ").replace("Z", "") + "\t\t\t\t" + e[1]);
			});

			return logs[which || "status"];
		},
		mark: function() {
			last = new Date().getTime();
		},
		getTime: function() {
			return (last || logs.status[logs.status.length - 1][0]) - first;
		},
		log: function(msg) {
			logs.status.push([new Date().getTime(), msg]);

			if (!first) {
				first = new Date().getTime();
			}
		},
		error: function(msg) {
			var length = logs.error.length;

			logs.error.push([new Date().getTime(), msg]);

			console.log("There" + (length == 0 ? " is " : " are ") + length + " errors in the log.");
		},
		info: function(msg) {
			logs.info.push([new Date().getTime(), msg]);
		}
	};
});