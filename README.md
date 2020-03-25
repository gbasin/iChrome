# ProductivityTab
[![Build Status](https://api.travis-ci.org/AMKohn/iChrome.svg)](https://travis-ci.org/AMKohn/iChrome) [![Codacy Badge](https://api.codacy.com/project/badge/grade/971d2d380b1143a89c9416af32721f17)](https://www.codacy.com/app/AMKohn/iChrome) [![Crowdin](https://d322cqt584bo4o.cloudfront.net/ichrome/localized.png)](https://crowdin.com/project/ichrome) [![devDependency Status](https://david-dm.org/AMKohn/iChrome/dev-status.svg?style=flat)](https://david-dm.org/AMKohn/iChrome#info=devDependencies) [![twitter](http://img.shields.io/badge/twitter-@iChromeHQ-blue.svg?style=flat)](https://twitter.com/iChromeHQ)

ProductivityTab is a highly customizable, iGoogle homepage replacement extension influenced by Google Now. It includes almost 100 HD themes, over 30 widgets, support for multiple tabs, "OK Google" hotword detection and voice search, internationalization support and almost complete customization.

This is the full source for ProductivityTab except for API secrets which have been replaced with placeholders.

## Jump to Section

* [Setup](#setup)
* [Road Map](#road-map)
* [Contributing](#contributing)
* [Style Guide](#style-guide)
* [License](#license)

## Setup
[[Back To Top]](#jump-to-section)

Follow these steps to run ProductivityTab in Google Chrome as a developer.

- Open the url chrome://extensions/ in Google Chrome.
- Click to enable *Developer mode* so that you see developer options.
- Click the "Load unpackaged extensions..."
- Browse to the location where ProductivityTab repo is installed, and select the sub-directory `ProductivityTab/app` as the extension source.

> If you already have ProductivityTab installed from the Google Play store, then remove the extension before doing the above.

## Road Map
[[Back To Top]](#jump-to-section)

#### V2.x

 - A real website

### V2.2

These are very much in flux, any of them could be postponed or skipped.

##### ProductivityTab Pro:

   - Prioritized support and suggestions
   - 2 fully synced themes per tab.
   - The ability to create dynamic custom themes (video, slide-shows, time and date dependent) that are hosted on ProductivityTab servers
   - 30 online backups
   - "Parental" controls with the ability to blacklist widgets and lock configurations remotely
   - Possibly maximizable widgets
   - Various widget features including real-time stocks with charts, real-time analytics, more accurate weather, etc.

## Contributing
[[Back To Top]](#jump-to-section)

If you'd like to contribute, please fork the repo and submit a pull request.

## Style Guide
[[Back To Top]](#jump-to-section)

 - Code is indented with 4 space tabs, never spaces
 - Double quotes are always used unless the string contains double quotes, such as with HTML
 - Trailing semicolons are always used
 - When multiple variables are being defined at the top of a function they should generally be combined into one `var` statement
 - Ternary operators are fine especially for string concatenation
 - Performance should always be favored over readability for small snippets. i.e. `$(body).append($('<div></div>').attr("data-id", id.split("-")[1]))` instead of `var elm = $('<div></div>'), id = id.split("-")[1]; elm.attr("data-id", id)....`

## License
[[Back To Top]](#jump-to-section)

ProductivityTab is licensed under a [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-sa/3.0/deed.en_US).

Basically, feel free to use the code however you want as long as you give credit. And, if you don't mind please let me know.