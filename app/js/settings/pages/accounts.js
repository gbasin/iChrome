/**
 * The accounts and sync settings page
 */
define([
	"jquery", "lodash", "i18n/i18n", "modals/alert", "storage/storage", "storage/syncapi", "settings/page"
], function($, _, Translate, Alert, Storage, SyncAPI, Page) {
	var View = Page.extend({
		id: "accounts",

		events: {
			"click button.sign-in": function() {
				Alert({
					title: Translate("settings.accounts.keep_data"),
					contents: [Translate("settings.accounts.keep_data_desc")],
					buttons: {
						negative: Translate("settings.accounts.keep_account"),
						positive: Translate("settings.accounts.keep_local")
					}
				}, function(sendData) {
					SyncAPI.authorize(this.model.storage, sendData, function() {
						this.render();
					}.bind(this));
				}.bind(this));
			},

			"click button.reset": function() {
				Alert({
					contents: [Translate("settings.accounts.reset_confirm_desc"), Translate("settings.accounts.reset_confirm_desc2")],
					confirm: true
				}, function() {
					Storage.reset(function() {
						location.reload();
					});
				});
			},

			"click button.sign-out": function() {
				// TODO: Implement
				Alert("Sign out can't be implemented until the sync system is switched to an accounts system.");
			}
		},

		initialize: function() {
			this.listenTo(this.model, "storage:updated", _.ary(this.render, 0));
		},

		onBeforeRender: function() {
			var profile = SyncAPI.getInfo().user || {};

			return {
				signedIn: !!SyncAPI.getInfo().token,
				signedInMsg: Translate("settings.accounts.status.signed_in", profile.fname + " " + profile.lname, profile.email)
			};
		}
	});

	return View;
});