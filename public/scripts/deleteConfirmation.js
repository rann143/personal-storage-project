const deleteFolderForm = document.querySelector(".delete-folder-form");
const deleteFileForm = document.querySelector("#file_delete_form");

if (deleteFolderForm) {
  deleteFolderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (confirmDeletion("folder")) {
      deleteFolderForm.submit();
    }
  });
}

if (deleteFileForm) {
  deleteFileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (confirmDeletion("file")) {
      deleteFileForm.submit();
    }
  });
}

function confirmDeletion(type) {
  const item = String(type);
  const confirmation = confirm(`Are you sure you want to delete this ${item}?`);

  return confirmation;
}
