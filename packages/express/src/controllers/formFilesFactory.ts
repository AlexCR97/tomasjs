import { FileArray, UploadedFile } from "express-fileupload";
import { FormFile } from "./FormFile";
import { FormFilesBuilder } from "./FormFilesBuilder";
import { FormFiles } from "./FormFiles";

export function formFileFactory(file: UploadedFile): FormFile {
  return new FormFile(
    file.name,
    file.encoding,
    file.mimetype,
    file.data,
    file.truncated,
    file.size,
    file.md5
  );
}

export function formFilesFactory(files: FileArray): FormFiles {
  const formFilesBuilder = new FormFilesBuilder();

  for (const formField of Object.keys(files)) {
    const file = files[formField];
    const formFile = toFormFileOrFormFileArray(file);
    formFilesBuilder.with(formField, formFile);
  }

  return formFilesBuilder.build();
}

function toFormFileOrFormFileArray(
  fileOrFileArray: UploadedFile | UploadedFile[]
): FormFile | FormFile[] {
  return Array.isArray(fileOrFileArray)
    ? fileOrFileArray.map((x) => formFileFactory(x))
    : formFileFactory(fileOrFileArray);
}
