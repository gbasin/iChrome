/**
 * The onboarding guide this is shown once on installation unless a logged in user is synced in
 */
define([
	"lodash", "backbone", "browser/api", "core/analytics", "onboarding/modal", "onboarding/widgets", "onboarding/settings", "onboarding/modalpro"
], function(_, Backbone, Browser, Track, Modal, WidgetGuide, SettingsGuide, ModalPro) {
	var Controller = function() {
		// The onboarding process is heavily tracked, it's important to know where new users
		// might be giving up or how far they get through the process
		Track.event("Onboarding", "Modal", "Show");

		// If we needed to reload because the user was Pro, pick up again at the widget
		// onboarding stage.
		if (Browser.storage.firstRun === "resume") {
			return this.showWidgetGuide();
		}

		this.modal = new Modal();

		this.listenToOnce(this.modal, "close", function(userType) {
			if (userType.indexOf("existing") === 0) {
				this.complete();

				if (userType === "existing_pro") {
					location.reload();
				}
			}

			// If the user is a new user and is Pro (this can happen with businesses and schools),
			// we need to reload the page to handle Pro initialization and then resume the onboarding
			// process
			else if (userType === "new_pro") {
				Browser.storage.firstRun = "resume";

				location.reload();
			}

			else {
				this.showWidgetGuide();
			}
		});
	};

	_.extend(Controller.prototype, Backbone.Events, {
		complete: function() {
			delete Browser.storage.firstRun;

			this.trigger("complete");

			Track.event("Onboarding", "Complete");

			Track.FB.logEvent("COMPLETED_TUTORIAL");
		},

		showWidgetGuide: function() {
			Track.event("Onboarding", "Widgets", "Shown");

			this.widgetGuide = new WidgetGuide();

			this.listenToOnce(this.widgetGuide, "complete", this.showSettingsGuide);
		},

		showSettingsGuide: function() {
			Track.event("Onboarding", "Settings", "Shown");

			this.settingsGuide = new SettingsGuide();

			this.listenToOnce(this.settingsGuide, "complete", this.showProModal);
		},

		showProModal: function() {
			Track.event("Onboarding", "ModalPro", "Shown");

			this.modal = new ModalPro();

			this.listenToOnce(this.modal, "complete", this.complete);
		}
	});

	return new Controller();
});