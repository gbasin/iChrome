/**
 * The main iChrome view, this initializes everything.
 */
define(["backbone", "core/css", "core/toolbar", "lib/extends"], function(Backbone, CSS, Toolbar) {
	var iChrome = Backbone.View.extend({
		el: "body",
		initialize: function(items) {
			this.css = new CSS();

			this.Toolbar = new Toolbar({
				el: this.$("header.toolbar")
			});

			this.$el.append(this.css.el);
		}
	});

	return new iChrome();
});