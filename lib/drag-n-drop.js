export const onDragOver = e => {
  preventDefaults(e);
}

export const onDragEnter = e => {
  preventDefaults(e);
  setDropping(true);
}

export const onDragLeave = e => {
  preventDefaults(e);
  setDropping(false);
}

export const preventDefaults = e =>  {
  e.preventDefault();
  e.stopPropagation();
}