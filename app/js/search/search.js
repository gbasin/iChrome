/**
 * This handles the searchbox
 */
define([
	"backbone", "browser/api", "storage/storage", "core/render", "core/analytics", "search/suggestions", "search/speech"
], function(Backbone, Browser, Storage, render, Track, Suggestions, Speech) {
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
				"click .speech":	"speech", // Backbone doesn't handle nested methods so this needs to be proxied
				"keydown input":	"keydown",
				"focusin input":	function(e) { this.change(e, "focusin"); },
				"focusout input":	function(e) { this.change(e, "focusout"); }
			},
			keydown: function(e) {
				if ([13, 38, 40].indexOf(e.which) !== -1) {
					e.preventDefault();
				}

				if (e.which === 13) {
					this.submit();
				}
				else if (e.which === 38) {
					this.Suggestions.setFocus("prev");

					Track.event("Search", "Suggestions", "Key Prev");
				}
				else if (e.which === 40) {
					this.Suggestions.setFocus("next");

					Track.event("Search", "Suggestions", "Key Next");
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
				else if (!w || (w === "focusout")) { // If either w (which) isn't set or w is focusout; if w is not focusin
					this.Suggestions.hide();

					if (this.model.get("toolbar")) {
						this.trigger("typing:end");
					}
				}
			},
			submit: function(val, speech) {
				var newTab = this.model.get("searchInNewTab");

				if (typeof val !== "string") {
					val = this.$("input").val().trim();
				}


				var queryURL = this.Suggestions.isURL(val);

				if (queryURL && (queryURL.indexOf("chrome:") === 0 || queryURL.indexOf("about:"))) {
					Browser.tabs.getCurrent(function(d) {
						if (newTab) {
							Browser.tabs.create({
								url: queryURL,
								index: d.index + 1
							});
						}
						else {
							Browser.tabs.update(d.id, {
								url: queryURL
							});
						}
					});

					return;
				}


				Track.FB.logEvent("SEARCHED", null, { fb_search_string: val });

				if (!speech) {
					Track.queue("search", val);

					Track.ga("send", {
						useBeacon: true,
						hitType: "pageview",
						title: "Search: " + val,
						page: "/search?q=" + encodeURIComponent(val)
					});
				}


				var searchURL = "https://search.ichro.me/search?" +
					"ext=" + (Browser.app.newTab ? "newtab" : "main") +
					"&version=" + Browser.app.version +
					"&engine=" + encodeURIComponent(this.model.get("searchEngine") || "default") +
					"&q=" + encodeURIComponent(val);

				var link = document.createElement("a");

				link.setAttribute("href", queryURL || searchURL);

				link.setAttribute("target", (newTab ? "_blank" : "_self"));

				link.click();
			},
			speech: function() {
				this.Speech.start();

				Track.event("Search", "Speech", "Start");
			},
			onSpeechResult: function(val) {
				Track.queue("search", val, true);

				Track.ga("send", {
					useBeacon: true,
					hitType: "pageview",
					title: "Voice Search: " + val,
					page: "/search/speech?q=" + encodeURIComponent(val)
				});

				this.submit(val, true);
			},
			initialize: function() {
				this.model = new Model();

				this.Speech = Speech();

				this.Suggestions = new Suggestions();

				// This is attached to both select and focuschange since searches won't happen instantly and it's good for users to see what they've selected
				this.Suggestions.on("select focuschange", function(val) {
					this.$("input").val(val);
				}, this).on("select", function(val) {
					this.submit(val);
				}, this);

				this.Speech.on("result", this.onSpeechResult, this);

				this.once("inserted", function() {
					// The preloadInput element captures text that's entered while the page is
					// still loading so users that type quickly when opening a new tab don't
					// lose the first part of their searches
					var preloadInput = document.getElementById("preload-search-input"),
						preloadScript = document.getElementById("preload-search-script");

					this.$("input").val((preloadInput && preloadInput.value) || "").focus();

					if (preloadInput) {
						if (preloadInput.getAttribute("data-submit") === "true" && preloadInput.value.trim().length) {
							this.submit();
						}

						preloadInput.parentNode.removeChild(preloadInput);
					}

					if (preloadScript) {
						preloadScript.parentNode.removeChild(preloadScript);
					}
				});

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

				this.Suggestions.setElement(this.$(".suggestions")).trigger("element:updated");

				return this;
			}
		});

	return View;
});