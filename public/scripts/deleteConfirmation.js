const deleteFolderForm = document.querySelector(".delete-folder-form");
const deleteFileForm = document.querySelector("#file_delete_form");

if (deleteFolderForm) {
  deleteFolderForm.addEventListener("onsubmit", () =>
    confirmDeletion("folder"),
  );
}

if (deleteFileForm) {
  deleteFileForm.addEventListener("onsubmit", () => confirmDeletion("file"));
}

function confirmDeletion(type) {
  const item = String(type);
  const confirmation = confirm(`Are you sure you want to delete this ${item}?`);

  return confirmation;
}
