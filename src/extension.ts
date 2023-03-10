// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { defaultLogFirstNames, errorFirstRegex, getLogFirstRegex, prefixCheckRegex } from "./regex/python";
import { getVSCodeConfig } from "./config";
import { Trigger } from "./trigger_enum";
import * as constants from './constants';

const vscodeConfig = getVSCodeConfig();

const logCodePrefixDefault: string = "$UNK$";
const logCodePrefixKey: string = "logCodePrefix";

const lineLookupLimit: number = 2;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {

  // As soon as the extension is activated, configure the workspace state
  // with default logCodePrefix
  context.workspaceState.update('logCodePrefix', logCodePrefixDefault);
  context.workspaceState.update('logVariableNames', defaultLogFirstNames);

  function registerCommandNice(commandId: string, run: any, ): void {
	  context.subscriptions.push(vscode.commands.registerCommand(commandId, run, [context]));
  }

	// Configure log code prefix
	registerCommandNice("extension.config_log_code_prefix", () => {configLogCodePrefix(context)});

	// Configure logger variable name
	registerCommandNice("extension.config_log_varname", () => {configLoggerVarName(context)});

	// Get log code via command
	registerCommandNice("extension.log_code",  () => {insertLogCode(context)});

	// Configure auto suggest / completion
	const autoSuggestor = vscode.languages.registerCompletionItemProvider(
		'python',
		{
			provideCompletionItems(
				document: vscode.TextDocument,
				position: vscode.Position,
				token: vscode.CancellationToken,
				completionContext: vscode.CompletionContext) {

				return provideCompletionItems(document, position, context, token, completionContext);
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
 * @param extensionContext: Context of the active extension
 * @param _token (Not used)
 * @param _completionContext (Not used)
 * @returns vscode.CompletionList
 */
function provideCompletionItems(
	document: vscode.TextDocument,
	position: vscode.Position,
	extensionContext: vscode.ExtensionContext,
	_token?: vscode.CancellationToken,
	_completionContext?: vscode.CompletionContext) {

	let logCodeSuffix: string | undefined;

	const logVarNames: string[] = extensionContext.workspaceState.get('logVariableNames', defaultLogFirstNames);

	// const rawLineText: string = document.lineAt(position.line).text.trimStart();

	// NOTE: In order to support formatters, we are considering multiple lines here
	for (let lineCount=0; lineCount < lineLookupLimit; lineCount++) {
		const rawLineText: string = document.getText(
			new vscode.Range(
				new vscode.Position(position.line-lineCount, 0),
				position)
		).trim();

		const levelPatternMatch: RegExpMatchArray | null =
			errorFirstRegex.exec(rawLineText) || getLogFirstRegex(logVarNames).exec(rawLineText);

		if (levelPatternMatch !== null && levelPatternMatch?.length > 0 && extensionContext) {
			const matchedCapture = levelPatternMatch[1];

			logCodeSuffix = constants.pythonLogKeywords.get(matchedCapture);
			if (logCodeSuffix !== undefined) {
				const logCodeNumber = generate(constants.digitCount);
					// NOTE: There is a > suffix added in below line
					let suggestedLogCode = `${logCodeNumber + logCodeSuffix}>`;

					// Prefix check not available here, since the trigger is <
					const logCodePrefix = extensionContext.workspaceState.get(logCodePrefixKey);

					// NOTE: < prefix already present
					suggestedLogCode = `${logCodePrefix}${suggestedLogCode}`;
					const codeCompletion = new vscode.CompletionItem(suggestedLogCode);

					return new vscode.CompletionList([codeCompletion], true);

			}
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

	const logVarNames: string[] = context.workspaceState.get('logVariableNames', defaultLogFirstNames);

	if (activeEditor) {
		activePosition = activeEditor.selection.active;
		// NOTE: In order to support formatters, we are considering multiple lines here
		for (let lineCount=0; lineCount < lineLookupLimit; lineCount++) {

			rawLineText = activeEditor.document.getText(
				new vscode.Range(
					new vscode.Position(activeEditor.selection.active.line - lineCount, 0),
					activeEditor.selection.active)
			).trim();

			// rawLineText = activeEditor.document.lineAt(activeEditor.selection.active.line).text.trimStart();

			const levelPatternMatch: RegExpMatchArray | null =
				errorFirstRegex.exec(rawLineText) || getLogFirstRegex(logVarNames).exec(rawLineText);

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
}

/**
 * Function to take log code prefix as an input from user and
 * save it in workspaceState
 * @param vscode.ExtensionContext
 */
 async function configLogCodePrefix(context: vscode.ExtensionContext): Promise<void> {
	await setCodePrefix(context);
}

/**
 * Function to take log code prefix as an input from user and
 * save it in workspaceState
 * @param vscode.ExtensionContext
 */
async function configLoggerVarName(context: vscode.ExtensionContext): Promise<void> {
	await setVarName(context);
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
 export async function setCodePrefix(context: vscode.ExtensionContext) {

	const errorMessage: string = 'Incorrect length. The prefix should be of 3 characters!';
	const result: string | undefined = await vscode.window.showInputBox({
		value: '',
		placeHolder: 'For example: ABC',
		validateInput: text => {
			// vscode.window.showInformationMessage(`Validating: ${text}`);
			return text.length !== 3 ? errorMessage : null;
		}
	});
	// Store the configured value in workspace state
	if (result) {
		context.workspaceState.update('logCodePrefix', result);
	}

	vscode.window.showInformationMessage(`Configured '${result}' as log code prefix for this project!`);
}

/**
 * Shows an input box using window.showInputBox(). and stores list of variable names
 */
export async function setVarName(context: vscode.ExtensionContext) {

	// Get existing value from workspaceState
	const existingValues: string[]  = context.workspaceState.get('logVariableNames', defaultLogFirstNames);
	const result: string | undefined = await vscode.window.showInputBox({
		value: existingValues.toString(),
		placeHolder: 'LOGGER,log',
	});
	// Store the configured value in workspace state
	if (result) {
		const newValues = result.split(',');
		context.workspaceState.update('logVariableNames', newValues);
	}

	vscode.window.showInformationMessage(`Configured '${result}' as variable names for this project!`);
}