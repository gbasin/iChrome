/**
 * The onboarding guide this is shown once on installation unless a logged in user is synced in
 */
define([
	"lodash", "backbone", "browser/api", "core/analytics", "onboarding/modal", "onboarding/widgets", "onboarding/settings"
], function(_, Backbone, Browser, Track, Modal, WidgetGuide, SettingsGuide) {
	var firstRun = Browser.storage.firstRun === "true";

	var Controller = function() {
		// The onboarding process is heavily tracked, it's important to know where new users
		// might be giving up or how far they get through the process
		Track.event("Onboarding", "Modal", "Show");

		this.modal = new Modal();

		this.listenToOnce(this.modal, "close", this.showWidgetGuide);
	};

	_.extend(Controller.prototype, Backbone.Events, {
		showWidgetGuide: function() {
			Track.event("Onboarding", "Widgets", "Shown");

			this.widgetGuide = new WidgetGuide();

			this.listenToOnce(this.widgetGuide, "complete", this.showSettingsGuide);
		},

		showSettingsGuide: function() {
			Track.event("Onboarding", "Settings", "Shown");

			this.settingsGuide = new SettingsGuide();

			this.listenToOnce(this.settingsGuide, "complete", function() {
				delete Browser.storage.firstRun;

				this.trigger("complete");

				Track.event("Onboarding", "Complete");
			});
		}
	});

	if (firstRun) {
		new Controller();
	}

	return Controller;
});