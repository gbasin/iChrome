define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		isFrame: true,

		onBeforeRender: function(data) {
			data.url = "https://keep.google.com/u/" + (this.model.config.user || 0);

			return data;
		},

		onRender: function() {
			this.el.style.height = (this.model.config.height || 400) + "px";
		}
	});
});