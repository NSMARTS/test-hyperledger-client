import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { CANVAS_CONFIG } from '../../config/canvas-css';
import { PdfService } from '../pdf/pdf.service';

@Injectable({
  providedIn: 'root',
})
export class ZoomService {
  pdfService = inject(PdfService);
  pdfInfo: WritableSignal<any> = this.pdfService.pdfInfo;

  zoomScale = signal<number>(1);

  maxZoomScale = CANVAS_CONFIG.maxZoomScale;
  minZoomScale = CANVAS_CONFIG.minZoomScale;
  constructor() {}
  setInitZoomScale() {
    const containerSize = {
      width: CANVAS_CONFIG.maxContainerWidth,
      height: CANVAS_CONFIG.maxContainerHeight,
    };

    if (!this.pdfInfo().pdfPages || this.pdfInfo().pdfPages.length === 0) {
      return this.zoomScale();
    }

    const pdfPage: any = this.pdfInfo().pdfPages[0];

    const docSize = pdfPage.getViewport({ scale: 1 * CANVAS_CONFIG.CSS_UNIT }); // 100%에 해당하는 document의 size (Css 기준)

    const ratio = {
      w: containerSize.width / docSize.width,
      h: containerSize.height / docSize.height,
    };

    // 1. main container size보다 작은 경우
    if (ratio.w >= 1 && ratio.h >= 1) {
      // fit To page
      this.zoomScale.set(Math.min(ratio.w, ratio.h));
    }

    // 2. landscape 문서인 경우
    else if (docSize.width > docSize.height) {
      // fit To Page
      this.zoomScale.set(Math.min(ratio.w, ratio.h));
    }
    // 3, portrait 문서인 경우
    else if (docSize.width <= docSize.height && ratio.w < 1) {
      this.zoomScale.set(ratio.w);
    }

    this.zoomScale.set(Math.min(this.zoomScale(), CANVAS_CONFIG.maxZoomScale));
    this.zoomScale.set(Math.max(this.zoomScale(), CANVAS_CONFIG.minZoomScale));

    return this.zoomScale();
  }
  // zoomscale 결정(zoomin, zoomout, fit to page .... etc)
  calcZoomScale(zoomInfo: string, pageNum: number, prevZoomScale = 1) {
    let zoomScale = 1;

    switch (zoomInfo) {
      case 'zoomIn':
        zoomScale = this.calcNewZoomScale(prevZoomScale, +1);
        break;

      case 'zoomOut':
        zoomScale = this.calcNewZoomScale(prevZoomScale, -1);
        break;

      // 너비에 맞춤
      case 'fitToWidth':
        zoomScale = this.fitToWidth(pageNum);
        break;

      // page에 맞춤
      case 'fitToPage':
        zoomScale = this.fitToPage(pageNum);
        break;
    }

    return zoomScale;
  }

  /**
   *
   * @param currentScale 현재 비율
   * @param sgn 스케일 증가 +1  감소-1
   * @returns
   */
  calcNewZoomScale(currentScale: number, sgn: number) {
    let step;

    // fit to page등 %로 1의 자리수가 남아있는 경우 floow 처리
    const prevScale = Math.floor(currentScale * 10) / 10;
    if (sgn > 0) {
      if (prevScale < 1.1) step = 0.1;
      else if (prevScale < 2) step = 0.2;
      else step = 0.3;
    } else {
      if (prevScale <= 1.1) step = 0.1;
      else if (prevScale <= 2.1) step = 0.2;
      else step = 0.3;
    }

    let newScale = Math.round((prevScale + step * sgn) * 10) / 10;
    newScale = Math.min(newScale, this.maxZoomScale);
    newScale = Math.max(newScale, this.minZoomScale);

    return newScale;
  }

  // page 폭에 맞추기
  fitToWidth(currentPage: number) {
    const containerSize = {
      width: CANVAS_CONFIG.maxContainerWidth - 278, // 좌측 navigation width만큼 빼야 fitToWidth 시 폭에 맞다.
      height: CANVAS_CONFIG.maxContainerHeight,
    };
    const pdfPage: any = this.pdfService.pdfInfo().pdfPages[currentPage - 1];
    const docSize = pdfPage.getViewport({ scale: 1 * CANVAS_CONFIG.CSS_UNIT });

    const zoomScale = containerSize.width / docSize.width;

    return zoomScale;
  }

  // page에 맞추기
  fitToPage(currentPage: number) {
    const containerSize = {
      width: CANVAS_CONFIG.maxContainerWidth,
      height: CANVAS_CONFIG.maxContainerHeight,
    };

    const pdfPage: any = this.pdfService.pdfInfo().pdfPages[currentPage - 1];
    const docSize = pdfPage.getViewport({ scale: 1 * CANVAS_CONFIG.CSS_UNIT }); // 100%에 해당하는 document의 size (Css 기준)

    const ratio = {
      w: containerSize.width / docSize.width,
      h: containerSize.height / docSize.height,
    };

    const zoomScale = Math.min(ratio.h, ratio.w);

    return zoomScale;
  }
}
