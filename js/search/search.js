/**
 * This handles the searchbox
 */
define(["backbone", "storage/storage", "core/templates", "search/suggestions", "search/speech"], function(Backbone, Storage, render, Suggestions, Speech) {
	var Model = Backbone.Model.extend({
			init: function() {
				Storage.on("done updated", function(storage) {
					this.set(storage.settings);
				}, this);
			}
		}),
		View = Backbone.View.extend({
			tagName: "div",
			className: "search",
			events: {
				"input input":		"change",
				"click button":		"submit",
				"click .speech":	"speech", // Backbone doesn't handle nested methods so this needs to be proxied
				"keydown input":	"keydown",
				"focusin input":	function(e) { this.change(e, "focusin"); },
				"focusout input":	function(e) { this.change(e, "focusout"); }
			},
			keydown: function(e) {
				if ([13, 38, 40].indexOf(e.which) !== -1) {
					e.preventDefault();
				}

				if (e.which == 13) {
					this.submit();
				}
				else if (e.which == 38) {
					this.Suggestions.setFocus("prev");
				}
				else if (e.which == 40) {
					this.Suggestions.setFocus("next");
				}
			},
			change: function(e, w) {
				var val = e.currentTarget.value.trim();

				if (val !== "" && w !== "focusout") {
					this.Suggestions.load(val);

					if (this.model.get("toolbar")) {
						this.trigger("typing:start");
					}
				}
				else if (!w || (w == "focusout")) { // If either w (which) isn't set or w is focusout; if w is not focusin
					this.Suggestions.hide();

					if (this.model.get("toolbar")) {
						this.trigger("typing:end");
					}
				}
			},
			submit: function(val) {
				if (typeof val !== "string") {
					val = this.$("input").val().trim();
				}

				var searchURL = (this.model.get("search-url") || "https://www.google.com/search?q=%s"),
					link = document.createElement("a");

				if (val == "amazon" || val == "amazon.com") {
					link.setAttribute("href", "http://www.amazon.com/?tag=ichrome0e-20");

					//_gaq.push(["_trackEvent", "Amazon", "General"]);
				}
				else if (val.indexOf("amazon ") == 0) {
					link.setAttribute("href", "http://www.amazon.com/s/?field-keywords=" + encodeURIComponent(val.slice(7)) + "&tag=ichrome0e-20");

					//_gaq.push(["_trackEvent", "Amazon", "Search"]);
				}
				else {
					link.setAttribute("href", searchURL.replace("%s", encodeURIComponent(val)));
				}

				if (this.model.get("stab")) link.setAttribute("target", "_blank");

				link.click();
			},
			speech: function() {
				this.Speech.start();
			},
			initialize: function() {
				this.model = new Model();

				this.Speech = new Speech();

				this.Suggestions = new Suggestions();

				// This is attached to both select and focuschange since searches won't happen instantly and it's good for users to see what they've selected
				this.Suggestions.on("select focuschange", function(val) {
					this.$("input").val(val);
				}, this).on("select", function(val) {
					this.submit(val);
				}, this);

				this.Speech.on("result", function(val) {
					this.submit(val);
				}, this);

				this.model.on("change:ok change:voice", this.render, this).init();
			},
			render: function() {
				this.$el
					.html(
						render("search", {
							ok: this.model.get("ok"),
							voice: this.model.get("voice")
						})
					);

				this.Suggestions.setElement(this.$(".suggestions"));

				return this;
			}
		});

	return View;
});