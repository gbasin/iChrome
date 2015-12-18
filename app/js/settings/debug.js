/**
 * The debug tools. This contains advanced tools that users can be instructed to use for troubleshooting.
 */
define(["backbone", "browser/api", "storage/filesystem", "modals/modals", "core/render"], function(Backbone, Browser, FileSystem, Modal, render) {
	var modal = new (Modal.extend({
		width: 800,
		classes: "debug-tools"
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

			if (!action) {
				return;
			}

			switch (action) {
				case "clear-localstorage":
					Browser.storage.clear();

					this.setStatus("Local storage cleared");
				break;

				case "clear-fs":
					FileSystem.clear();
				break;

				case "clear-oauth":
					delete Browser.storage.oauth;

					this.setStatus("OAuth cache cleared");
				break;

				case "get-info":
					this.setStatus("Compiling information, please wait");

					Browser.runtime.getPlatformInfo(function(info) {
						this.setStatus();

						alert(
							"Debug info (hit Ctrl+C or Cmd+C to copy):" + "\n" +
							"iChrome Version: " + Browser.app.version + "\n" +
							"Chrome Version: " + (/Chrome\/([0-9.]+)/.exec(navigator.userAgent) || [])[1] + "\n" +
							"Operating System: " + info.os + "\n" +
							"OAuth keys: " + Object.keys(JSON.parse(Browser.storage.oauth || "{}")).join(", ") + "\n" +
							"Sync Token: " + JSON.parse(Browser.storage.syncData || "{}").token + "\n" +
							"Sync Client: " + JSON.parse(Browser.storage.syncData || "{}").client + "\n" +
							"Uses: " + Browser.storage.uses + "\n" +
							"Cached themes: " + Object.keys(JSON.parse(Browser.storage.config || "{}").cached || {}).length + "\n" +
							"Tabs: " + JSON.parse(Browser.storage.config || "{}").tabs.length + "\n" +
							"Local data size: " + (Browser.storage.config || "").length
						);
					}.bind(this));
				break;

				case "update":
					if (confirm(
						"If an update is available, this may reload the extension in Chrome, closing any open iChrome tabs.  Before executing this, ensure that a tab other" +
						" than iChrome is open otherwise Chrome itself will close.\r\nHit cancel to open a new tab and avoid this or OK to continue."
					)) {
						Browser.runtime.requestUpdateCheck(function(status, details) {
							if (status === "throttled") {
								this.setStatus("Update check failed due to throttling, try again later");
							}
							else if (status === "update_available") {
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
						Browser.runtime.reload();
					}
				break;

				case "execute":
					var textarea = this.$(".console textarea");

					var out = eval(textarea.val()); // jshint ignore:line

					if (out) {
						textarea.val("Output: " + out.toString());
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