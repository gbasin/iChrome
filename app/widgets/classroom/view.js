define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		isFrame: true,

		onBeforeRender: function(data) {
			data.url = "https://classroom.google.com/u/" + (this.model.config.user || 0) + (this.model.config.mode === "teacher" ? "/ta/not-reviewed/all" : "/a/not-turned-in/all");

			return data;
		},

		onRender: function() {
			this.el.style.height = "450px";
		}
	});
});