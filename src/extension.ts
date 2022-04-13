// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getVSCodeConfig } from "./config";
import { Trigger } from "./trigger_enum";
import * as constants from './constants';

const pythonLogKeywords = constants.pythonLogKeywords;

const vscodeConfig = getVSCodeConfig();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "alog-code-generator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('alog-code-generator.log_code', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('This is Alog-Code Generator!');
	});

	let autoSuggestor = vscode.languages.registerCompletionItemProvider(
		'python',
		{ provideCompletionItems },
		Trigger.DOT
	);

	context.subscriptions.push(disposable, autoSuggestor);
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
	vscode.window.showInformationMessage(`reached here: ${JSON.stringify(pythonLogKeywords)}`);
	const digitCount = 6;
	const logCodeNumber = generate(digitCount);

	vscode.window.showInformationMessage(`${afterEndPositionText}`);
	if (pythonLogKeywords.has(afterEndPositionText)) {
		vscode.window.showInformationMessage(`afterEndPositionText: ${afterEndPositionText}`);
		const suffix = pythonLogKeywords.get(afterEndPositionText);
		const suggestedLogCode = logCodeNumber + suffix;
		const completionItem = new vscode.CompletionItem(suggestedLogCode);
		return new vscode.CompletionList([completionItem], true);
	}
	return new vscode.CompletionList([], true);
}

// Utility functions
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