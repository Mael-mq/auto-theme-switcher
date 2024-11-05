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
    if (!timezone){ return; };

	// Récupère uniquement les extensions qui sont des thèmes
    const themeExtensions = vscode.extensions.all.filter(extension =>
        extension.packageJSON.contributes && extension.packageJSON.contributes.themes
    );

    // Extraire les noms des thèmes sombres et clairs
    const themeNames = themeExtensions.flatMap(extension =>
        extension.packageJSON.contributes.themes.map((theme: any) => theme.label)
    );

    // Sélection du thème clair
    const lightTheme = await vscode.window.showQuickPick(themeNames, {
        placeHolder: 'Select your light theme',
    });
    if (!lightTheme){ return; };

    // Sélection du thème sombre
    const darkTheme = await vscode.window.showQuickPick(themeNames, {
        placeHolder: 'Select your dark theme',
    });
    if (!darkTheme){ return; };

    // Sauvegarde des paramètres
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.timezone', timezone, true);
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.lightTheme', lightTheme, true);
    vscode.workspace.getConfiguration().update('autoThemeSwitcher.darkTheme', darkTheme, true);

	checkAndSwitchTheme();
}

function checkAndSwitchTheme() {
    console.log('Cheking theme');
    const config = vscode.workspace.getConfiguration('autoThemeSwitcher');
    const timezone = config.get<string>('timezone');
    const lightTheme = config.get<string>('lightTheme');
    const darkTheme = config.get<string>('darkTheme');
    if (!timezone || !lightTheme || !darkTheme){ return; };

    const now = new Date();
    const times = SunCalc.getTimes(now, 48.8566, 2.3522); // Coordonnées pour l'exemple, Paris
    const isDay = now > times.sunrise && now < times.sunset;
	
    if (isDay /* && currentTheme !== 'light' */) {
        vscode.workspace.getConfiguration().update('workbench.colorTheme', lightTheme, vscode.ConfigurationTarget.Global);
        console.log(lightTheme);
        currentTheme = 'light';
    } else if (!isDay /* && currentTheme !== 'dark' */) {
        vscode.workspace.getConfiguration().update('workbench.colorTheme', darkTheme, vscode.ConfigurationTarget.Global);
        currentTheme = 'dark';
    }
}

export function deactivate() {}
