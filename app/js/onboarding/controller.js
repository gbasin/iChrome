/**
 * The onboarding guide this is shown once on installation unless a logged in user is synced in
 */
define([
	"lodash", "backbone", "browser/api", "core/analytics", "core/auth", "storage/storage", "onboarding/modal", "onboarding/widgets", "onboarding/settings", "onboarding/introduction", "onboarding/upgrade"
], function(_, Backbone, Browser, Track, Auth, Storage, Modal, WidgetGuide, SettingsGuide, Introduction, UpgradePage) {
	var Controller = function() {
		// The onboarding process is heavily tracked, it's important to know where new users
		// might be giving up or how far they get through the process

		// If we needed to reload because the user was Pro, pick up again at the widget
		// onboarding stage.
		/*if (Browser.storage.firstRun === "resume") {
			return this.showIntroductionGuide();
		}*/

		var isFirstRun = Browser.storage.firstRun === "true";
		if (isFirstRun) {
			//Show instroduction page on first run
			Track.event("Onboarding", "Introduction", "Shown");

			this.introduction = new Introduction();

			this.listenToOnce(this.introduction, "skip", function() {
				this.complete();
			}.bind(this));
			this.listenToOnce(this.introduction, "next", this.showWidgetGuide);

			return true;
		}

		var isAuth = Browser.storage.nextAuth && Browser.storage.nextAuth <= new Date().getTime();
		if (isAuth) {
			if (Auth.isSignedIn) {
				Browser.storage.nextAuth = Number.MAX_VALUE; //Already signed in : never run again
				return; 
			}

			//The Authentication page shown on second run				
			Track.event("Onboarding", "Modal", "Show");

			this.modal = new Modal({isAuth: isAuth});

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
					Browser.storage.nextAuth = new Date().getTime() + 86400000 * 2; //Next run in 2 days
					//this.showIntroductionGuide();
				}
			});
			
			return;
		}
	};

	_.extend(Controller.prototype, Backbone.Events, {
		complete: function(withDelay) {
			delete Browser.storage.firstRun;

			this.trigger("complete");

			Track.event("Onboarding", "Complete");

			Track.FB.logEvent("COMPLETED_TUTORIAL");

			if (!Browser.storage.nextAuth) {
				Browser.storage.nextAuth = new Date().getTime() + (withDelay ? 3000 : 0); //Run onboarding next start to show the SignIn page
			}

		},

		dismiss: function() {
			delete Browser.storage.firstRun;
			
			Track.event("Onboarding", "Dismiss");

			Track.FB.logEvent("DISMISS_TUTORIAL");
		},

		showWidgetGuide: function() {
			Track.event("Onboarding", "Widgets", "Shown");

			this.widgetGuide = new WidgetGuide();

			this.listenToOnce(this.widgetGuide, "skip", this.complete);
			this.listenToOnce(this.widgetGuide, "next", this.showSettingsGuide);
		},

		showSettingsGuide: function() {
			Track.event("Onboarding", "Settings", "Shown");

			this.settingsGuide = new SettingsGuide();

			this.listenToOnce(this.settingsGuide, "skip", this.complete);
			this.listenToOnce(this.settingsGuide, "next", this.showUpgradeScreen);
		},

		showUpgradeScreen: function() {
			Track.event("Onboarding", "Upgrade", "Shown");

			this.upgradePage = new UpgradePage();

			this.listenToOnce(this.upgradePage, "complete", this.complete);
			this.listenToOnce(this.upgradePage, "dismiss", this.dismiss);
		}


	});

	return new Controller();
});