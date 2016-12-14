/**
 * Handles auto-running certain modules without the cost of initializing them when they aren't needed
 */
define(["browser/api"], function(Browser) {
	if (Browser.storage.firstRun === "true" || Browser.storage.firstRun === "resume") {
		require(["onboarding/controller"]);
	}

	if (Browser.storage.showUpdated === "true") {
		require(["notices/updated"]);
	}

	if (Browser.storage.showSignInNotice === "true") {
		require(["notices/signin"]);
	}
});