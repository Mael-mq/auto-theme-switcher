import * as vscode from 'vscode';

var SunCalc = require('suncalc');

// Stocke le dernier thème utilisé pour éviter les changements fréquents
let currentTheme: 'light' | 'dark';

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

export function activate(context: vscode.ExtensionContext) {
    // Commande pour configurer le fuseau horaire et les thèmes
    context.subscriptions.push(vscode.commands.registerCommand('autoThemeSwitcher.configure', configureSettings));

    // Lancer le vérificateur de thème toutes les 5 minutes
    const interval = setInterval(checkAndSwitchTheme, 5 * 60 * 1000);
    context.subscriptions.push({ dispose: () => clearInterval(interval) });

    // Exécuter immédiatement pour initialiser le thème
    checkAndSwitchTheme();

    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('autoThemeSwitcher.darkTheme') ||
            e.affectsConfiguration('autoThemeSwitcher.lightTheme') ||
            e.affectsConfiguration('autoThemeSwitcher.timezone')) {

            // Recharger les paramètres et appliquer les modifications si nécessaire
            checkAndSwitchTheme(true);
        }
    });
}

async function getThemesByType() {
    const themes = await vscode.extensions.all.flatMap(extension =>
        (extension.packageJSON.contributes?.themes || []).map((theme: any) => ({
            label: theme.label,
            value: theme.id,
            uiTheme: theme.uiTheme
        }))
    );

    // Filtrer les thèmes sombres et clairs
    const darkThemes = themes.filter(theme => theme.uiTheme === 'vs-dark');
    const lightThemes = themes.filter(theme => theme.uiTheme === 'vs');

    return { darkThemes, lightThemes };
}

async function configureSettings() {
    // Sélection du fuseau horaire
    const timezone = await vscode.window.showQuickPick(timezones.map(tz => tz.label), { placeHolder: 'Select your timezone' });
    if (!timezone) { return; };

    const { darkThemes, lightThemes } = await getThemesByType();

    // Prompt pour le thème clair
    const lightThemeChoice = await vscode.window.showQuickPick(
        lightThemes.map(theme => theme.label),
        { placeHolder: 'Select your preferred light theme' }
    );
    const lightTheme = lightThemes.find(theme => theme.label === lightThemeChoice)?.value;
    if (!lightTheme) { return; };

    // Prompt pour le thème sombre
    const darkThemeChoice = await vscode.window.showQuickPick(
        darkThemes.map(theme => theme.label),
        { placeHolder: 'Select your preferred dark theme' }
    );
    const darkTheme = darkThemes.find(theme => theme.label === darkThemeChoice)?.value;
    if (!darkTheme) { return; };

    // Sauvegarde des paramètres
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.timezone', timezone, true);
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.lightTheme', lightTheme, true);
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.darkTheme', darkTheme, true);
    forceCheckAndSwitchTheme(lightTheme, darkTheme, timezone);
}

function checkAndSwitchTheme(parametersChanged: boolean = false) {
    const config = vscode.workspace.getConfiguration('autoThemeSwitcher');
    const timezone = config.get<string>('timezone');
    const lightTheme = config.get<string>('lightTheme');
    const darkTheme = config.get<string>('darkTheme');
    if (!timezone || !lightTheme || !darkTheme) { return; };

    const isDay = isDaytime(timezone);

    if (parametersChanged) {
        if (isDay) {
            vscode.workspace.getConfiguration().update('workbench.colorTheme', lightTheme, vscode.ConfigurationTarget.Global);
            currentTheme = 'light';
        } else if (!isDay) {
            vscode.workspace.getConfiguration().update('workbench.colorTheme', darkTheme, vscode.ConfigurationTarget.Global);
            currentTheme = 'dark';
        }
    } else {
        if (isDay && currentTheme !== 'light') {
            vscode.workspace.getConfiguration().update('workbench.colorTheme', lightTheme, vscode.ConfigurationTarget.Global);
            currentTheme = 'light';
        } else if (!isDay && currentTheme !== 'dark') {
            vscode.workspace.getConfiguration().update('workbench.colorTheme', darkTheme, vscode.ConfigurationTarget.Global);
            currentTheme = 'dark';
        }
    }
}

function forceCheckAndSwitchTheme(lightTheme: string, darkTheme: string, timezone: string) {
    if (!timezone || !lightTheme || !darkTheme) { return; };

    const isDay = isDaytime(timezone);

    if (isDay) {
        console.log(lightTheme);
        vscode.workspace.getConfiguration().update('workbench.colorTheme', lightTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'light';
    } else if (!isDay) {
        vscode.workspace.getConfiguration().update('workbench.colorTheme', darkTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'dark';
    }
}

function isDaytime(timezoneChoice: string) {
    const now = new Date();
    const lat = timezones.find(tz => tz.label === timezoneChoice)?.lat;
    const lon = timezones.find(tz => tz.label === timezoneChoice)?.lon;
    if (lat && lon) {
        const times = SunCalc.getTimes(now, lat, lon); // Coordonnées pour l'exemple, Paris
        return now > times.sunrise && now < times.sunset;
    }
}

export function deactivate() { }
