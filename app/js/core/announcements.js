/**
 * Announcements
 */
define(["backbone", "modals/alert", "core/analytics", "core/render"], function(Backbone, Alert, Track, render) {
	var Model = Backbone.Model.extend({
		url: "http://api.ichro.me/announcements?extension=" + chrome.i18n.getMessage("@@extension_id") + "&version=" + chrome.runtime.getManifest().version,

		defaults: {
			count: 0,
			title: "Announcements"
		},

		initialize: function() {
			if (localStorage.showWhatsNew) {
				this.set({
					count: 10,
					isUpdate: true
				});

				setTimeout(function() {
					var shown = (parseInt(localStorage.showWhatsNew) || 0) + 1;

					if (shown >= 10) {
						localStorage.removeItem("showWhatsNew");
					}
					else {
						localStorage.showWhatsNew = shown;
					}
				}, 3000);
			}


			/**
			 * Sample announcement from server:
			 *
			 * {
			 *     "count": 2,
			 *     "alert": false,
			 *     "announcement_id": 1,
			 *     "title": "Test title",
			 *     "contents": "<p>Test announcement</p><section><h3>Test</h3><ul><li>List item #1</li><li>List item #2</li></ul></section>"
			 * }
			 */

			this.fetch();

			// Refetch every hour
			setInterval(function() {
				this.fetch({
					url: this.url + "&refetch=1"
				});
			}.bind(this), 3600000);
		},

		parse: function(d) {
			if (d && d.contents) {
				if (d.announcement_id && d.announcement_id.toString() == localStorage.dismissedAnnouncement) {
					return {};
				}

				d.isUpdate = false;

				d.count = d.count || 1;
			}

			return d;
		}
	});
	
	var View = Backbone.View.extend({
		initialize: function() {
			this.model = new Model();

			this.model.on("change", this.render, this).on("change:count", function() {
				this.count = this.model.get("count");

				this.trigger("countchange", this.count);
			}, this).trigger("change change:count");
		},

		show: function(isAlert) {
			Alert({
				title: this.model.get("title"),
				classes: "announcements",
				html: this.model.get("isUpdate") ? render("whatsnew") : this.model.get("contents"),
				buttons: {
					positive: "Got it"
				}
			}, function() {
				this.trigger("dismissed");

				if (this.model.get("isUpdate")) {
					localStorage.removeItem("showWhatsNew");
				}
				else {
					localStorage.dismissedAnnouncement = this.model.get("announcement_id");
				}

				this.model.clear({
					silent: true
				}).set(this.model.defaults);

				Track.event("Announcements", "Dismissed");
			}.bind(this));

			Track.event("Announcements", "Shown", isAlert ? "Alert" : "Click");
		},

		render: function() {
			var d = this.model.attributes;

			if (!d.isUpdate && !d.contents) {
				return;
			}

			if (d.alert === true) {
				this.show(true);
			}
		}
	});

	return new View();
});