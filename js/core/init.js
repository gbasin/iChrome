/**
 * The main iChrome view, this initializes everything.
 */
define(["backbone", "core/css", "lib/extends"], function(Backbone, CSS) {
	var view = Backbone.View.extend({
		el: "body",
		initialize: function(items) {
			this.css = new CSS();

			this.$el.append(this.css.el);
		}
	});

	return new view();
});