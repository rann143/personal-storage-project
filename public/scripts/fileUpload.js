const dropZone = document.querySelector(".upload-area");
const fileInput = document.querySelector(".upload-file-input");
const fileArea = document.querySelector(".selected-file-area");
const mobileUploadBtn = document.querySelector(".mobile-upload-btn");

mobileUploadBtn.addEventListener("click", () => {
  fileInput.click();
});

dropZone.addEventListener("click", () => {
  if (window.innerWidth > 768) {
    // Only trigger on desktop
    fileInput.click();
  }
});

if (window.innerWidth > 768) {
  // Drag and drop handlers
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", dropHandler);
}

fileInput.addEventListener("change", handleFile);

function enableSubmit() {
  let input = document.querySelector(".upload-file-input");
  let submitBtn = document.querySelector(".upload-button");
  let isValid = true;

  if (input.value.trim === "" || input.value === null) {
    isValid = false;
  }

  submitBtn.disabled = !isValid;
}
function disableSubmit() {
  let submitBtn = document.querySelector(".upload-button");

  return (submitBtn.disabled = true);
}

function dropHandler(e) {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  // Get file input
  let input = document.querySelector(".upload-file-input");

  // Get file we were dragging/dropping
  const files = e.dataTransfer.files;

  // Set input value to selected file
  input.files = files;

  handleFile({ target: { files } });
}

function handleFile(e) {
  const files = Array.from(e.target.files);
  fileArea.innerHTML = ""; // Clear existing file

  // Format file size
  const size = formatFileSize(files[0].size);
  // Create file item element
  const fileItem = createFileItem(files[0], size);

  fileArea.appendChild(fileItem);

  enableSubmit();
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function removeFile(button) {
  let input = document.querySelector(".upload-file-input");
  let fileItem = document.querySelector(".file-to-upload");
  fileItem.remove();

  input.value = "";
  disableSubmit();
}

function createFileItem(file, size) {
  // Create main container
  const fileItem = document.createElement("div");
  fileItem.className = "file-to-upload";

  // Create file icon SVG
  const fileIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  fileIcon.setAttribute("class", "file-icon");
  fileIcon.setAttribute("viewBox", "0 0 24 24");
  fileIcon.setAttribute("fill", "none");
  fileIcon.setAttribute("stroke", "currentColor");
  fileIcon.setAttribute("stroke-width", "2");

  const filePath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  filePath.setAttribute(
    "d",
    "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z",
  );

  const polyline = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline",
  );
  polyline.setAttribute("points", "13 2 13 9 20 9");

  fileIcon.appendChild(filePath);
  fileIcon.appendChild(polyline);

  // Create file details container
  const fileDetails = document.createElement("div");
  fileDetails.className = "file-details";

  // Create file name
  const fileName = document.createElement("div");
  fileName.className = "file-name";
  fileName.textContent = file.name;

  // Create file size
  const fileSize = document.createElement("div");
  fileSize.className = "file-size";
  fileSize.textContent = size;

  fileDetails.appendChild(fileName);
  fileDetails.appendChild(fileSize);

  // Create remove button
  const removeButton = document.createElement("button");
  removeButton.className = "remove-file-btn";
  removeButton.addEventListener("click", function () {
    removeFile(this);
  });

  // Create remove icon SVG
  const removeIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  removeIcon.setAttribute("width", "16");
  removeIcon.setAttribute("height", "16");
  removeIcon.setAttribute("viewBox", "0 0 24 24");
  removeIcon.setAttribute("fill", "none");
  removeIcon.setAttribute("stroke", "currentColor");
  removeIcon.setAttribute("stroke-width", "2");

  const removePath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  removePath.setAttribute("d", "M18 6L6 18M6 6l12 12");

  removeIcon.appendChild(removePath);
  removeButton.appendChild(removeIcon);

  // Append all elements to file item
  fileItem.appendChild(fileIcon);
  fileItem.appendChild(fileDetails);
  fileItem.appendChild(removeButton);

  return fileItem;
}
