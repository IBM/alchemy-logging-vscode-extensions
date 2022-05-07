// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getVSCodeConfig } from "./config";
import { Trigger } from "./trigger_enum";
import * as constants from './constants';
import { Console } from 'console';

const vscodeConfig = getVSCodeConfig();

// NOTE: Can be added to global config
const digitCount = 6;


const errorFirstRegex = new RegExp('(error)\..+\\(\"', 'gs');
const logFirstRegex = new RegExp("^log\.([a-z]{4,7}[1-5]?)\\(\"", "gs");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "alog-code-generator" is now active!');

	function registerCommandNice(commandId: string, run: (...args: any[]) => void): void {
		context.subscriptions.push(vscode.commands.registerCommand(commandId, run));
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// registerCommandNice("alog-code-generator.log_code", () => {
	// 	vscode.window.showInformationMessage("");
	// });

	// Get log code via command
	registerCommandNice("extension.log_code", (args) => {

		const activeEditor = vscode.window.activeTextEditor;
		const searchWindow = 10;
		const startPosition: number = 0;
		var lineNumber: number;
		var rawLineText: string;
		var activePosition: number;
		var logCodeSuffix: string | undefined;

		if (activeEditor) {
			lineNumber = activeEditor.selection.active.line;
			activePosition = activeEditor.selection.active.character;
			rawLineText = activeEditor.document.lineAt(activeEditor.selection.active.line).text;

			const levelPatternMatch: RegExpMatchArray | null  = errorFirstRegex.exec(rawLineText) || logFirstRegex.exec(rawLineText);

			if (levelPatternMatch != null && levelPatternMatch?.length > 0) {
				const matchedCapture = levelPatternMatch[1];
				const logCodeSuffix = constants.pythonLogKeywords.get(matchedCapture);
				if (logCodeSuffix != undefined) {
					const logCodeNumber = generate(digitCount);
					const suggestedLogCode = logCodeNumber + logCodeSuffix;
					activeEditor.edit(editBuilder => {
						editBuilder.insert(new vscode.Position(lineNumber, activePosition), suggestedLogCode)
					})
				}
			}
		}
	});

	// NOTE: Auto suggest functinality will be in phase 2
	// let autoSuggestor = vscode.languages.registerCompletionItemProvider(
	// 	'python',
	// 	{ provideCompletionItems },
	// 	Trigger.DOT
	// );
	// context.subscriptions.push(disposable, autoSuggestor);


}

// this method is called when your extension is deactivated
export function deactivate() {}

// Log code generator function
async function provideCompletionItems(
	document: vscode.TextDocument,
	position: vscode.Position,
	token?: vscode.CancellationToken,
	context?: vscode.CompletionContext
) {
	const offset = document.offsetAt(position);
	const beforeStartOffset = Math.max(0, offset - vscodeConfig.charLimit);
	const afterEndOffset = offset + 5;
	const beforeStartPosition = document.positionAt(beforeStartOffset);
	const afterEndPosition = document.positionAt(afterEndOffset);
	const beforeStartPositionText = document.getText(
		new vscode.Range(beforeStartPosition, position)
	);
	const afterEndPositionText: string = document.getText(
		new vscode.Range(position, afterEndPosition)
	);

	vscode.window.showInformationMessage(`reached here: ${constants.pythonLogKeywords}`);

	const logCodeNumber = generate(digitCount);

	vscode.window.showInformationMessage(`${afterEndPositionText}`);
	if (constants.pythonLogKeywords.has(afterEndPositionText)) {
		vscode.window.showInformationMessage(`afterEndPositionText: ${afterEndPositionText}`);
		const suffix = constants.pythonLogKeywords.get(afterEndPositionText);
		const suggestedLogCode = logCodeNumber + suffix;
		const completionItem = new vscode.CompletionItem(suggestedLogCode);
		return new vscode.CompletionList([completionItem], true);
	}
	return new vscode.CompletionList([], true);
}

function generate(n: number): string {
	var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

	if ( n > max ) {
			return generate(max) + generate(n - max);
	}

	max        = Math.pow(10, n + add);
	var min    = max/10; // Math.pow(10, n) basically
	var number = Math.floor( Math.random() * (max - min + 1) ) + min;

	return ("" + number).substring(add);
}