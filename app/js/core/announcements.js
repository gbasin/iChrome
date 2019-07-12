/**
 * Announcements
 */
define(["lodash", "backbone", "browser/api", "modals/alert", "core/analytics", "i18n/i18n", "core/render", "core/settings", "storage/storage", "settings/proxy", "core/auth"
], function(_, Backbone, Browser, Alert, Track, Translate, render, settings, Storage, SettingsProxy, Auth) {
	var Model = Backbone.Model.extend({
		url: settings.apidomain + "/announcements?extension=" + Browser.app.id + "&version=" + Browser.app.version + "&lang=" + Browser.language + "&aver=2",

		defaults: {
			count: 0,
			title: "Announcements",
			list: []
		},

		initialize: function() {
			Storage.on("done updated", function(storage) {
				this.email = storage.user.email;
			}, this);

			var showNewVersion = 6; //This number should be increased on "What's new" dialog modification
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

			if (!Auth.isSignedIn) {
				if (this.isSignInPopup()) {
					require(["notices/signin"]);				
				}
			}

			//Set extension "installed" time
			if (!Browser.storage.installed) {
				Browser.storage.installed = new Date().getTime();
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

		timeDiffInMins: function(date1, date2) {
			return (date1.getTime() - date2.getTime()) / 60000.0;
		},

		isSignInPopup: function() {
			var installedTime = Browser.storage.installed;
			if (typeof installedTime === "undefined") { return null; }

			var installedTimeDate = new Date(Number(installedTime));
			var passed = this.timeDiffInMins(new Date(), installedTimeDate);

			var lastNotificationDate = new Date(Number(Browser.storage.lastUpgradeNotification || installedTime));
			var notificationPassed = this.timeDiffInMins(lastNotificationDate, installedTimeDate);
			return passed > 10080 && notificationPassed < 10080;
		},

		messageOnInstalledToShow: function() {
			var now = new Date();

			var result = null;

			if (!Auth.isSignedIn) {
				var installedTime = Browser.storage.installed || 0;
				if (typeof installedTime === "undefined") { return null; }
				var installedTimeDate = new Date(Number(installedTime));

				var passed = this.timeDiffInMins(now, installedTimeDate);

				var lastNotificationDate = new Date(Number(Browser.storage.lastUpgradeNotification || installedTime));
				var notificationPassed = this.timeDiffInMins(lastNotificationDate, installedTimeDate);

				var doShow = [1140.0, 60.0, 2.0].some(function(element) {
					return passed > element && notificationPassed < element;
				});

				if (doShow) {
					result = [
						{
							type: "l",
							id: 1,
							title: "You are not signed in now",
							contents: "<p>Try iChrome Pro free for 30 Days! Sign in with your Chrome account to securely store and sync your settings, and experience the full features of iChrome Pro.</p>",
							positiveText: "Sign in",
							negativeText: "Dismiss",
							positiveAction: function() {
								SettingsProxy("accounts");
							},
							finallyAction: function() {
								Browser.storage.lastUpgradeNotification = new Date().getTime();
							}
						}
					];
				}
			}

			if (Auth.isPro && Auth.isTrial && Auth.trialExpiration) {
				var expDate = new Date(Number(Auth.trialExpiration));
				var minsViewsTillExp = this.timeDiffInMins(expDate, new Date(Number(Browser.storage.trialExp || 0)));
				var minsTillExp = this.timeDiffInMins(expDate, now);
				var doShowNotification = [10080.0, 1440.0].some(function(element) {
					return element >= minsTillExp && element < minsViewsTillExp;
				});
				
				if (doShowNotification) {
					result = result || [];
					result.push({
							type: "l",
							id: 2,
							title: "Your trial Pro subscription expires soon",
							contents: "<p>You have 1 month trial Pro subscription which is expiring. Please press 'Upgrade' button for permanent subscription</p>",
							positiveText: "Upgrade",
							negativeText: "Dismiss",
							positiveAction: function() {
								SettingsProxy("pro");
							},
							finallyAction: function() {
								Browser.storage.trialExp = new Date().getTime();
							}
					});
				}
			}

			return result;
		},

		individualById: function(id) {
			var d = this.attributes;
			if (d.individual.length === 0) { return null; }
			return _.find(d.individual, function(x) { 
				return x.announcement_id === id; 
			});
		},

		messageOnInstalledById: function(id) {
			var messages = this.messageOnInstalledToShow();
			if (messages === null) { return null; }
			return _.find(messages, function(x) { 
				return x.id === id; 
			});
		},

		topCommon: function() {
			var d = this.attributes;

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
			var d = this.attributes;

			if (!d.individual) {
				return null;
			}

			var lastId = Number(Browser.storage.lastindividual || 0);
			var annIndIdsInt = this.getIndIds();
			for (var i = 0; i < d.individual.length; i++) {
				var id = d.individual[i].announcement_id;
				if (id > lastId && !annIndIdsInt.includes(id)) {
					return d.individual[i];
				}
			}

			return null;
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

			var result = [];
			if (d.isUpdate) { 
				result.push({
					type: "u",
					title: "New features and changes"
				});
			}

			var topCommonItem = this.topCommon();
			if (topCommonItem !== null) {
				result.push({
					type: "c",
					id: topCommonItem.announcement_id,
					title: topCommonItem.title
				});
			}	

			if (d.individual) {
				result = result.concat(this.individualsToShow().map(function(item) {
					return {
						type: "i",
						id: item.announcement_id,
						title: item.title
					};
				}));
			}

			var messageOnInstalled = this.messageOnInstalledToShow();
			if (messageOnInstalled !== null) {
				newCount += messageOnInstalled.length;
				result = result.concat(messageOnInstalled);
			}

			this.set({
				list: result,
				count: newCount
			});
		}
	});

	var View = Backbone.View.extend({
		initialize: function() {
			this.model = new Model();

			this.model.on("change", this.render, this).on("change:count", function() {
				this.count = this.model.get("count");
				this.list = this.model.get("list");

				this.trigger("countchange", this.count);
			}, this).trigger("change change:count");
		},

		showWhatsNew : function(doDismiss) {
			var model = this.model;
			var d = model.attributes;

			var dismiss = function() {
				model.trigger("dismissed");

				Browser.storage.removeItem("showWhatsNew");
				
				d.isUpdate = false;
				model.updateCounter();
				
				Track.event("Announcements", "Dismissed");
			};			

			if (doDismiss) {
				dismiss();
				return;
			}

			Alert({
				title: "What's New",
				classes: "announcements",
				html: render("whatsnew"),
				buttons: {
					positive: "Got it"
				},
				extlink: function(type) {
					switch (type || "") {
						case "topro": 
							this.hide();
							SettingsProxy("pro");
							break;
					}
				}
			}, function() {
				dismiss();
			}.bind(this));

			Track.event("Announcements", "Shown", "WhatsNew");
		},

		showCommon: function(d, doDismiss) {
			var model = this.model;

			var dismiss = function(res) {
				model.trigger("dismissed");
				Browser.storage.dismissedAnnouncement = d.announcement_id;

				if (d.action && res) {
					Browser.tabs.create({
						url: d.action.url
					});
				}

				model.updateCounter();

				Track.event("Announcements", "Dismissed");
			};

			if (doDismiss){
				dismiss(false);
				return;
			}
 
			Alert({
				title: d.title,
				classes: "announcements",
				html: d.contents,
				buttons: {
					positive: d.action ? d.action.text : "Got it",
					negative: d.dismiss || (d.action ? Translate("alert.default_button") : undefined)
				}
			}, function(res) {
				dismiss(res);
			}.bind(this));

			Track.event("Announcements", "Shown", "Alert");
		},

		showIndividual: function(d, doDismiss) {
			var model = this.model;

			var dismiss = function(res) {
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
			};

			if (doDismiss) {
				dismiss(false);
				return;
			}

			Alert({
				title: d.title,
				classes: "announcements",
				html: d.contents,
				buttons: {
					positive: d.action ? d.action.text : "Got it",
					negative: d.dismiss || (d.action ? Translate("alert.default_button") : undefined)
				}
			}, function(res) {
				dismiss(res);
			}.bind(this));

			Track.event("Announcements", "Shown", "Alert");
		},


		showMessageOnInstalled: function(d, doDismiss) {
			var model = this.model;

			var dismiss = function(res) {
				model.trigger("dismissed");

				if (res) {
					if (d.positiveAction) {
						d.positiveAction();
						Track.event("Announcements", "Confirmed");
					}
				} else {
					if (d.negativeAction) {
						d.negativeAction();
						Track.event("Announcements", "Dismissed");
					}
				}

				if (d.finallyAction) {
					d.finallyAction();
				}

				model.updateCounter();
			};

			if (doDismiss) {
				dismiss(false);
				return;
			}

			Alert({
				title: d.title,
				classes: "announcements",
				html: d.contents,
				buttons: {
					positive: d.positiveText,
					negative: d.negativeText
				}
			}, function(res) {
				dismiss(res);
			}.bind(this));

			Track.event("Announcements", "Shown", "Alert");
		},

	    show: function() {
			var d = this.model.attributes;
			if (d.isUpdate) {
				this.showWhatsNew();
				return;
			}

			var item = this.model.topCommon();
			if (item !== null) {
				this.showCommon(item);
				return;
			}

			item = this.model.topIndividual();
			if (item !== null) {
				this.showIndividual(item);
			}
		},

	    showId: function(type, id, doDismiss) {
			var item;
			switch (type)
			{
				case "u":
					this.showWhatsNew(doDismiss);
					return;
				case "c":
				{
					var topItem = this.model.topCommon();
					if (topItem !== null) {
						this.showCommon(topItem, doDismiss);
						return;
					}
					break;
				}
				case "i":
				{
					item = this.model.individualById(Number(id));
					if (item) {
						this.showIndividual(item, doDismiss);
					}
					break;
				}
				case "l":
				{
					item = this.model.messageOnInstalledById(Number(id));
					if (item) {
						this.showMessageOnInstalled(item, doDismiss);
					}
					break;
				}
			}
		},

		render: function() {
			var item = this.model.topCommon();
			if (item !== null && item.alert) {
				this.showCommon(item);
				return;
			}

			item = this.model.topIndividual();
			if (item !== null && item.alert) {
				this.topIndividual(item);
				return;
			}
		}
	});

	return new View();
});