import * as vscode from 'vscode';

var SunCalc = require('suncalc');

// Stocke le dernier thème utilisé pour éviter les changements fréquents
let currentTheme: 'light' | 'dark';

export function activate(context: vscode.ExtensionContext) {
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
    const timezone = await vscode.window.showQuickPick([
        'UTC−5', 'UTC+1', 'UTC+2', // liste d'exemples
    ], { placeHolder: 'Select your timezone' });
    if (!timezone) { return; };

    // Récupère uniquement les extensions qui sont des thèmes
    const themeExtensions = vscode.extensions.all.filter(extension =>
        extension.packageJSON.contributes && extension.packageJSON.contributes.themes
    );

    // Extraire les noms des thèmes sombres et clairs
    const themeChoices = themeExtensions.flatMap(extension =>
        extension.packageJSON.contributes.themes.map((theme: any) => ({
            label: theme.label,
            value: theme.id
        }))
    );

    // Sélection du thème clair
    const lightThemeChoice = await vscode.window.showQuickPick(themeChoices.map(theme => theme.label), {
        placeHolder: 'Select your light theme',
    });
    const lightTheme = themeChoices.find(theme => theme.label === lightThemeChoice)?.value;
    if (!lightTheme) { return; };

    // Sélection du thème sombre
    const darkThemeChoice = await vscode.window.showQuickPick(themeChoices.map(theme => theme.label), {
        placeHolder: 'Select your dark theme',
    });
    const darkTheme = themeChoices.find(theme => theme.label === darkThemeChoice)?.value;
    if (!darkTheme) { return; };

    // Sauvegarde des paramètres
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.timezone', timezone, true);
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.lightTheme', lightTheme, true);
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.darkTheme', darkTheme, true);
    forceCheckAndSwitchTheme(lightTheme, darkTheme);
}

function checkAndSwitchTheme() {
    console.log('Cheking theme');
    const config = vscode.workspace.getConfiguration('autoThemeSwitcher');
    const timezone = config.get<string>('timezone');
    const lightTheme = config.get<string>('lightTheme');
    const darkTheme = config.get<string>('darkTheme');
    if (!timezone || !lightTheme || !darkTheme) { return; };

    const now = new Date();
    const times = SunCalc.getTimes(now, 48.8566, 2.3522); // Coordonnées pour l'exemple, Paris
    const isDay = now > times.sunrise && now < times.sunset;

    if (isDay && currentTheme !== 'light') {
        console.log('Switching to light theme');
        vscode.workspace.getConfiguration().update('workbench.colorTheme', lightTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'light';
    } else if (!isDay && currentTheme !== 'dark') {
        console.log('Switching to dark theme');
        vscode.workspace.getConfiguration().update('workbench.colorTheme', darkTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'dark';
    }
}

function forceCheckAndSwitchTheme(lightTheme: string, darkTheme: string) {
    console.log('Forcing theme');
    const config = vscode.workspace.getConfiguration('autoThemeSwitcher');
    const timezone = config.get<string>('timezone');
    if (!timezone || !lightTheme || !darkTheme) { return; };

    const now = new Date();
    const times = SunCalc.getTimes(now, 48.8566, 2.3522); // Coordonnées pour l'exemple, Paris
    const isDay = now > times.sunrise && now < times.sunset;

    if (isDay) {
        console.log('Force switching to light theme');
        console.log(lightTheme);
        vscode.workspace.getConfiguration().update('workbench.colorTheme', lightTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'light';
    } else if (!isDay) {
        console.log('Force switching to dark theme');
        vscode.workspace.getConfiguration().update('workbench.colorTheme', darkTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'dark';
    }
}

export function deactivate() { }
