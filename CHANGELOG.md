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