define(["./view"], function(MainView) {
	return MainView.extend({
		onRender: function() {
			this.$el.toggleClass("has-padding", this.model.config.padding === "true");
		}
	});
});