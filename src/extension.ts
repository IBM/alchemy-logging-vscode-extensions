// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { errorFirstRegex, logFirstRegex, prefixCheckRegex } from "./regex/python";
import { getVSCodeConfig } from "./config";
import { Trigger } from "./trigger_enum";
import * as constants from './constants';

const vscodeConfig = getVSCodeConfig();

let logCodePrefixDefault: string = "$UNK$";
const logCodePrefixKey: string = "logCodePrefix";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {

  // As soon as the extension is activated, configure the workspace state
  // with default logCodePrefix
  context.workspaceState.update('logCodePrefix', logCodePrefixDefault);

  function registerCommandNice(commandId: string, run: any, ): void {
	  context.subscriptions.push(vscode.commands.registerCommand(commandId, run, [context]));
  }

	// Configure log code prefix
	registerCommandNice("extension.config_log_code_prefix", () => {configLogCodePrefix(context)});

	// Get log code via command
	registerCommandNice("extension.log_code",  () => {insertLogCode(context)});

	// Configure auto suggest / completion
	let autoSuggestor = vscode.languages.registerCompletionItemProvider(
		'python',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, completionContext: vscode.CompletionContext) {

				return provideCompletionItems(document, position, token, completionContext, context);
			}
		},

		Trigger.START_ANGLE
	);

	context.subscriptions.push(autoSuggestor);

}

/**
 * Function to generate log code for auto completion
 * @param document: Active vscode document
 * @param position: Position of the active character triggered by the trigger
 * @param _token (Not used)
 * @param _completionContext (Not used)
 * @param extensionContext: Context of the active extension
 * @returns vscode.CompletionList
 */
function provideCompletionItems(
	document: vscode.TextDocument,
	position: vscode.Position,
	_token?: vscode.CancellationToken,
	_completionContext?: vscode.CompletionContext,
	extensionContext?: vscode.ExtensionContext) {

	let logCodeSuffix: string | undefined;
	// NOTE: In order to support formatters, we are considering multiple lines here
	const rawLineText: string = document.getText(
		new vscode.Range(
			new vscode.Position(position.line-1, 0),
			position)
		).trim();

	// const rawLineText: string = document.lineAt(position.line).text.trimStart();

	const levelPatternMatch: RegExpMatchArray | null =
			errorFirstRegex.exec(rawLineText) || logFirstRegex.exec(rawLineText);

	if (levelPatternMatch !== null && levelPatternMatch?.length > 0 && extensionContext) {
		const matchedCapture = levelPatternMatch[1];
		logCodeSuffix = constants.pythonLogKeywords.get(matchedCapture);
		if (logCodeSuffix !== undefined) {
			const logCodeNumber = generate(constants.digitCount);
				// NOTE: There is a > suffix added in below line
				let suggestedLogCode = `${logCodeNumber + logCodeSuffix}>`;

				// Prefix check not available here, since the trigger is <
				let logCodePrefix = extensionContext.workspaceState.get(logCodePrefixKey);

				// NOTE: < prefix already present
				suggestedLogCode = `${logCodePrefix}${suggestedLogCode}`;
				const codeCompletion = new vscode.CompletionItem(suggestedLogCode);

				return new vscode.CompletionList([codeCompletion], true);

		}
	}

	return new vscode.CompletionList([], true);
}

/**
 * Function to insert appropriate log code at the active cursor position
 * if applicable, i.e if the code determines that this is a log line being written
 * @param args any (not used currently)
 */
async function insertLogCode(context: vscode.ExtensionContext): Promise<void> {

	const activeEditor = vscode.window.activeTextEditor;

	let rawLineText: string;
	let activePosition: vscode.Position;
	let logCodeSuffix: string | undefined;

	if (activeEditor) {
		activePosition = activeEditor.selection.active;
		// NOTE: In order to support formatters, we are considering multiple lines here
		rawLineText = activeEditor.document.getText(
			new vscode.Range(
				new vscode.Position(activeEditor.selection.active.line - 1, 0),
				activeEditor.selection.active)
		).trim();

		// rawLineText = activeEditor.document.lineAt(activeEditor.selection.active.line).text.trimStart();

		const levelPatternMatch: RegExpMatchArray | null =
			errorFirstRegex.exec(rawLineText) || logFirstRegex.exec(rawLineText);

		if (levelPatternMatch !== null && levelPatternMatch?.length > 0) {
			const matchedCapture = levelPatternMatch[1];
			logCodeSuffix = constants.pythonLogKeywords.get(matchedCapture);
			if (logCodeSuffix !== undefined) {
				const logCodeNumber = generate(constants.digitCount);
				// NOTE: There is a > suffix added in below line
				let suggestedLogCode = `${logCodeNumber + logCodeSuffix}>`;

				let logCodePrefix: string | null | undefined = checkPrefixEntered(activeEditor, activePosition);
				if (! logCodePrefix) {
					// if prefix is not entered, lets add one from workspace state
					logCodePrefix = context.workspaceState.get(logCodePrefixKey);
					// NOTE: There is a < prefix added in below line
					suggestedLogCode = `<${logCodePrefix}${suggestedLogCode}`;
				}

				activeEditor.edit(editBuilder => {
					editBuilder.insert(activePosition, suggestedLogCode)
				})
			}
		}
	}
}

/**
 * Function to take log code prefix as an input from user and
 * save it in workspaceState
 * @param vscode.ExtensionContext
 */
 async function configLogCodePrefix(context: vscode.ExtensionContext): Promise<void> {
	await showInputBox(context);
}

// ***************************** Utility Functions *****************************

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

/**
 * Shows an input box using window.showInputBox().
 */
 export async function showInputBox(context: vscode.ExtensionContext) {

	const errorMessage: string = 'Incorrect length. The prefix should be of 3 characters!';
	const result: string | undefined = await vscode.window.showInputBox({
		value: '',
		placeHolder: 'For example: ABC',
		validateInput: text => {
			// vscode.window.showInformationMessage(`Validating: ${text}`);
			return text.length != 3 ? errorMessage : null;
		}
	});
	// Store the configured value in workspace state
	if (result) {
		context.workspaceState.update('logCodePrefix', result);
	}

	vscode.window.showInformationMessage(`Configured '${result}' as log code prefix for this project!`);
}