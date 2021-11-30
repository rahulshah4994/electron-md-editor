const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");

var mainWindow = null;

app.on("ready", () => {
	mainWindow = new BrowserWindow({
		show: false,
		webPreferences: {
			preload: __dirname + "/preload.js",
		},
	});
	mainWindow.loadFile(__dirname + "/index.html");
	mainWindow.once("ready-to-show", () => {
		mainWindow.show();
	});
});

ipcMain.handle("get-file-from-user", async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog({
		title: "Select Fire Sale File",
		properties: ["openFile"],
		buttonLabel: "Unveil",
		filters: [
			{ name: "Markdown Files", extensions: ["md", "mdown", "markdown"] },
			{ name: "Text Files", extensions: ["txt", "text"] },
		],
	});

	if (canceled) return;

	const filePath = filePaths[0];

	return filePath;
});

ipcMain.handle("save-file", async (event, ...args) => {
	let [filePath, content] = args;

	if (!filePath) {
		data = await dialog.showSaveDialog();
		if (data.canceled) return;
		filePath = data.filePath;
	}

	fs.writeFile(filePath, content, (err) => {
		if (err) {
			console.error(err);
		}
	});
	const file = path.basename(filePath);
	return { file, filePath };
});

ipcMain.handle("read-file", (event, filePath) => {
	const file = path.basename(filePath);
	const content = fs.readFileSync(filePath).toString();

	return { file, content };
});
