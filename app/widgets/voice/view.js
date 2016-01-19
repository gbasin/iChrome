define(["widgets/views/main"], function(WidgetView) {
	return WidgetView.extend({
		onBeforeRender: function(data) {
			data.user = this.model.config.user || 0;

			return data;
		}
	});
});