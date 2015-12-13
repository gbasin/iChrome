define(["moment", "widgets/views/main"], function(moment, WidgetView) {
	return WidgetView.extend({
		events: {
			"click .dest": function(e) {
				e.preventDefault();

				this._dest = this._dest === "work" ? "home" : "work";

				this.render();
			}
		},

		onBeforeRender: function(data) {
			this._dest = this._dest || (moment(this.model.config.time, "hh:mm").add(1, "hours").isAfter() ? "work" : "home");

			data.dest = this.translate("to_" + this._dest);
			data.toEnc = encodeURIComponent(this.model.config[this._dest]);
			data.fromEnc = encodeURIComponent(this.model.config[this._dest === "work" ? "home" : "work"]);

			var time = moment.duration(data[this._dest] || 0, "seconds"),
				hours = time.get("hours"),
				minutes = Math.round(time.asMinutes() % 60);

			if (this.model.get("size") === "tiny") {
				data.time = (hours ? hours + "h " + minutes + "m" : minutes + " min" + (minutes !== 1 ? "s" : ""));
			}
			else {
				data.time = (hours > 0 ? hours : "");

				if (hours > 0 && hours !== 1) {
					data.time += "hours ";
				}
				else if (hours === 1) {
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

			return data;
		}
	});
});