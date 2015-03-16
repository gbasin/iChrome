/**
 * This handles the searchbox
 */
define(["backbone", "wikiwand", "storage/storage", "core/render", "core/analytics", "search/speech", "i18n/i18n"], function(Backbone, Wikiwand, Storage, render, Track, Speech, Translate) {
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
				"click .speech": "speech"
			},
			submit: function(val) {
				var searchURL = (this.model.get("search-url") || "https://www.google.com/search?q=%s"),
					link = document.createElement("a");

				link.setAttribute("href", searchURL.replace("%s", encodeURIComponent(val)));

				if (this.model.get("stab")) link.setAttribute("target", "_blank");

				link.click();
			},
			speech: function() {
				this.Speech.start();

				Track.event("Search", "Speech", "Start");
			},
			initialize: function() {
				this.model = new Model();

				this.Speech = new Speech();

				this.Speech.on("result", function(val) {
					Track.ga("send", {
						useBeacon: true,
						hitType: "pageview",
						title: "Voice Search: " + val,
						page: "/search/speech?q=" + encodeURIComponent(val),
						useBeacon: true
					});

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

				this.Wikiwand = new Wikiwand({
					cse: false,
					key: "slkjgops",
					autoFocus: true,
					container: this.$(".wikiwand")[0],
					noConnection: this.$("input.noConnection")[0],
					target: this.model.get("stab") ? "_blank" : "_top",
					placeholder: Translate(this.model.get("ok") ? "toolbar.placeholder_ok" : "toolbar.placeholder")
				});

				return this;
			}
		});

	return View;
});