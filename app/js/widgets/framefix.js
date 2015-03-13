/**
 * This sets a global variable `tabId` to the current tab's Chrome ID so the background page
 * can filter requests from iframes within the page and disable the frame-options header.
 *
 * It would be simpler to call this on load instead of adding a check in every place that
 * requires it, but the call takes 15 - 20 ms initially which is too long to delay every load
 * by on the chance that it has a frame.
 */
define(function() {
	var check = function(cb, ctx, args) {
		if (!window.tabId) {
			chrome.tabs.getCurrent(function(tab) {
				window.tabId = tab.id;

				cb.apply(ctx, args);
			});

			return false;
		}

		return true;
	};

	return check;
});