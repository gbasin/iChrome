if ((localStorage.frameURLs || "").indexOf("," + location.href) !== -1) {
	top = window.top = window.parent = window.self;

	console.log("yep");
}