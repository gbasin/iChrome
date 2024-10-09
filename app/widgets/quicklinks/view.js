define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		onBeforeRender: function(data) {
			if (this.model.config.title) {
				data.title = this.model.config.title;
			}

			if (this.model.config.view) {
				data.view = this.model.config.view;
			}

			return data;
		}
	});
});