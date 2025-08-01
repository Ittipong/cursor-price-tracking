# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VSCode extension project called "Cursor Price Tracking" built with TypeScript. The extension is designed to track Cursor pricing and is currently in its initial development phase with a basic "Hello World" command structure.

## Development Commands

### Build and Compilation
- `npm run compile` - Compile TypeScript source files to JavaScript in the `out/` directory
- `npm run watch` - Watch for changes and automatically recompile TypeScript files
- `npm run vscode:prepublish` - Prepare extension for publishing (runs compile)

### Testing and Development
- Press `F5` in VSCode to launch Extension Development Host with the extension loaded
- Use Command Palette (`Ctrl+Shift+P`) to test commands like "Hello World"

## Architecture

### Core Structure
- **Entry Point**: `src/extension.ts` contains the main `activate()` and `deactivate()` functions
- **Build Output**: TypeScript compiles to `out/extension.js` which serves as the extension's main entry point
- **Extension Manifest**: `package.json` defines extension metadata, commands, activation events, and contributions to VSCode

### VSCode Extension Architecture
The extension follows the standard VSCode extension pattern:
- `activate()` function registers commands and sets up event listeners when extension is activated
- Commands are registered via `vscode.commands.registerCommand()` and must be declared in `package.json` contributes section
- All disposables should be added to `context.subscriptions` for proper cleanup

### TypeScript Configuration
- Target: ES2020 with CommonJS modules
- Strict mode enabled for type safety
- Source maps generated for debugging
- Root directory: `src/`, output directory: `out/`

### Development Workflow
The extension uses VSCode's built-in debugging configuration (`.vscode/launch.json`) that automatically compiles TypeScript before launching the Extension Development Host. The build task is configured in `.vscode/tasks.json` to use TypeScript compiler with problem matchers for error reporting.