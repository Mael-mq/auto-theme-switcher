/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
var SunCalc = __webpack_require__(2);
// Stocke le dernier thème utilisé pour éviter les changements fréquents
let currentTheme;
const timezones = [
    { label: "(UTC−12) Baker Island", timezone: "UTC−12", city: "Baker Island", lat: 0.1936, lon: -176.4769 },
    { label: "(UTC−11) American Samoa", timezone: "UTC−11", city: "Pago Pago", lat: -14.2756, lon: -170.7020 },
    { label: "(UTC−10) Honolulu", timezone: "UTC−10", city: "Honolulu", lat: 21.3069, lon: -157.8583 },
    { label: "(UTC−9) Anchorage", timezone: "UTC−9", city: "Anchorage", lat: 61.2181, lon: -149.9003 },
    { label: "(UTC−8) Los Angeles", timezone: "UTC−8", city: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { label: "(UTC−7) Denver", timezone: "UTC−7", city: "Denver", lat: 39.7392, lon: -104.9903 },
    { label: "(UTC−6) Mexico City", timezone: "UTC−6", city: "Mexico City", lat: 19.4326, lon: -99.1332 },
    { label: "(UTC−5) New York", timezone: "UTC−5", city: "New York", lat: 40.7128, lon: -74.0060 },
    { label: "(UTC−4) Santiago", timezone: "UTC−4", city: "Santiago", lat: -33.4489, lon: -70.6693 },
    { label: "(UTC−3) Buenos Aires", timezone: "UTC−3", city: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
    { label: "(UTC−2) South Georgia", timezone: "UTC−2", city: "South Georgia", lat: -54.4296, lon: -36.5879 },
    { label: "(UTC−1) Azores", timezone: "UTC−1", city: "Ponta Delgada", lat: 37.7412, lon: -25.6756 },
    { label: "(UTC) London", timezone: "UTC", city: "London", lat: 51.5074, lon: -0.1278 },
    { label: "(UTC+1) Paris", timezone: "UTC+1", city: "Paris", lat: 48.8566, lon: 2.3522 },
    { label: "(UTC+2) Cairo", timezone: "UTC+2", city: "Cairo", lat: 30.0444, lon: 31.2357 },
    { label: "(UTC+3) Moscow", timezone: "UTC+3", city: "Moscow", lat: 55.7558, lon: 37.6173 },
    { label: "(UTC+4) Dubai", timezone: "UTC+4", city: "Dubai", lat: 25.2048, lon: 55.2708 },
    { label: "(UTC+5) Karachi", timezone: "UTC+5", city: "Karachi", lat: 24.8607, lon: 67.0011 },
    { label: "(UTC+5:30) New Delhi", timezone: "UTC+5:30", city: "New Delhi", lat: 28.6139, lon: 77.2090 },
    { label: "(UTC+6) Dhaka", timezone: "UTC+6", city: "Dhaka", lat: 23.8103, lon: 90.4125 },
    { label: "(UTC+7) Bangkok", timezone: "UTC+7", city: "Bangkok", lat: 13.7563, lon: 100.5018 },
    { label: "(UTC+8) Beijing", timezone: "UTC+8", city: "Beijing", lat: 39.9042, lon: 116.4074 },
    { label: "(UTC+9) Tokyo", timezone: "UTC+9", city: "Tokyo", lat: 35.6895, lon: 139.6917 },
    { label: "(UTC+10) Sydney", timezone: "UTC+10", city: "Sydney", lat: -33.8688, lon: 151.2093 },
    { label: "(UTC+11) Noumea", timezone: "UTC+11", city: "Noumea", lat: -22.2711, lon: 166.4416 },
    { label: "(UTC+12) Auckland", timezone: "UTC+12", city: "Auckland", lat: -36.8485, lon: 174.7633 }
];
function activate(context) {
    // Commande pour configurer le fuseau horaire et les thèmes
    context.subscriptions.push(vscode.commands.registerCommand('autoThemeSwitcher.configure', configureSettings));
    // Lancer le vérificateur de thème toutes les 5 minutes
    const interval = setInterval(checkAndSwitchTheme, 5000 /* 5 * 60 * 1000 */);
    context.subscriptions.push({ dispose: () => clearInterval(interval) });
    // Exécuter immédiatement pour initialiser le thème
    checkAndSwitchTheme();
}
async function configureSettings() {
    // Sélection du fuseau horaire
    const timezone = await vscode.window.showQuickPick(timezones.map(tz => tz.label), { placeHolder: 'Select your timezone' });
    if (!timezone) {
        return;
    }
    ;
    // Récupère uniquement les extensions qui sont des thèmes
    const themeExtensions = vscode.extensions.all.filter(extension => extension.packageJSON.contributes && extension.packageJSON.contributes.themes);
    // Extraire les noms des thèmes sombres et clairs
    const themeChoices = themeExtensions.flatMap(extension => extension.packageJSON.contributes.themes.map((theme) => ({
        label: theme.label,
        value: theme.id
    })));
    // Sélection du thème clair
    const lightThemeChoice = await vscode.window.showQuickPick(themeChoices.map(theme => theme.label), {
        placeHolder: 'Select your light theme',
    });
    const lightTheme = themeChoices.find(theme => theme.label === lightThemeChoice)?.value;
    if (!lightTheme) {
        return;
    }
    ;
    // Sélection du thème sombre
    const darkThemeChoice = await vscode.window.showQuickPick(themeChoices.map(theme => theme.label), {
        placeHolder: 'Select your dark theme',
    });
    const darkTheme = themeChoices.find(theme => theme.label === darkThemeChoice)?.value;
    if (!darkTheme) {
        return;
    }
    ;
    // Sauvegarde des paramètres
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.timezone', timezone, true);
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.lightTheme', lightTheme, true);
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.darkTheme', darkTheme, true);
    forceCheckAndSwitchTheme(lightTheme, darkTheme, timezone);
}
function checkAndSwitchTheme() {
    const config = vscode.workspace.getConfiguration('autoThemeSwitcher');
    const timezone = config.get('timezone');
    const lightTheme = config.get('lightTheme');
    const darkTheme = config.get('darkTheme');
    if (!timezone || !lightTheme || !darkTheme) {
        return;
    }
    ;
    const isDay = isDaytime(timezone);
    if (isDay && currentTheme !== 'light') {
        vscode.workspace.getConfiguration().update('workbench.colorTheme', lightTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'light';
    }
    else if (!isDay && currentTheme !== 'dark') {
        vscode.workspace.getConfiguration().update('workbench.colorTheme', darkTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'dark';
    }
}
function forceCheckAndSwitchTheme(lightTheme, darkTheme, timezone) {
    if (!timezone || !lightTheme || !darkTheme) {
        return;
    }
    ;
    const isDay = isDaytime(timezone);
    if (isDay) {
        console.log(lightTheme);
        vscode.workspace.getConfiguration().update('workbench.colorTheme', lightTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'light';
    }
    else if (!isDay) {
        vscode.workspace.getConfiguration().update('workbench.colorTheme', darkTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'dark';
    }
}
function isDaytime(timezoneChoice) {
    const now = new Date();
    const lat = timezones.find(tz => tz.label === timezoneChoice)?.lat;
    const lon = timezones.find(tz => tz.label === timezoneChoice)?.lon;
    if (lat && lon) {
        const times = SunCalc.getTimes(now, lat, lon); // Coordonnées pour l'exemple, Paris
        return now > times.sunrise && now < times.sunset;
    }
}
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

/*
 (c) 2011-2015, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/moon position and light phases.
 https://github.com/mourner/suncalc
*/

(function () { 'use strict';

// shortcuts for easier to read formulas

var PI   = Math.PI,
    sin  = Math.sin,
    cos  = Math.cos,
    tan  = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad  = PI / 180;

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


// date/time constants and conversions

var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

function toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
function fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
function toDays(date)   { return toJulian(date) - J2000; }


// general calculations for position

var e = rad * 23.4397; // obliquity of the Earth

function rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
function declination(l, b)    { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }

function azimuth(H, phi, dec)  { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
function altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }

function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }

function astroRefraction(h) {
    if (h < 0) // the following formula works for positive altitudes only.
        h = 0; // if h = -0.08901179 a div/0 would occur.

    // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
    // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
    return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
}

// general sun calculations

function solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }

function eclipticLongitude(M) {

    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
        P = rad * 102.9372; // perihelion of the Earth

    return M + C + P + PI;
}

function sunCoords(d) {

    var M = solarMeanAnomaly(d),
        L = eclipticLongitude(M);

    return {
        dec: declination(L, 0),
        ra: rightAscension(L, 0)
    };
}


var SunCalc = {};


// calculates sun position for a given date and latitude/longitude

SunCalc.getPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c  = sunCoords(d),
        H  = siderealTime(d, lw) - c.ra;

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: altitude(H, phi, c.dec)
    };
};


// sun times configuration (angle, morning name, evening name)

var times = SunCalc.times = [
    [-0.833, 'sunrise',       'sunset'      ],
    [  -0.3, 'sunriseEnd',    'sunsetStart' ],
    [    -6, 'dawn',          'dusk'        ],
    [   -12, 'nauticalDawn',  'nauticalDusk'],
    [   -18, 'nightEnd',      'night'       ],
    [     6, 'goldenHourEnd', 'goldenHour'  ]
];

// adds a custom time to the times config

SunCalc.addTime = function (angle, riseName, setName) {
    times.push([angle, riseName, setName]);
};


// calculations for sun times

var J0 = 0.0009;

function julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }

function approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
function solarTransitJ(ds, M, L)  { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }

function hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }
function observerAngle(height) { return -2.076 * Math.sqrt(height) / 60; }

// returns set time for the given sun altitude
function getSetJ(h, lw, phi, dec, n, M, L) {

    var w = hourAngle(h, phi, dec),
        a = approxTransit(w, lw, n);
    return solarTransitJ(a, M, L);
}


// calculates sun times for a given date, latitude/longitude, and, optionally,
// the observer height (in meters) relative to the horizon

SunCalc.getTimes = function (date, lat, lng, height) {

    height = height || 0;

    var lw = rad * -lng,
        phi = rad * lat,

        dh = observerAngle(height),

        d = toDays(date),
        n = julianCycle(d, lw),
        ds = approxTransit(0, lw, n),

        M = solarMeanAnomaly(ds),
        L = eclipticLongitude(M),
        dec = declination(L, 0),

        Jnoon = solarTransitJ(ds, M, L),

        i, len, time, h0, Jset, Jrise;


    var result = {
        solarNoon: fromJulian(Jnoon),
        nadir: fromJulian(Jnoon - 0.5)
    };

    for (i = 0, len = times.length; i < len; i += 1) {
        time = times[i];
        h0 = (time[0] + dh) * rad;

        Jset = getSetJ(h0, lw, phi, dec, n, M, L);
        Jrise = Jnoon - (Jset - Jnoon);

        result[time[1]] = fromJulian(Jrise);
        result[time[2]] = fromJulian(Jset);
    }

    return result;
};


// moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas

function moonCoords(d) { // geocentric ecliptic coordinates of the moon

    var L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
        M = rad * (134.963 + 13.064993 * d), // mean anomaly
        F = rad * (93.272 + 13.229350 * d),  // mean distance

        l  = L + rad * 6.289 * sin(M), // longitude
        b  = rad * 5.128 * sin(F),     // latitude
        dt = 385001 - 20905 * cos(M);  // distance to the moon in km

    return {
        ra: rightAscension(l, b),
        dec: declination(l, b),
        dist: dt
    };
}

SunCalc.getMoonPosition = function (date, lat, lng) {

    var lw  = rad * -lng,
        phi = rad * lat,
        d   = toDays(date),

        c = moonCoords(d),
        H = siderealTime(d, lw) - c.ra,
        h = altitude(H, phi, c.dec),
        // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
        pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));

    h = h + astroRefraction(h); // altitude correction for refraction

    return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: h,
        distance: c.dist,
        parallacticAngle: pa
    };
};


