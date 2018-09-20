define(["lodash", "widgets/views/main"], function(_, WidgetView) {
	var currencies = {
		AED: "United Arab Emirates Dirham",
		AFN: "Afghan Afghani",
		ALL: "Albanian Lek",
		AMD: "Armenian Dram",
		ANG: "Netherlands Antillean Guilder",
		AOA: "Angolan Kwanza",
		ARS: "Argentine Peso",
		AUD: "Australian Dollar",
		AWG: "Aruban Florin",
		AZN: "Azerbaijani Manat",
		BAM: "Bosnia-Herzegovina Convertible Mark",
		BBD: "Barbadian Dollar",
		BDT: "Bangladeshi Taka",
		BGN: "Bulgarian Lev",
		BHD: "Bahraini Dinar",
		BIF: "Burundian Franc",
		BMD: "Bermudan Dollar",
		BND: "Brunei Dollar",
		BOB: "Bolivian Boliviano",
		BRL: "Brazilian Real",
		BSD: "Bahamian Dollar",
		BTC: "Bitcoin",
		BTN: "Bhutanese Ngultrum",
		BWP: "Botswanan Pula",
		BYN: "Belarusian Ruble",
		BZD: "Belize Dollar",
		CAD: "Canadian Dollar",
		CDF: "Congolese Franc",
		CHF: "Swiss Franc",
		CLF: "Chilean Unit of Account (UF)",
		CLP: "Chilean Peso",
		CNH: "Chinese Yuan (Offshore)",
		CNY: "Chinese Yuan",
		COP: "Colombian Peso",
		CRC: "Costa Rican Colón",
		CUC: "Cuban Convertible Peso",
		CUP: "Cuban Peso",
		CVE: "Cape Verdean Escudo",
		CZK: "Czech Republic Koruna",
		DJF: "Djiboutian Franc",
		DKK: "Danish Krone",
		DOP: "Dominican Peso",
		DZD: "Algerian Dinar",
		EGP: "Egyptian Pound",
		ERN: "Eritrean Nakfa",
		ETB: "Ethiopian Birr",
		EUR: "Euro",
		FJD: "Fijian Dollar",
		FKP: "Falkland Islands Pound",
		GBP: "British Pound Sterling",
		GEL: "Georgian Lari",
		GGP: "Guernsey Pound",
		GHS: "Ghanaian Cedi",
		GIP: "Gibraltar Pound",
		GMD: "Gambian Dalasi",
		GNF: "Guinean Franc",
		GTQ: "Guatemalan Quetzal",
		GYD: "Guyanaese Dollar",
		HKD: "Hong Kong Dollar",
		HNL: "Honduran Lempira",
		HRK: "Croatian Kuna",
		HTG: "Haitian Gourde",
		HUF: "Hungarian Forint",
		IDR: "Indonesian Rupiah",
		ILS: "Israeli New Sheqel",
		IMP: "Manx pound",
		INR: "Indian Rupee",
		IQD: "Iraqi Dinar",
		IRR: "Iranian Rial",
		ISK: "Icelandic Króna",
		JEP: "Jersey Pound",
		JMD: "Jamaican Dollar",
		JOD: "Jordanian Dinar",
		JPY: "Japanese Yen",
		KES: "Kenyan Shilling",
		KGS: "Kyrgystani Som",
		KHR: "Cambodian Riel",
		KMF: "Comorian Franc",
		KPW: "North Korean Won",
		KRW: "South Korean Won",
		KWD: "Kuwaiti Dinar",
		KYD: "Cayman Islands Dollar",
		KZT: "Kazakhstani Tenge",
		LAK: "Laotian Kip",
		LBP: "Lebanese Pound",
		LKR: "Sri Lankan Rupee",
		LRD: "Liberian Dollar",
		LSL: "Lesotho Loti",
		LYD: "Libyan Dinar",
		MAD: "Moroccan Dirham",
		MDL: "Moldovan Leu",
		MGA: "Malagasy Ariary",
		MKD: "Macedonian Denar",
		MMK: "Myanma Kyat",
		MNT: "Mongolian Tugrik",
		MOP: "Macanese Pataca",
		MRO: "Mauritanian Ouguiya (pre-2018)",
		MRU: "Mauritanian Ouguiya",
		MUR: "Mauritian Rupee",
		MVR: "Maldivian Rufiyaa",
		MWK: "Malawian Kwacha",
		MXN: "Mexican Peso",
		MYR: "Malaysian Ringgit",
		MZN: "Mozambican Metical",
		NAD: "Namibian Dollar",
		NGN: "Nigerian Naira",
		NIO: "Nicaraguan Córdoba",
		NOK: "Norwegian Krone",
		NPR: "Nepalese Rupee",
		NZD: "New Zealand Dollar",
		OMR: "Omani Rial",
		PAB: "Panamanian Balboa",
		PEN: "Peruvian Nuevo Sol",
		PGK: "Papua New Guinean Kina",
		PHP: "Philippine Peso",
		PKR: "Pakistani Rupee",
		PLN: "Polish Zloty",
		PYG: "Paraguayan Guarani",
		QAR: "Qatari Rial",
		RON: "Romanian Leu",
		RSD: "Serbian Dinar",
		RUB: "Russian Ruble",
		RWF: "Rwandan Franc",
		SAR: "Saudi Riyal",
		SBD: "Solomon Islands Dollar",
		SCR: "Seychellois Rupee",
		SDG: "Sudanese Pound",
		SEK: "Swedish Krona",
		SGD: "Singapore Dollar",
		SHP: "Saint Helena Pound",
		SLL: "Sierra Leonean Leone",
		SOS: "Somali Shilling",
		SRD: "Surinamese Dollar",
		SSP: "South Sudanese Pound",
		STD: "São Tomé and Príncipe Dobra (pre-2018)",
		STN: "São Tomé and Príncipe Dobra",
		SVC: "Salvadoran Colón",
		SYP: "Syrian Pound",
		SZL: "Swazi Lilangeni",
		THB: "Thai Baht",
		TJS: "Tajikistani Somoni",
		TMT: "Turkmenistani Manat",
		TND: "Tunisian Dinar",
		TOP: "Tongan Pa'anga",
		TRY: "Turkish Lira",
		TTD: "Trinidad and Tobago Dollar",
		TWD: "New Taiwan Dollar",
		TZS: "Tanzanian Shilling",
		UAH: "Ukrainian Hryvnia",
		UGX: "Ugandan Shilling",
		USD: "United States Dollar",
		UYU: "Uruguayan Peso",
		UZS: "Uzbekistan Som",
		VEF: "Venezuelan Bolívar Fuerte (Old)",
		VES: "Venezuelan Bolívar Soberano",
		VND: "Vietnamese Dong",
		VUV: "Vanuatu Vatu",
		WST: "Samoan Tala",
		XAF: "CFA Franc BEAC",
		XAG: "Silver Ounce",
		XAU: "Gold Ounce",
		XCD: "East Caribbean Dollar",
		XDR: "Special Drawing Rights",
		XOF: "CFA Franc BCEAO",
		XPD: "Palladium Ounce",
		XPF: "CFP Franc",
		XPT: "Platinum Ounce",
		YER: "Yemeni Rial",
		ZAR: "South African Rand",
		ZMW: "Zambian Kwacha",
		ZWL: "Zimbabwean Dollar"
	};

	return WidgetView.extend({
		events: {
			"change select": "convert",
			"input input.fromval": "convert",

			"input input.toval": function() {
				this.convert(true);
			},

			"keyup input": function(e) {
				if (e.which === 17) {
					this._ctrlDown = false;
				}
			},

			"keydown input": function(e) {
				var w = e.which;

				if (w === 17) {
					this._ctrlDown = true;
				}

				if (w === 13) {
					e.preventDefault();

					this.convert();
				}
				else if (!(this._ctrlDown || (
					(w > 47 && w < 58) ||
					(w > 36 && w < 41) ||
					(w > 95 && w < 106) ||
					w === 8 || w === 9 ||
					w === 46 || w === 17 ||
					w === 65 || w === 190
				))) {
					e.preventDefault();
				}
			},

			"click button.swap": function() {
				var temp = this.$("select.from").val();

				this.$("select.from").val(this.$("select.to").val());
				this.$("select.to").val(temp);

				temp = this.$(".fromval").val();

				this.$(".fromval").val(this.$(".toval").val());
				this.$(".toval").val(temp);
			}
		},

		convert: function(reverse) {
			var to = this.$("select.to").val(),
				from = this.$("select.from").val();

			this.model.saveSyncData({
				to: to,
				from: from,

				recentTo: _(this.model.syncData.recentTo || []).unshift(to).uniq().take(15).value(),
				recentFrom: _(this.model.syncData.recentFrom || []).unshift(from).uniq().take(15).value()
			});


			if (reverse === true) {
				this.model.getConversion(this.$(".toval").val(), to, from, function(converted) {
					this.$(".fromval").val(converted);
				}, this);
			}
			else {
				this.model.getConversion(this.$(".fromval").val(), from, to, function(converted) {
					this.$(".toval").val(converted);
				}, this);
			}
		},

		initialize: function() {
			this.render();

			this.model.getConversion(1, this.model.syncData.from, this.model.syncData.to, function(converted) {
				this.$("input.toval").val(converted);
			}, this);
		},

		render: function(data, partials) {
			return WidgetView.prototype.render.call(this, data || this.model.syncData, partials);
		},

		onBeforeRender: function(data) {
			var mapRecents = function(recents) {
				return _.map(recents || ["USD"], function(code) {
					return {
						name: currencies[code],
						code: code,
						selected: code === "USD"
					};
				});
			};

			data.recentTo = mapRecents(data.recentTo);
			data.recentFrom = mapRecents(data.recentFrom);

			data.currencies = _.map(currencies, function(name, code) {
				return {
					name: name,
					code: code
				};
			});

			return data;
		}
	});
});