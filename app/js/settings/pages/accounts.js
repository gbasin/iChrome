/**
 * The accounts and sync settings page
 */
define([
	"jquery", "lodash", "i18n/i18n", "modals/alert", "core/auth", "storage/storage", "storage/syncapi", "settings/page"
], function($, _, Translate, Alert, Auth, Storage, SyncAPI, Page) {
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
						// If the user is Pro, we need to reload so the app initializes properly
						if (Auth.isPro) {
							location.reload();
						}
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
				Auth.signout();
			}
		},

		initialize: function() {
			this.listenTo(this.model, "storage:updated", _.ary(this.render, 0));
		},

		onBeforeRender: function() {
			return {
				signedIn: Auth.isSignedIn,
				signedInMsg: Translate("settings.accounts.status.signed_in", this.model.storage.user.fname + " " + this.model.storage.user.lname, this.model.storage.user.email)
			};
		}
	});

	return View;
});