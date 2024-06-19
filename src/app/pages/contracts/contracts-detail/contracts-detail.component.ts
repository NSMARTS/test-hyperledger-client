import { DialogDataVerifyComponent } from './dialogs/dialog-data-verfiy.component';
import { RenderingService } from './../../../services/rendering/rendering.service';
import { EditInfo, EditInfoService } from './../../../services/edit-info/edit-info.service';
import { MaterialsModule } from './../../../materials/materials.module';
import { AuthService } from './../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild, WritableSignal, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfService } from '../../../services/pdf/pdf.service';
import { ContractsService } from '../../../services/contracts/contracts.service';
import { environment } from '../../../../environments/environment';
import * as pdfjsLib from 'pdfjs-dist';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CanvasService } from '../../../services/canvas/canvas.service';
import { DrawStoreService } from '../../../services/draw-store/draw-store.service';
pdfjsLib.GlobalWorkerOptions.workerSrc = environment.workerSRC;

@Component({
  selector: 'app-contracts-detail',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './contracts-detail.component.html',
  styleUrl: './contracts-detail.component.scss'
})
export class ContractsDetailComponent {
  router = inject(Router)
  route = inject(ActivatedRoute)
  dialog = inject(MatDialog)
  authService = inject(AuthService)
  pdfService = inject(PdfService)
  contractsService = inject(ContractsService)
  pdfInfo: WritableSignal<any> = this.pdfService.pdfInfo;

  contractInfo = signal<any>(null)

  @ViewChild('bg') pdfViewer!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  drawStoreService = inject(DrawStoreService)
  contractId: string;

  userInfo: WritableSignal<any> = this.authService.userInfo
  drawVar: WritableSignal<any> = this.drawStoreService.drawVar

  constructor() {
    this.contractId = this.route.snapshot.params['id'];

    effect(() => {
      // console.log(this.contractInfo())
      // 다이얼로그가 켜지고, PDF 페이지 이동 시
      if (
        this.pdfInfo()?.pdfPages?.length > 0) {
        console.log(this.pdfInfo())
        this.pdfService.pdfRender(this.pdfViewer);
      }
    });

    effect(() => {
      console.log(this.contractInfo())
    })
  }

  ngAfterViewInit() {
    this.getContractById()
    this.getPdf()
  }
  getPdf() {
    this.contractsService.getPdf(this.contractId).subscribe({
      next: async (res: ArrayBuffer) => {
        const loadingTask = pdfjsLib.getDocument({
          data: res,
          cMapUrl: environment.cmapURL,
          cMapPacked: true
        });
        const pdfDocument = await loadingTask.promise;
        // PDF 정보를 가져옴
        await this.pdfService.storePdfInfo(pdfDocument);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getContractById() {
    console.log('계약서 정보 가져오기')
    this.contractsService.getContractById(this.contractId).subscribe({
      next: async (res: any) => {
        console.log(res)
        const { contract } = res;
        this.contractInfo.set(contract)
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  openDialog(receiver: string, mode: string) {
    const signInfo: any = { id: this.contractInfo()?._id }
    if (receiver === 'a') {
      console.log('사용자A')
      signInfo.mode = mode
      signInfo.receiver = receiver;
      signInfo.status = this.contractInfo()?.statusA;
      signInfo.signPointer = this.contractInfo()?.signPointerA;
    } else if (receiver === 'b') {
      console.log('사용자B')
      signInfo.mode = mode
      signInfo.receiver = receiver;
      signInfo.status = this.contractInfo()?.statusB;
      signInfo.signPointer = this.contractInfo()?.signPointerB;
    }


    const dialogRef = this.dialog.open(DialogDataExampleDialog, {
      data: {
        ...signInfo
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
      if (result !== undefined) {
        this.getContractById()
      }
    });
  }

  openVerify(receiver: string) {
    const signInfo: any = { id: this.contractInfo()?._id }
    if (receiver === 'a') {
      console.log('사용자A')
      signInfo.receiver = receiver;

    } else if (receiver === 'b') {
      console.log('사용자B')
      signInfo.receiver = receiver;
    }


    const dialogRef = this.dialog.open(DialogDataVerifyComponent, {
      data: {
        ...signInfo
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
      if (result !== undefined) {
        this.getContractById()
      }
    });
  }
}

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: 'dialog-data-example-dialog.html',
  styleUrl: './dialog-data-example-dialog.scss',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
})
export class DialogDataExampleDialog {
  data = inject(MAT_DIALOG_DATA)
  dialogRef = inject(MatDialogRef<DialogDataExampleDialog>)
  editInfoService = inject(EditInfoService)
  canvasService = inject(CanvasService)
  drawStoreService = inject(DrawStoreService)
  renderingService = inject(RenderingService)
  contractsService = inject(ContractsService)

  @ViewChild('canvas') pdfViewer!: ElementRef<HTMLCanvasElement>;
  @ViewChild('cover') signCover!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;
  editInfo: WritableSignal<EditInfo> = this.editInfoService.editInfo

  constructor() {
    console.log(this.data)
  }

  ngAfterViewInit() {
    this.setCanvas()
  }


  setCanvas() {
    console.log('setCanvas')
    // 서명은 무조건 펜으로
    const currentTool = this.editInfo().toolsConfig['pen'];

    if (this.data?.status === 'pending' && !this.data?.managerMode) {
      // 서명란 색감 주기
      const ctx = this.pdfViewer.nativeElement.getContext('2d');
      ctx!.fillStyle = "#F5F5F5";
      ctx!.fillRect(0, 0, this.pdfViewer.nativeElement.width, this.pdfViewer.nativeElement.height);
      this.canvasService.addEventHandler(this.signCover.nativeElement, this.pdfViewer.nativeElement, currentTool, 1);
    }

    // 직원 서명이 존재하면 매니저 서명 draw
    if (this.data?.status === 'signed') {
      this.drawStoreService.drawVar.set(this.data?.signPointer)
      this.pageRender(this.pdfViewer.nativeElement)
      this.drawStoreService.resetDrawingEvents(); // 직원 서명을 그리고 나면 초기화
    }
  }

  pageRender(canvas: HTMLCanvasElement) {
    const drawingEvents = this.drawStoreService.getDrawingEvents(1);
    this.renderingService.renderBoard(canvas, 1, drawingEvents);
  }


  signContract() {
    const body: any = { receiver: this.data?.receiver }
    if (this.data?.receiver === 'a') {
      body.signPointerA = this.drawStoreService.getDrawingEvents(1)
    } else if (this.data?.receiver === 'b') {
      body.signPointerB = this.drawStoreService.getDrawingEvents(1)
    }

    this.contractsService.signContract(this.data.id, body).subscribe({
      next: (res: any) => {
        if (res) {
          console.log(res)
          this.dialogRef.close(true)
        }
      },
      error: (err: any) => {
        console.log(err)
      }
    })
  }

}