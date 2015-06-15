/**
 * The debug dialog.  This contains advanced tools that users can be instructed to use for troubleshooting.
 */
define(["lodash", "backbone", "modals/modals", "core/render"], function(_, Backbone, Modal, render) {
	var modal = new (Modal.extend({
		width: 800,
		classes: "debug"
	}))();

	var View = Backbone.View.extend({
		el: modal.content,

		events: {
			"click button": "execute"
		},


		/**
		 * Takes a click event from one of the dialog buttons and executes its appropriate action
		 *
		 * @api     private
		 * @param   {Event}  e
		 */
		execute: function(e) {
			var action = e.currentTarget.getAttribute("data-action");

			if (!action) return;

			switch (action) {
				case "clear-sync":
					chrome.storage.sync.clear();

					this.setStatus("Chrome Sync storage cleared, reload the page to resync");
				break;

				case "clear-local":
					chrome.storage.local.clear();

					this.setStatus("Chrome Local storage cleared, reload the page to resync");
				break;

				case "clear-localstorage":
					localStorage.clear();

					this.setStatus("LocalStorage cleared");
				break;

				case "clear-fs":
					var next = function() {
						this.setStatus("FileSystem cleared");
					}.bind(this);

					// Erase all FileSystem entries
					FileSystem.get(function(fs) {
						var reader = fs.root.createReader(),
							length = 0;

						(function read() { // Recursive and self executing, necessary as per the specs
							reader.readEntries(function(results) {
								if (results.length) {
									results.forEach(function(e, i) {
										length++;

										if (e.isDirectory) {
											e.removeRecursively(function() {
												length--;

												if (!length) {
													next();
												}
											});
										}
										else {
											e.remove(function() {
												length--;

												if (!length) {
													next();
												}
											});
										}
									});

									read();
								}
								else if (!length) {
									next();
								}
							}, next);
						})();
					}, next); // In the event of an error continue anyway
				break;

				case "clear-oauth":
					delete localStorage.oauth;

					this.setStatus("OAuth cache cleared");
				break;

				case "get-info":
					this.setStatus("Compiling information, please wait");

					var that = this;

					chrome.runtime.getPlatformInfo(function(info) {
						chrome.storage.local.get(function(local) {
							chrome.storage.sync.getBytesInUse(function(syncUsage) {
								alert(`
									Debug info (hit Ctrl+C or Cmd+C to copy):
									iChrome Version: ${chrome.runtime.getManifest().version}
									Chrome Version: ${(/Chrome\/([0-9.]+)/.exec(navigator.userAgent) || [])[1]}
									Operating System: ${info.os}
									OAuth keys: ${Object.keys(JSON.parse(localStorage.oauth || "{}")).join(", ")}
									User ID: ${localStorage.uid}
									Uses: ${localStorage.uses}
									Cached themes: ${Object.keys(local.cached || {}).length}
									Tabs: ${local.tabs.length}
									Sync bytes in use: ${syncUsage} / ${chrome.storage.sync.QUOTA_BYTES}
								`.replace(/^\t+/g, ""));

								that.setStatus();
							});
						});
					});
				break;

				case "update":
					if (confirm(
						"If an update is available, this may reload the extension in Chrome, closing any open iChrome tabs.  Before executing this, ensure that a tab other" +
						" than iChrome is open otherwise Chrome itself will close.\r\nHit cancel to open a new tab and avoid this or OK to continue."
					)) {
						chrome.runtime.requestUpdateCheck(function(status, details) {
							if (status == "throttled") {
								this.setStatus("Update check failed due to throttling, try again later");
							}
							else if (status == "update_available") {
								this.setStatus((details && details.version) + " available.  Update is pending and should install momentarily.");
							}
							else {
								this.setStatus("No updates available");
							}
						}.bind(this));
					}
				break;

				case "reload-extension":
					if (confirm(
						"This will reload the extension in Chrome, closing any open iChrome tabs.  Before executing this, ensure that a tab other" +
						" than iChrome is open otherwise Chrome itself will close.\r\nHit cancel to open a new tab and avoid this or OK to continue."
					)) {
						chrome.runtime.reload();
					}
				break;

				case "execute":
					var out = eval($(".console textarea").val());

					if (out) {
						$(".console textarea").val("Output: " + out.toString());
					}
				break;
			}
		},

		/**
		 * Populates the status text area in the dialog with the provided text
		 *
		 * @api    private
		 * @param  {String}  [status]
		 */
		setStatus: function(status) {
			this.$(".status").text(status || "").toggleClass("no-status", !status);
		},

		show: function() {
			modal.show();
		},

		initialize: function() {
			this.$el.html(render("settings/debug"));

			modal.mo.appendTo(document.body);

			modal.show();
		}
	});

	return View;
});