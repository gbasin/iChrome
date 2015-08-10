/**
 * The debug dialog.  This contains advanced tools that users can be instructed to use for troubleshooting.
 */
define(["lodash", "jquery", "backbone", "storage/filesystem", "modals/modals", "core/info", "core/render"], function(_, $, Backbone, FileSystem, Modal, info, render) {
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
				case "clear-localstorage":
					localStorage.clear();

					this.setStatus("LocalStorage cleared");
				break;

				case "clear-fs":
					FileSystem.clear();
				break;

				case "clear-oauth":
					delete localStorage.oauth;

					this.setStatus("OAuth cache cleared");
				break;

				case "get-info":
					this.setStatus("Compiling information, please wait");

					chrome.runtime.getPlatformInfo(function(info) {
						this.setStatus();

						alert(
							"Debug info (hit Ctrl+C or Cmd+C to copy):" + "\n" +
							"iChrome Version: " + info.version + "\n" +
							"Chrome Version: " + (/Chrome\/([0-9.]+)/.exec(navigator.userAgent) || [])[1] + "\n" +
							"Operating System: " + info.os + "\n" +
							"OAuth keys: " + Object.keys(JSON.parse(localStorage.oauth || "{}")).join(", ") + "\n" +
							"Sync Token: " + JSON.parse(localStorage.syncData || "{}").token + "\n" +
							"Sync Client: " + JSON.parse(localStorage.syncData || "{}").client + "\n" +
							"Uses: " + localStorage.uses + "\n" +
							"Cached themes: " + Object.keys(JSON.parse(localStorage.config || "{}").cached || {}).length + "\n" +
							"Tabs: " + JSON.parse(localStorage.config || "{}").tabs.length + "\n" +
							"Local data size: " + (localStorage.config || "").length
						);
					}.bind(this));
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
					var out = eval($(".console textarea").val()); // jshint ignore:line

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