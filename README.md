# Alog log-code generator

Alog code generator provides a vscode extension capability to automatically generate, suggest / insert log code as used by [alchemy-logging](https://github.com/IBM/alchemy-logging) library.

## Features

1. Provides easy way of generating 6 digit log code along with log-level suffix on pressing `cmd+shift+a` for mac and `ctrl+shift++a` for windows/linux systems.
2. Based on the line being written, alog code generator automatically figures out the level of the log code and assigns suffix to the log code. For example:
   1. `log.info` -> `I`
   2. `error.type_check` -> `E`
   3. `log.error` -> `E`

## Requirements

coming soon.

## Extension Settings

coming soon.

## Known Issues

coming soon.

## Release process

### Local
1. Install `npm install -g vsce1`
    - vsce, short for "Visual Studio Code Extensions", is a command-line tool for packaging, publishing and managing VS Code extensions.
2. Go to root directory of the extension: `cd alog-extension`
3. Install package and depdendencies: `npm install`
4. Create extension package: `vsce package`

### Installation
1. Open command menu: `Cmd+shift+p`
2. Select `Extension: Install Extensions`
3. On the left hand side extension panel, click on three horizontal dots, `...`
4. Select `Install from VSIX`
5. Find path to above generated `.vsix` file and install the package.
6. Enjoy extension!

## Release Notes

### 0.0.1
- Provides log code completion with press of `cmd+shift+a` command on mac and `ctrl+shift+a` on windows/linux
- Automatic resolution of log level, based on the line being written.

-----------------------------------------------------------------------------------------------------------
## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (macOS) to see a list of Markdown snippets

### References:
- Package and Publishing: https://code.visualstudio.com/api/working-with-extensions/publishing-extension


**Enjoy!**
