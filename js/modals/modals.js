/**
 * This is the modal dialog base view.
 * 
 * Because it has so many methods of its own, it needs to be created and then have its element set as a base element for the actual modal content (i.e. the store).
 * 
 * See modals/updated for a simple usage example.
 */
define(["backbone"], function(Backbone) {
	var Modal = Backbone.View.extend({
		el: '<div class="modal" tabindex="-1"><div class="close"></div><div class="content"></div></div>',
		overlay: $('<div class="modal-overlay" tabindex="-1"></div>'),
		show: function() {
			this.mo.addClass("visible").end().focus();

			return this;
		},
		hide: function() {
			this.mo.removeClass("visible");

			return this;
		},
		close: function(e) { // This is an overridable close method that is called from event handlers, it lets the content intercept closes.
			return this.hide();
		},
		destroy: function() {
			this.mo.remove();

			this.stopListening();

			return this;
		},
		initialize: function() {
			// Set this.(modal + overlay = mo) shortcut
			this.mo = this.$el.add(this.overlay);


			// Construct an object of CSS properties based on the options passed
			var css = {};

			if (this.width)			css.width = this.width;
			if (this.height)		css.maxHeight = this.height;
			if (this.realHeight)	css.height = this.realHeight;

			this.$el.css(css);


			// Add any classes that have been defined
			if (this.classes) {
				this.$el.addClass(this.classes);
			}


			// If the modal is less than 700px wide, add a small class
			if (this.width && this.width <= 700) {
				this.$el.addClass("small");
			}


			// Attach close handlers
			this.overlay.add(this.$(".close")).on("click", this.close.bind(this));

			/*
				This isn't perfect since it relies on the modal having focus, but it should be pretty good.

				It can't be attached in "events" since it has to be triggered for both the modal and the overlay.
			*/
			this.mo.on("keydown", function(e) {
				if (e.keyCode == 27) {
					this.close(e);
				}
			}.bind(this));

			// This is used by most of the actual modals as their $el
			this.content = this.$(".content");
		}
	});

	return Modal;
});