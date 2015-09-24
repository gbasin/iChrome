/**
 * Announcements
 */
define(["backbone", "browser/api", "modals/alert", "core/analytics", "i18n/i18n", "core/render"], function(Backbone, Browser, Alert, Track, Translate, render) {
	var Model = Backbone.Model.extend({
		url: "https://api.ichro.me/announcements?extension=" + Browser.app.id + "&version=" + Browser.app.version + "&lang=" + Browser.language,

		defaults: {
			count: 0,
			title: "Announcements"
		},

		initialize: function() {
			if (Browser.storage.showWhatsNew) {
				this.set({
					count: 10,
					isUpdate: true
				});

				setTimeout(function() {
					var shown = (parseInt(Browser.storage.showWhatsNew) || 0) + 1;

					if (shown >= 10) {
						Browser.storage.removeItem("showWhatsNew");
					}
					else {
						Browser.storage.showWhatsNew = shown;
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
				if (d.announcement_id && d.announcement_id.toString() == Browser.storage.dismissedAnnouncement) {
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
					Browser.storage.removeItem("showWhatsNew");
				}
				else {
					Browser.storage.dismissedAnnouncement = d.announcement_id;

					if (d.action && res) {
						Browser.tabs.create({
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