// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getVSCodeConfig } from "./config";
// import { Trigger } from "./trigger_enum";
import * as constants from './constants';

const vscodeConfig = getVSCodeConfig();

// NOTE: Can be added to global config
const digitCount = 6;


const errorFirstRegex = new RegExp('(error)\..+\\(\"(?:[A-Z]?|[A-Z]{3})', 'gs');
const logFirstRegex = new RegExp("^log\.([a-z]{4,7}[1-5]?)\\(\"(?:[A-Z]?|[A-Z]{3})", "gs");

const prefixCheckRegex = new RegExp('([A-Z]{3})', 'gs');

// For phase 1, i.e with no prefix configuration, we are adding
// prefix consideration in the regex itself
// Once prefix configuration is added, uncomment following regexes
// const errorFirstRegex = new RegExp('(error)\..+\\(\"', 'gs');
// const logFirstRegex = new RegExp("^log\.([a-z]{4,7}[1-5]?)\\(\"", "gs");

let logCodePrefixDefault: string = "<UNK>"

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // This line of code will only be executed once when your extension is activated
  // console.log('Congratulations, your extension "alog-code-generator" is now active!');

  function registerCommandNice(commandId: string, run: any): void {
	  context.subscriptions.push(vscode.commands.registerCommand(commandId, run));
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
	// registerCommandNice("alog-code-generator.log_code", () => {
	// 	vscode.window.showInformationMessage("");
	// });

	// Get log code via command
	registerCommandNice("extension.log_code", insertLogCode);

	// NOTE: Auto suggest functinality will be in phase 2
	// let autoSuggestor = vscode.languages.registerCompletionItemProvider(
	// 	'python',
	// 	{ provideCompletionItems },
	// 	Trigger.DOT
	// );
	// context.subscriptions.push(disposable, autoSuggestor);

}

// this method is called when your extension is deactivated
export function deactivate() { }

// Log code generator function
async function provideCompletionItems(
	document: vscode.TextDocument,
	position: vscode.Position,
	token?: vscode.CancellationToken,
	context?: vscode.CompletionContext) {

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

// Log code insertion
/**
 * Function to insert appropriate log code at the active cursor position
 * if applicable, i.e if the code determines that this is a log line being written
 * @param args any (not used currently)
 */
function insertLogCode(args: any): void {

	const activeEditor = vscode.window.activeTextEditor;
	const searchWindow = 10;
	const startPosition: number = 0;
	let lineNumber: number;
	let rawLineText: string;
	let activePosition: vscode.Position;
	let logCodeSuffix: string | undefined;

	if (activeEditor) {
		lineNumber = activeEditor.selection.active.line;
		activePosition = activeEditor.selection.active;
		rawLineText = activeEditor.document.lineAt(activeEditor.selection.active.line).text.trimStart();

		const levelPatternMatch: RegExpMatchArray | null =
			errorFirstRegex.exec(rawLineText) || logFirstRegex.exec(rawLineText);

		if (levelPatternMatch !== null && levelPatternMatch?.length > 0) {
			const matchedCapture = levelPatternMatch[1];
			logCodeSuffix = constants.pythonLogKeywords.get(matchedCapture);
			if (logCodeSuffix !== undefined) {
				const logCodeNumber = generate(digitCount);
				let suggestedLogCode = logCodeNumber + logCodeSuffix;

				const logCodePrefix = checkPrefixEntered(activeEditor, activePosition);
				// TODO: Get prefix from the configuration
				if (! logCodePrefix) {
					// if prefix is not entered, lets add one
					suggestedLogCode = logCodePrefixDefault + suggestedLogCode;
				}

				activeEditor.edit(editBuilder => {
					editBuilder.insert(activePosition, suggestedLogCode)
				})
			}
		}
	}
}

/**
 * Check if the prefix is already entered by the user or not
 * @param activeEditor
 * @param activePosition
 * @returns boolean: True if already entered else false
 */
function checkPrefixEntered(activeEditor: vscode.TextEditor, activePosition: vscode.Position): string | null {

	// TODO: Add test to check if this gives expected responses for:
	// 	("<UNK>
	// 	"<UNK>
	// 	ABC
	// 	("ABC"

	// Get last 3 chars
	const lastThreeCharPosition = new vscode.Position(
		activePosition.line,
		activePosition.character - 3);
	const lastThreeChars: string = activeEditor.document.getText(
		new vscode.Range(
			lastThreeCharPosition,
			activePosition
		)
	)

	const prefixMatch = prefixCheckRegex.exec(lastThreeChars);

	if (prefixMatch !== null) {
		// Prefix exist
		return prefixMatch[0]
	}

	return null;
}

function generate(n: number): string {
	// 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.
	const add = 1;
	let max = 12 - add;

	if (n > max) {
		return generate(max) + generate(n - max);
	}

	max = Math.pow(10, n + add);
	const min = max / 10; // Math.pow(10, n) basically
	const genNumber = Math.floor(Math.random() * (max - min + 1)) + min;

	return ("" + genNumber).substring(add);
}