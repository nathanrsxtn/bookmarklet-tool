const scriptToSelfExecuter = script => script.startsWith("(") ? `javascript:${script}` : `javascript:(async function(){${script}})();`;
const generateIcon = (icon, size) => {
    const canvas = Object.assign(document.createElement("canvas"), { width: size, height: size });
    const ctx = Object.assign(canvas.getContext("2d"), { font: `${size}px monospace`, textBaseline: "middle", textAlign: "center", fillStyle: "#FF0" });
    ctx.fillText(icon, size / 2, size / 2);
    return Object.assign(document.createElement("img"), { src: canvas.toDataURL("image/png") });
}
const dragImageSize = 40;
const dragImage = generateIcon("★", dragImageSize);
const bookmarkletLink = document.getElementById("bookmarkletLink");
const bookmarkletNameText = document.getElementById("bookmarkletNameText");
const gistIdInput = document.getElementById("gistIdInput");
const gistLink = document.getElementById("gistLink");
const gistFileNameText = document.getElementById("gistFileNameText");
const gistOwnerText = document.getElementById("gistOwnerText");
const gistFileContentText = document.getElementById("gistFileContentText");
const updatePage = (gistId, gistDescription, gistLinkHref, gistFileName, gistAuthorName, gistFileContent, isValid) => {
    gistLink.href = gistLinkHref;
    gistFileNameText.innerText = gistFileName;
    gistOwnerText.innerText = gistAuthorName
    gistFileContentText.innerText = gistFileContent;
    bookmarkletNameText.innerText = gistDescription;
    bookmarkletLink.href = isValid ? scriptToSelfExecuter(gistFileContent) : "";
    history.replaceState(null, null, `${location.origin}${window.location.pathname}?gist=${gistId}`);
};
bookmarkletLink.ondragstart = e => e.dataTransfer.setDragImage(dragImage, dragImageSize / 2, dragImageSize / 2);
bookmarkletLink.onclick = e => e.preventDefault();
gistIdInput.oninput = async e => {
    const gistId = gistIdInput.value;
    const apiResponse = await fetch(`https://api.github.com/gists/${gistId}`);
    const apiResponseJson = await apiResponse.json();
    if (!apiResponse.ok) updatePage(gistId, "", "", apiResponse.status, "", apiResponseJson["message"], false);
    else {
        const gistFile = Object.entries(apiResponseJson["files"])[0][1];
        updatePage(gistId, apiResponseJson["description"], apiResponseJson["html_url"], gistFile["filename"], apiResponseJson["owner"]["login"], gistFile["content"], true);
    }
};
let queryGistId = new URLSearchParams(window.location.search).get("gist");
if (queryGistId) {
    gistIdInput.value = queryGistId;
    gistIdInput.oninput();
}