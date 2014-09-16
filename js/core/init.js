/**
 * The main iChrome view, this initializes everything.
 */
define(["lodash", "backbone", "core/css", "core/toolbar", "tabs/tabs", "modals/updated", "modals/getting-started", "lib/extends"], function(_, Backbone, CSS, Toolbar, Tabs) {
	var iChrome = Backbone.View.extend({
		el: "body",
		initialize: function() {
			this.css = new CSS();

			var toolbar = this.Toolbar = new Toolbar({
				el: this.$("header.toolbar")
			}, function() {
				tabs.navigate.apply(tabs, arguments);
			});

			var tabs = this.Tabs = new Tabs({
				el: this.$(".tab-container")
			}, function() {
				toolbar.navigate.apply(toolbar, arguments);
			});

			this.$el.append(this.css.el);
		}
	});

	return new iChrome();
});