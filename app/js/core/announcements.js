/**
 * Announcements
 */
define(["backbone", "modals/alert", "core/analytics", "i18n/i18n", "core/info", "core/render"], function(Backbone, Alert, Track, Translate, info, render) {
	var Model = Backbone.Model.extend({
		url: "http://api.ichro.me/announcements?extension=" + info.id + "&version=" + info.version + "&lang=" + info.language,

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
			var d = this.model.attributes;

			Alert({
				title: d.title,
				classes: "announcements",
				html: d.isUpdate ? render("whatsnew") : d.contents,
				buttons: {
					positive: d.action ? d.action.text : "Got it",
					negative: d.action ? Translate("alert.default_button") : undefined
				}
			}, function(res) {
				this.trigger("dismissed");

				if (d.isUpdate) {
					localStorage.removeItem("showWhatsNew");
				}
				else {
					localStorage.dismissedAnnouncement = d.announcement_id;

					if (d.action && res) {
						chrome.tabs.create({
							url: d.action.url
						});
					}
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