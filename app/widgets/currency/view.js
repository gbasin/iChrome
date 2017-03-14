define(["lodash", "widgets/views/main"], function(_, WidgetView) {
	var currencies = {
		AFN: "Afghan Afghani",
		ALL: "Albanian Lek",
		DZD: "Algerian Dinar",
		AOA: "Angolan Kwanza",
		ARS: "Argentine Peso",
		AMD: "Armenian Dram",
		AWG: "Aruban Florin",
		AUD: "Australian Dollar",
		AZN: "Azerbaijani Manat",
		BSD: "Bahamian Dollar",
		BHD: "Bahraini Dinar",
		BDT: "Bangladeshi Taka",
		BBD: "Barbadian Dollar",
		BYR: "Belarusian Ruble",
		BZD: "Belize Dollar",
		BMD: "Bermudan Dollar",
		BTN: "Bhutanese Ngultrum",
		BTC: "Bitcoin",
		BOB: "Bolivian Boliviano",
		BAM: "Bosnia-Herzegovina Convertible Mark",
		BWP: "Botswanan Pula",
		BRL: "Brazilian Real",
		GBP: "British Pound Sterling",
		BND: "Brunei Dollar",
		BGN: "Bulgarian Lev",
		BIF: "Burundian Franc",
		XOF: "CFA Franc BCEAO",
		XAF: "CFA Franc BEAC",
		XPF: "CFP Franc",
		KHR: "Cambodian Riel",
		CAD: "Canadian Dollar",
		CVE: "Cape Verdean Escudo",
		KYD: "Cayman Islands Dollar",
		CLP: "Chilean Peso",
		CLF: "Chilean Unit of Account (UF)",
		CNY: "Chinese Yuan",
		COP: "Colombian Peso",
		KMF: "Comorian Franc",
		CDF: "Congolese Franc",
		CRC: "Costa Rican Colón",
		HRK: "Croatian Kuna",
		CUC: "Cuban Convertible Peso",
		CUP: "Cuban Peso",
		CZK: "Czech Republic Koruna",
		DKK: "Danish Krone",
		DJF: "Djiboutian Franc",
		DOP: "Dominican Peso",
		XCD: "East Caribbean Dollar",
		EGP: "Egyptian Pound",
		ERN: "Eritrean Nakfa",
		ETB: "Ethiopian Birr",
		EUR: "Euro",
		FKP: "Falkland Islands Pound",
		FJD: "Fijian Dollar",
		GMD: "Gambian Dalasi",
		GEL: "Georgian Lari",
		GHS: "Ghanaian Cedi",
		GIP: "Gibraltar Pound",
		XAU: "Gold (troy ounce)",
		GTQ: "Guatemalan Quetzal",
		GNF: "Guinean Franc",
		GYD: "Guyanaese Dollar",
		HTG: "Haitian Gourde",
		HNL: "Honduran Lempira",
		HKD: "Hong Kong Dollar",
		HUF: "Hungarian Forint",
		ISK: "Icelandic Króna",
		INR: "Indian Rupee",
		IDR: "Indonesian Rupiah",
		IRR: "Iranian Rial",
		IQD: "Iraqi Dinar",
		ILS: "Israeli New Sheqel",
		JMD: "Jamaican Dollar",
		JPY: "Japanese Yen",
		JOD: "Jordanian Dinar",
		KZT: "Kazakhstani Tenge",
		KES: "Kenyan Shilling",
		KWD: "Kuwaiti Dinar",
		KGS: "Kyrgystani Som",
		LAK: "Laotian Kip",
		LVL: "Latvian Lats",
		LBP: "Lebanese Pound",
		LSL: "Lesotho Loti",
		LRD: "Liberian Dollar",
		LYD: "Libyan Dinar",
		LTL: "Lithuanian Litas",
		MOP: "Macanese Pataca",
		MKD: "Macedonian Denar",
		MGA: "Malagasy Ariary",
		MWK: "Malawian Kwacha",
		MYR: "Malaysian Ringgit",
		MVR: "Maldivian Rufiyaa",
		MRO: "Mauritanian Ouguiya",
		MUR: "Mauritian Rupee",
		MXN: "Mexican Peso",
		MDL: "Moldovan Leu",
		MNT: "Mongolian Tugrik",
		MAD: "Moroccan Dirham",
		MZN: "Mozambican Metical",
		MMK: "Myanma Kyat",
		NAD: "Namibian Dollar",
		NPR: "Nepalese Rupee",
		ANG: "Netherlands Antillean Guilder",
		TWD: "New Taiwan Dollar",
		NZD: "New Zealand Dollar",
		NIO: "Nicaraguan Córdoba",
		NGN: "Nigerian Naira",
		KPW: "North Korean Won",
		NOK: "Norwegian Krone",
		OMR: "Omani Rial",
		PKR: "Pakistani Rupee",
		PAB: "Panamanian Balboa",
		PGK: "Papua New Guinean Kina",
		PYG: "Paraguayan Guarani",
		PEN: "Peruvian Nuevo Sol",
		PHP: "Philippine Peso",
		PLN: "Polish Zloty",
		QAR: "Qatari Rial",
		RON: "Romanian Leu",
		RUB: "Russian Ruble",
		RWF: "Rwandan Franc",
		SHP: "Saint Helena Pound",
		SVC: "Salvadoran Colón",
		WST: "Samoan Tala",
		SAR: "Saudi Riyal",
		RSD: "Serbian Dinar",
		SCR: "Seychellois Rupee",
		SLL: "Sierra Leonean Leone",
		XAG: "Silver (troy ounce)",
		SGD: "Singapore Dollar",
		SBD: "Solomon Islands Dollar",
		SOS: "Somali Shilling",
		ZAR: "South African Rand",
		KRW: "South Korean Won",
		XDR: "Special Drawing Rights",
		LKR: "Sri Lankan Rupee",
		SDG: "Sudanese Pound",
		SRD: "Surinamese Dollar",
		SZL: "Swazi Lilangeni",
		SEK: "Swedish Krona",
		CHF: "Swiss Franc",
		SYP: "Syrian Pound",
		STD: "São Tomé and Príncipe Dobra",
		TJS: "Tajikistani Somoni",
		TZS: "Tanzanian Shilling",
		THB: "Thai Baht",
		TOP: "Tongan Paʻanga",
		TTD: "Trinidad and Tobago Dollar",
		TND: "Tunisian Dinar",
		TRY: "Turkish Lira",
		TMT: "Turkmenistani Manat",
		UGX: "Ugandan Shilling",
		UAH: "Ukrainian Hryvnia",
		AED: "United Arab Emirates Dirham",
		USD: "United States Dollar",
		UYU: "Uruguayan Peso",
		UZS: "Uzbekistan Som",
		VUV: "Vanuatu Vatu",
		VEF: "Venezuelan Bolívar Fuerte",
		VND: "Vietnamese Dong",
		YER: "Yemeni Rial",
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