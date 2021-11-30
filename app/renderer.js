let lastSavedContent = "";
let currentContent = "";
let loadedFilePath = null;
let loadedFileName = null;
let savedHtmlPath = null;

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");

document.addEventListener("dragstart", (e) => e.preventDefault());
document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("dragleave", (e) => e.preventDefault());
document.addEventListener("drop", (e) => e.preventDefault());

const fileTypeIsSupported = (file) => {
	return ["text/plain", "text/markdown"].includes(file.type);
};

markdownView.addEventListener("dragover", (e) => {
	const file = e.dataTransfer.items[0];

	if (fileTypeIsSupported(file)) {
		markdownView.classList.add("drag-over");
	} else {
		markdownView.classList.add("drag-error");
	}
});

markdownView.addEventListener("dragleave", (e) => {
	markdownView.classList.remove("drag-over");
	markdownView.classList.remove("drag-error");
});

markdownView.addEventListener("drop", (e) => {
	const file = e.dataTransfer.items[0];

	markdownView.classList.remove("drag-over");
	markdownView.classList.remove("drag-error");

	if (fileTypeIsSupported) {
		console.log(file.getAsFile());
		openFile(file.getAsFile().path);
	}
});

const updateUI = () => {
	let title = "Fire Sale";
	const isEdited = currentContent !== lastSavedContent;
	if (loadedFileName) {
		title = `${loadedFileName} - ${title}`;
	}
	if (isEdited) {
		title = `${title} (Unsaved)`;
	}
	document.title = title;

	saveMarkdownButton.disabled = !isEdited;
	revertButton.disabled = !isEdited;
};

const renderMarkdownToHtml = (markdown) => {
	htmlView.innerHTML = window.electron.marked(markdown, { sanitize: true });
};

revertButton.addEventListener("click", () => {
	currentContent = lastSavedContent;
	markdownView.value = currentContent;
	renderMarkdownToHtml(currentContent);
	updateUI();
});

saveMarkdownButton.addEventListener("click", async () => {
	const data = await window.electron.saveFile(loadedFilePath, currentContent);
	if (data) {
		const { file, filePath } = data;
		loadedFilePath = filePath;
		loadedFileName = file;
		lastSavedContent = currentContent;
		updateUI();
	}
});

saveHtmlButton.addEventListener("click", async () => {
	const data = await window.electron.saveFile(
		savedHtmlPath,
		htmlView.innerHTML
	);
	if (data) {
		const { file, filePath } = data;
		savedHtmlPath = filePath;
		loadedFileName = file;
		lastSavedContent = currentContent;
		updateUI();
	}
});

markdownView.addEventListener("keyup", (event) => {
	currentContent = event.target.value;
	renderMarkdownToHtml(currentContent);
	updateUI();
});

openFileButton.addEventListener("click", async () => {
	const filePath = await window.electron.getFileFromUser();
	if (!filePath) return;

	openFile(filePath);
});

const openFile = async (filePath) => {
	const { file, content } = await window.electron.readFile(filePath);

	loadedFilePath = filePath;
	loadedFileName = file;
	lastSavedContent = content;
	currentContent = content;
	markdownView.value = content;
	renderMarkdownToHtml(content);
	updateUI();
};
