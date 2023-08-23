import { FormFile } from "./FormFile";
import { FormFiles } from "./FormFiles";

export class FormFilesBuilder {
  private readonly formFiles: FormFiles = {};

  with(formField: string, file: FormFile | FormFile[]) {
    this.formFiles[formField] = file;
  }

  build(): FormFiles {
    return this.formFiles;
  }
}
