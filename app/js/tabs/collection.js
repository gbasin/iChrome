/**
 * The tabs model/controller. This actually creates the tabs and handles things like nav and storage.
 */
define(["lodash", "jquery", "backbone", "backbone.viewcollection", "tabs/model", "tabs/view"], function(_, $, Backbone, ViewCollection, Model, View) {
	var Tabs = ViewCollection.extend({
		model: Model,
		view: View,

		initialize: function() {
			this.on("views:change", this.navigate, this);


			// The defaults are set by the tabs model since it has access to storage
			this.model = Model.extend({
				defaults: function() {
					return this.defaults;
				}.bind(this)
			});
		},


		/**
		 * Makes a tab active
		 *
		 * @api   private
		 * @param {Backbone.View|Number} tab The tab or tab index to activate
		 */
		setActive: function(tab) {
			if (typeof tab === "number") {
				tab = this.views[tab];
			}

			if (this.indexOf(tab.model) === this.active && tab.$el.hasClass("active")) {
				return;
			}


			tab.$el.addClass("active");

			this.active = this.indexOf(tab.model);

			tab.trigger("displayed");

			$(_(this.views).without(tab).pluck("el").valueOf()).removeClass("active");

			this.trigger("navigate", this.active, tab, tab.model);
		},


		/**
		 * Navigates to a tab
		 *
		 * @api    public
		 * @param  {String|Number} [to] The tab to navigate to, either as an index, next, prev, first or last.
		 * @return {Number}           The index of the tab navigated to
		 */
		navigate: function(to) {
			var i = ((this.active + 1) || this.default || 1) - 1;

			if (typeof to === "number") {
				i = to - 1;
			}
			else if (typeof to === "string") {
				switch (to) {
					case "next":
						i++;
					break;
					case "prev":
						i--;
					break;
					case "first":
						i = 1;
					break;
					case "last":
						i = this.views.length;
					break;
				}
			}

			// This makes numbers larger or smaller than the number of views wrap around
			i %= this.views.length;

			// This takes i = -4 and turns it into (views.length = 6) + (-4) = 2
			if (i < 0) {
				i += this.views.length;
			}

			this.setActive(this.views[i]);

			// This turns i one/id-based
			return i + 1;
		}
	});

	return Tabs;
});