// calculations for illumination parameters of the moon,
// based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
// Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.

SunCalc.getMoonIllumination = function (date) {

    var d = toDays(date || new Date()),
        s = sunCoords(d),
        m = moonCoords(d),

        sdist = 149598000, // distance from Earth to Sun in km

        phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
        inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
        angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
                cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

    return {
        fraction: (1 + cos(inc)) / 2,
        phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
        angle: angle
    };
};


function hoursLater(date, h) {
    return new Date(date.valueOf() + h * dayMs / 24);
}

// calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article

SunCalc.getMoonTimes = function (date, lat, lng, inUTC) {
    var t = new Date(date);
    if (inUTC) t.setUTCHours(0, 0, 0, 0);
    else t.setHours(0, 0, 0, 0);

    var hc = 0.133 * rad,
        h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc,
        h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;

    // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
    for (var i = 1; i <= 24; i += 2) {
        h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
        h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;

        a = (h0 + h2) / 2 - h1;
        b = (h2 - h0) / 2;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + h1;
        d = b * b - 4 * a * h1;
        roots = 0;

        if (d >= 0) {
            dx = Math.sqrt(d) / (Math.abs(a) * 2);
            x1 = xe - dx;
            x2 = xe + dx;
            if (Math.abs(x1) <= 1) roots++;
            if (Math.abs(x2) <= 1) roots++;
            if (x1 < -1) x1 = x2;
        }

        if (roots === 1) {
            if (h0 < 0) rise = i + x1;
            else set = i + x1;

        } else if (roots === 2) {
            rise = i + (ye < 0 ? x2 : x1);
            set = i + (ye < 0 ? x1 : x2);
        }

        if (rise && set) break;

        h0 = h2;
    }

    var result = {};

    if (rise) result.rise = hoursLater(t, rise);
    if (set) result.set = hoursLater(t, set);

    if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;

    return result;
};


// export as Node module / AMD module / browser variable
if (true) module.exports = SunCalc;
else {}

}());


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map