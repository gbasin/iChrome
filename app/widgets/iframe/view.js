define(["widgets/views/main", "lib/parseurl"], function(WidgetView, parseUrl) {
	return WidgetView.extend({
		isFrame: true,

		onBeforeRender: function(data) {
			data.url = parseUrl(this.model.config.url);

			return data;
		},

		onRender: function() {
			this.el.style.height = (this.model.config.height || 400) + "px";

			this.$el.toggleClass("has-padding", this.model.config.padding === "true");
		}
	});
});