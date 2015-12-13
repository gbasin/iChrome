/**
 * This is a slightly modified version of the OAuth library that stores authorization
 * data in a widget's synced configuration instead of Browser.storage.
 *
 * This allows for multiple accounts across different widgets and obviates the need
 * to sign in on each computer (since keys are synced).
 */
define(["lodash", "oauth"], function(_, OAuth) {
	/**
	 * Creates a new Widget OAuth instance
	 *
	 * @constructor
	 * @param  {Backbone.WidgetModel}  model  The widget's model
	 * @return {WidgetOAuth}                  A new widget OAuth instance
	 */
	var WidgetOAuth = function(model) {
		this.model = model;

		var config = _.clone(_.result(this.model, "oAuth"));

		if (!config) return;

		config.name = config.name || this.model.name;

		if (OAuth.call(this, config) === "Invalid config") {
			throw new Error("Invalid OAuth configuration");
		}
	};

	WidgetOAuth.prototype = _.clone(OAuth.prototype);


	/**
	 * Returns any stored OAuth data from the model's synced configuration
	 * and updates this.data
	 *
	 * @api     private
	 * @return  {Object}  The data retreived from the model's data
	 */
	WidgetOAuth.prototype.loadStorage = function() {
		this.data = this.model && this.model.config && this.model.config.oauth;

		// If the model doesn't have an OAuth configuration stored, try loading
		// it from Browser.storage
		if (!this.data) {
			try {
				OAuth.prototype.loadStorage.call(this);
			}
			catch (e) {}
		}

		this.data = this.data || {};

		return this.data;
	};


	/**
	 * Saves this.data to the model's synced configuration
	 *
	 * @api     private
	 */
	WidgetOAuth.prototype.saveStorage = function() {
		if (this.data && this.model && Object.keys(this.data).length) {
			if (!this.model.config) {
				this.model.config = {};
			}

			this.model.config.oauth = this.data;

			this.model.saveConfig();
		}
	};


	/**
	 * Used to bind functions to `this.model` when passed to the OAuth
	 * library
	 *
	 * @api     private
	 * @param   {Function}  fn   The function to bind
	 * @return  {Function}       The bound function
	 */
	WidgetOAuth.prototype._bind = function(fn) {
		var ctx = this.model;

		return function(a, b) {
			fn.call(ctx, a, b);
		};
	};


	// We proxy these methods so models don't have to bind to `this`
	WidgetOAuth.prototype.getToken = function(cb, silent) {
		return OAuth.prototype.getToken.call(this, this._bind(cb), silent);
	};

	WidgetOAuth.prototype.refreshToken = function(cb, silent) {
		return OAuth.prototype.refreshToken.call(this, this._bind(cb), silent);
	};

	WidgetOAuth.prototype.startAuthFlow = function(cb, silent) {
		return OAuth.prototype.startAuthFlow.call(this, this._bind(cb), silent);
	};

	WidgetOAuth.prototype.ajax = function(params) {
		if (params.success) {
			params.success = this._bind(params.success);
		}

		return OAuth.prototype.ajax.call(this, params);
	};


	return WidgetOAuth;
});