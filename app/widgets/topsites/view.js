define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		onBeforeRender: function(data) {
			if (this.model.config.title) {
				data.title = this.model.config.title;
			}

			data.newTab = this.model.config.target === "_blank";

			return data;
		}
	});
});