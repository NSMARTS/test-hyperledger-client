import { AuthService } from './../../../services/auth/auth.service';
import { PdfService } from './../../../services/pdf/pdf.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  WritableSignal,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { MaterialsModule } from '../../../materials/materials.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ContractsService } from '../../../services/contracts/contracts.service';

@Component({
  selector: 'app-contracts-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './contracts-add.component.html',
  styleUrl: './contracts-add.component.scss',
})
export class ContractsAddComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  pdfService = inject(PdfService);
  contractsService = inject(ContractsService);
  pdfInfo: WritableSignal<any> = this.pdfService.pdfInfo;
  @ViewChild('bg') pdfViewer!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  userInfo: WritableSignal<any> = this.authService.userInfo;

  form: FormGroup = this.fb.group({
    receiverA: ['', [Validators.required, Validators.email]],
    receiverB: ['', [Validators.required, Validators.email]],
    title: ['', Validators.required],
  });

  currentFile: any;
  constructor() {
    effect(() => {
      // 다이얼로그가 켜지고, PDF 페이지 이동 시
      if (this.pdfInfo()?.pdfPages?.length > 0) {
        this.pdfService.pdfRender(this.pdfViewer);
      }
    });
  }

  /**
   * 새로운 File Load (Local)
   * - @output으로 main component(white-board.component로 전달)
   * @param event
   * @returns
   */
  async handleUploadFileChanged(event: Event) {
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
    this.currentFile = file;

    this.pdfService.readFile(file);
  }

  onSubmit() {
    if (this.form.valid) {
      const formData: any = {
        ...this.form.value,
        company: this.userInfo().org,
        writer: this.userInfo()._id,
        file: this.currentFile,
      };

      if (!this.currentFile) {
        return;
      }
      this.upload(formData);
    }
  }

  upload(formData: any) {
    this.contractsService.createContract(formData).subscribe({
      next: (res: any) => {
        this.router.navigate(['/contracts']);
      },
      error: (err: any) => {},
    });
  }
}
