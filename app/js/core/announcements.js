/**
 * Announcements
 */
define(["lodash", "backbone", "browser/api", "modals/alert", "core/analytics", "i18n/i18n", "core/render", "core/settings", "storage/storage"], function(_, Backbone, Browser, Alert, Track, Translate, render, settings, Storage) {
	var Model = Backbone.Model.extend({
		url: settings.apidomain + "/announcements?extension=" + Browser.app.id + "&version=" + Browser.app.version + "&lang=" + Browser.language + "&aver=2",

		defaults: {
			count: 0,
			title: "Announcements"
		},

		initialize: function() {
			Storage.on("done updated", function(storage) {
				this.email = storage.user.email;
			}, this);

			var showNewVersion = 4; //This number should be increased on "What's new" dialog modification
			if (Number(Browser.storage.lastShowWhatsNewVersion) !== showNewVersion) {
				Browser.storage.lastShowWhatsNewVersion = showNewVersion;
				Browser.storage.showWhatsNew = 0; //Start the counter from 0 (show max first 10 widget starts)
			}

			if (Browser.storage.showWhatsNew) {
				this.set({
					isUpdate: true
				});

				setTimeout(function() {
					this.updateCounter();

					var shown = (parseInt(Browser.storage.showWhatsNew) || 0) + 1;
					if (shown < 10) {
						Browser.storage.showWhatsNew = shown;
						return;
					}

					//The "What's new" counter was shown 10 times => stop to show it
					Browser.storage.removeItem("showWhatsNew");

					this.set({
						isUpdate: false
					});

					this.updateCounter();
				}.bind(this), 3000);
			}

			this.callFetch();

			// Refetch every hour
			setInterval(function() {
				this.callFetch("&refetch=1");
			}.bind(this), 3600000);
		},

		callFetch: function(append) {
			if (!append) {
				append = "";
			}

			if (Browser.storage.dismissedAnnouncement) {
				//Do not receive announcements the user already has seen
				append += ("&id=" + Browser.storage.dismissedAnnouncement);
			}

			var lastindividual = Number(Browser.storage.lastindividual || "0");
			append += ("&indid=" + lastindividual);

			var indIds = this.getIndIds();
			if (indIds.length > 0) {
				append += ("&indids=" + indIds.join("-"));
			}

			if (this.email) {
				append += ("&email=" + this.email);
			}

			this.fetch({
				url: this.url + append,
				success: function(m) {
					m.updateLocalStorage();
					m.updateCounter();
				}
			});
		},

		getIndIds: function() {
			var annIndIds = Browser.storage.annIndIds;
			if (typeof annIndIds === 'undefined') { return []; }
			var annIndIdsInt = JSON.parse(annIndIds);
			return Array.isArray(annIndIdsInt) ? annIndIdsInt : [annIndIdsInt];
		},

		updateLocalStorage: function() {
			var d = this.attributes;
			if (typeof d.lastindividual === 'undefined') {
				return;
			}

			Browser.storage.lastindividual = d.lastindividual;
			var annIndIds = Browser.storage.annIndIds;
			if (!annIndIds) {
				return;
			}

			var lastIndividualInt = Number(d.lastindividual);
			var annIndIdsFiltered = _.filter(this.getIndIds(), function(x) { return !Number.isNaN(x) && x > lastIndividualInt; });
			if (annIndIds.length !== annIndIdsFiltered.length) {
				if (annIndIdsFiltered.length === 0) {
					delete Browser.storage.annIndIds;	
				}
				else{
					Browser.storage.annIndIds = JSON.stringify(annIndIdsFiltered);
				}
			}
		},

		individualsToShow: function() {
			var d = this.attributes;
			if (d.individual.length === 0) { return []; }
			var lastindividual = Number(Browser.storage.lastindividual || 0);

			var annIndIds = this.getIndIds();
			return _.filter(d.individual, function(x) { 
				return x.announcement_id > lastindividual && !annIndIds.includes(x.announcement_id); 
			});
		},

	    updateCounter: function() {
			var d = this.attributes;

			var newCount = 0;
			if (d.isUpdate) { newCount++; }
			if (d.common) {
				var lastId = Browser.storage.dismissedAnnouncement || 0;
				for (var i = 0; i < d.common.length; i++) {
					if (d.common[i].announcement_id > lastId) {
						newCount++;
					}
				}
			}

			if (d.individual) {
				newCount += this.individualsToShow().length;
			}

			this.set({
				count: newCount
			});
		},		
	});

	var View = Backbone.View.extend({
		initialize: function() {
			this.model = new Model();

			this.model.on("change", this.render, this).on("change:count", function() {
				this.count = this.model.get("count");

				this.trigger("countchange", this.count);
			}, this).trigger("change change:count");
		},

		showWhatsNew : function() {
			var model = this.model;
			var d = model.attributes;
			Alert({
				title: "What's New",
				classes: "announcements",
				html: render("whatsnew"),
				buttons: {
					positive: "Got it"
				}
			}, function() {
				model.trigger("dismissed");

				Browser.storage.removeItem("showWhatsNew");
				
				d.isUpdate = false;
				model.updateCounter();
				
				Track.event("Announcements", "Dismissed");
			}.bind(this));

			Track.event("Announcements", "Shown", "WhatsNew");
		},

		showCommon: function(d) {
			var model = this.model;
			Alert({
				title: d.title,
				classes: "announcements",
				html: d.contents,
				buttons: {
					positive: d.action ? d.action.text : "Got it",
					negative: d.dismiss || (d.action ? Translate("alert.default_button") : undefined)
				}
			}, function(res) {
				model.trigger("dismissed");
				Browser.storage.dismissedAnnouncement = d.announcement_id;

				if (d.action && res) {
					Browser.tabs.create({
						url: d.action.url
					});
				}

				model.updateCounter();

				Track.event("Announcements", "Dismissed");
			}.bind(this));

			Track.event("Announcements", "Shown", "Alert");
		},

		showIndividual: function(d) {
			var model = this.model;
			Alert({
				title: d.title,
				classes: "announcements",
				html: d.contents,
				buttons: {
					positive: d.action ? d.action.text : "Got it",
					negative: d.dismiss || (d.action ? Translate("alert.default_button") : undefined)
				}
			}, function(res) {
				model.trigger("dismissed");

				//Add seen id to storage. It will be sent to server on next announcements update.
				var annIndIdsInt = model.getIndIds();
				if (!_.includes(annIndIdsInt, d.announcement_id)) {
					annIndIdsInt.push(d.announcement_id);
					Browser.storage.annIndIds = JSON.stringify(annIndIdsInt);
				}

				if (d.action && res) {
					Browser.tabs.create({
						url: d.action.url
					});
				}

				model.updateCounter();

				Track.event("Announcements", "Dismissed");
			}.bind(this));

			Track.event("Announcements", "Shown", "Alert");
		},

		topCommon: function() {
			var d = this.model.attributes;

			if (!d.common) {
				return null;
			}

			var lastId = Browser.storage.dismissedAnnouncement || 0;

			for (var i = 0; i < d.common.length; i++) {
				if (d.common[i].announcement_id > lastId) {
					return d.common[i];
				}
			}

			return null;
		},

		topIndividual: function() {
			var d = this.model.attributes;

			if (!d.individual) {
				return null;
			}

			var lastId = Number(Browser.storage.lastindividual || 0);
			var annIndIdsInt = this.model.getIndIds();
			for (var i = 0; i < d.individual.length; i++) {
				var id = d.individual[i].announcement_id;
				if (id > lastId && !annIndIdsInt.includes(id)) {
					return d.individual[i];
				}
			}

			return null;
		},

	    show: function() {
			var d = this.model.attributes;
			if (d.isUpdate) {
				this.showWhatsNew();
				return;
			}

			var item = this.topCommon();
			if (item !== null) {
				this.showCommon(item);
				return;
			}

			item = this.topIndividual();
			if (item !== null) {
				this.showIndividual(item);
			}
		},

		render: function() {
			var item = this.topCommon();
			if (item !== null && item.alert) {
				this.showCommon(item);
				return;
			}

			item = this.topIndividual();
			if (item !== null && item.alert) {
				this.topIndividual(item);
				return;
			}
		}
	});

	return new View();
});