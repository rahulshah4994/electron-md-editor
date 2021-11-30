const { contextBridge, ipcRenderer } = require("electron");
const marked = require("marked");

contextBridge.exposeInMainWorld("electron", {
	getFileFromUser: () => ipcRenderer.invoke("get-file-from-user"),
	saveFile: (file, content) => ipcRenderer.invoke("save-file", file, content),
	readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
	marked,
});
