# App Style Builder

## About

App Style Builder is a Wails + React + TypeScript desktop app for creating offline-first design systems, previewing app UI patterns, and exporting AI-ready handoff packs for tools like Codex, Antigravity, Google AI Studio, and other builders.

You can configure the project by editing `wails.json`. More information about the project settings can be found
here: https://wails.io/docs/reference/project-config

## Prerequisites

Install these before running the app locally:

* Go matching the version in `go.mod`.
* Node.js and npm.
* Wails CLI v2:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@v2.12.0
```

On Windows, make sure WebView2 is installed. Most Windows 10/11 systems already include it.

Check your setup with:

```bash
wails doctor
```

## Live Development

Clone the repository, then run the desktop app in live development mode:

```bash
git clone https://github.com/Oblix700/App-Style-builder.git
cd App-Style-builder
wails dev
```

`wails dev` uses the settings in `wails.json` to run `npm install`, start the Vite frontend watcher, and launch the desktop shell with hot reload.

For frontend-only UI work, you can run Vite directly:

```bash
cd frontend
npm install
npm run dev
```

The frontend-only mode is useful for visual iteration, but Wails/Go backend calls require `wails dev`.

## Building

To build a redistributable, production mode package, use `wails build`.
