define(["lodash", "widgets/views/main", "moment"], function(_, WidgetView, moment) {
	return WidgetView.extend({
		onBeforeRender: function(data, demo) {
			data.files = _.map(data.files, function(e, i) {
				// A clone inside the loop is faster than a deep clone of the
				// entire data object
				e = _.clone(e);

				var date = moment(e.date);

				if (moment().diff(date, "days") > 7) {
					e.modified = date.format("MMMM Do YYYY") + " " + this.translate("modified_by") + " " + e.user;
				}
				else {
					e.modified = date.calendar() + " " + this.translate("modified_by") + " " + e.user;
				}

				return e;
			}, this);

			if (this.model.config.title) {
				data.title = this.model.config.title;
			}

			return data;
		}
	});
});