import * as vscode from "vscode";

interface Config {
	enable: boolean;
	debug: boolean;
	maxNumberOfResults: number;
	disabledLanguagesIds: string[];
	requestTimeout: number;
	charLimit: number;
}

export function getVSCodeConfig(): Config {
	return vscode.workspace.getConfiguration("tabnine") as any;
}
