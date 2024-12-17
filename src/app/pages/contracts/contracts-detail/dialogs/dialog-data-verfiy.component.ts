import { ContractsService } from './../../../../services/contracts/contracts.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MaterialsModule } from '../../../../materials/materials.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-data-verify',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './dialog-data-verify-dialog.html',
  styleUrl: './dialog-data-verify-dialog.scss',
})
export class DialogDataVerifyComponent {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<DialogDataVerifyComponent>);
  contractsService = inject(ContractsService);

  fileName = 'Select File';
  currentFile?: File; // 파일 업로드 시 여기에 관리

  /**
   * 새로운 File Load (Local)
   * - @output으로 main component(white-board.component로 전달)
   * @param event
   * @returns
   */
  async onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (
      !inputElement ||
      !inputElement.files ||
      inputElement.files.length === 0
    ) {
      return;
    }
    const file: File = inputElement.files[0];

    // 파일 유효성 검사
    const ext = file.name
      .substring(file.name.lastIndexOf('.') + 1)
      .toLowerCase();

    if (ext !== 'pdf') {
      alert(`Please, upload the '.pdf' file.`);
      return;
    }
    // this.isLoadingResults = true;

    this.currentFile = file;
    this.fileName = this.currentFile.name;
  }

  validateContract() {
    if (!this.currentFile) {
      alert(`Please, upload a contract file.`);
      return;
    }
    this.contractsService
      .verifyContract(this.data.id, this.data.receiver, this.currentFile)
      .subscribe({
        next: (res: any) => {
          alert(res.message);
        },
        error: (err: any) => {
          console.log(err);
          alert(err.error.message);
        },
      });
  }
}
