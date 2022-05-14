# Change Log

All notable changes to the "alog-code-generator" extension will be documented in this file.

<!-- Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file. -->

## [Local Releases]

- 0.1.0
  - Provides easy way of generating 6 digit log code along with log-level suffix on pressing `cmd+shift+a` for mac and `ctrl+shift+a` for windows/linux systems.
  - Based on the line being written, alog code generator automatically figures out the level of the log code and assigns suffix to the log code. For example:
   1. `log.info` -> `I`
   2. `error.type_check` -> `E`
   3. `log.error` -> `E`

- 0.2.0
  - Allow workspace level configuration of log code prefix using vscode command palate
- 0.2.1
  - Add support for `error("` pattern for python
- 0.2.2
  - Fix opening and closing angle brackets ('<>')
  - Change unknown prefix from `<UNK>` to `$UNK$` to make it easy to replace after `<` fix
- 0.2.3
  - Fix digit count. Change from 6 to 8
- 0.2.4
  - Add missing warning level log mapping
- 0.2.5
  - Make regex to support single quote