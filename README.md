# Alog log-code generator

Alog code generator provides a vscode extension capability to automatically generate, suggest / insert log code as used by [alchemy-logging](https://github.com/IBM/alchemy-logging) library.

## Usage

### Configuring log prefix
- `cmd+shift+p` (open command palate for vscode)
- Select `Configure Alog Code Generator`
- Add 3 character log code prefix. NOTE: if the length is not 3 characters, the configurator will not accept
- This configuration is per workspace. So, for every project, this would need to be done separately
- Without this configuration. alog-code-generator will use default, i.e `$UNK$` as the prefix

### Using code generation
- After typing `log.<level>("` (where `<level>` refers to log level), press `cmd+shift+a` for mac and `ctrl+shift+a` for windows/linux system
- This will automatically complete the log code along with the level suffix. (Check features, section below)
- NOTE: This will also add prefix, if not entered by the user already. The prefix here refers to the 3 char library prefix that is standard convention in alog. If the log prefix is not configured, the log auto-completion will use `$UNK$` as the prefix.

### Using auto complete feature
- After typing usual log line, start your log code with `<` character. This will trigger auto-completion and extension will propose a log code with suffix
- For selecting the log code, simply press `Enter`

## Features

1. Provides easy way of generating 6 digit log code along with log-level suffix on pressing `cmd+shift+a` for mac and `ctrl+shift+a` for windows/linux systems.
2. Based on the line being written, alog code generator automatically figures out the level of the log code and assigns suffix to the log code. For example:
   1. `log.info` -> `I`
   2. `error.type_check` -> `E`
   3. `log.error` -> `E`
3. Allow workspace level configuration of log code prefix using vscode command palate
4. Provide auto complete suggestion for the log code, triggered by `<` character when writing the log line

## Requirements

coming soon.

## Extension Settings

coming soon.

## Known Issues

coming soon.

## Release process

### Local
1. Install `npm install -g vsce`
    - vsce, short for "Visual Studio Code Extensions", is a command-line tool for packaging, publishing and managing VS Code extensions.
2. Go to root directory of the extension: `cd alog-extension`
3. Install package and depdendencies: `npm install`
4. Create extension package: `vsce package --baseContentUrl https://github.ibm.com/Gaurav-Kumbhat/alog-extension`
   1. We need to provide `--baseContentUrl` since we do not have it available in public github.

### Installation
1. Open command menu: `Cmd+shift+p`
2. Select `Extension: Install Extensions`
3. On the left hand side extension panel, click on three horizontal dots, `...`
4. Select `Install from VSIX`
5. Find path to above generated `.vsix` file and install the package.
6. Enjoy extension!

## Release Notes

Refer to [change logs](CHANGELOG.md)

-----------------------------------------------------------------------------------------------------------
## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

### References:
- Package and Publishing: https://code.visualstudio.com/api/working-with-extensions/publishing-extension


**Enjoy!**
