import { DestroyRef, Injectable, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge, takeUntil, throttleTime } from 'rxjs';
import { CANVAS_CONFIG } from '../../config/canvas-css';
import { PdfService } from '../pdf/pdf.service';
import { ZoomService } from '../zoom/zoom.service';
import { DrawingService } from '../drawing/drawing.service';
import { DrawStoreService } from '../draw-store/draw-store.service';
import { ContainerScroll, ContainerSize, Listener, initContainerScroll, initContainerSize } from '../../config/white-board.interface';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  pdfService = inject(PdfService)
  zoomService = inject(ZoomService)
  drawingService = inject(DrawingService)
  drawStoreService = inject(DrawStoreService)

  pdfInfo = this.pdfService.pdfInfo
  zoomScale: WritableSignal<number> = this.zoomService.zoomScale // 초기값은 1

  listenerSet: Listener[] = [];

  // 캔버스 사이즈
  _canvasFullSize = {
    width: 0,
    height: 0,
  };

  destroyRef = inject(DestroyRef);

  containerScroll = signal<ContainerScroll>(initContainerScroll) //썸네일 컨테이너 좌표
  containerSize = signal<ContainerSize>(initContainerSize) //썸네일 컨테이너 좌표

  constructor() { }


  get canvasFullSize(): any {
    return this._canvasFullSize;
  }

  getDeviceScale(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d') as any;
    // https://www.html5rocks.com/en/tutorials/canvas/hidpi/
    const devicePixelRatio = window.devicePixelRatio || 1;

    // https://stackoverflow.com/questions/59592852/typescript-tsc-compiler-complaining-about-property-not-existing-despite-me-updat
    // Blink and WebKit.
    // Most of these APIs are deprecated and were removed shortly after Chrome 36.
    const backingStoreRatio = ctx?.webkitBackingStorePixelRatio ||
      ctx?.mozBackingStorePixelRatio ||
      ctx?.msBackingStorePixelRatio ||
      ctx?.oBackingStorePixelRatio ||
      ctx?.backingStorePixelRatio || 1;

    let deviceScale = 1;
    // ios의 경우는 어떤지 학생으로 check ~~ todo
    if (navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1) {
      deviceScale = devicePixelRatio / backingStoreRatio;
    }

    return deviceScale;
  }

  /*--------------------------------------
          getThumbnailSize
          - 각 thumbnail 별 canvas width/height
      ----------------------------------------*/
  getThumbnailSize(pageNum: number) {

    const viewport = this.pdfInfo().pdfPages[pageNum - 1].getViewport({ scale: 1 });

    const size = {
      width: 0,
      height: 0,
      scale: 1 // thumbnail draw에서 사용할 scale (thumbnail과 100% pdf size의 비율)
    };

    // landscape 문서 : 가로를 150px(thumbnailMaxSize)로 설정
    if (viewport.width > viewport.height) {
      size.width = CANVAS_CONFIG.thumbnailMaxSize;
      size.height = size.width * viewport.height / viewport.width;
    }
    // portrait 문서 : 세로를 150px(thumbnailMaxSize)로 설정
    else {
      size.height = CANVAS_CONFIG.thumbnailMaxSize;
      size.width = size.height * viewport.width / viewport.height;
    }
    size.scale = size.width / (viewport.width * CANVAS_CONFIG.CSS_UNIT);

    return size;
  }

  /**
   * Main container관련 canvas Size 설정
   *
   */
  setCanvasSize(pageNum: number, zoomScale: number, canvasContainer: HTMLDivElement, bgCanvas: HTMLCanvasElement) {
    console.log(`>>> set Canvas Size: pageNum:${pageNum}`)

    const pdfPage = this.pdfService.pdfInfo().pdfPages[pageNum - 1];
    const canvasFullSize = pdfPage.getViewport({ scale: zoomScale * CANVAS_CONFIG.CSS_UNIT })!;
    canvasFullSize.width = Math.round(canvasFullSize.width);
    canvasFullSize.height = Math.round(canvasFullSize.height);

    /*------------------------------------
        container Size
        - 실제 canvas 영역을 고려한 width와 height
        - deviceScale은 고려하지 않음
    -------------------------------------*/
    const containerSize = {
      width: Math.min(CANVAS_CONFIG.maxContainerWidth - 285, canvasFullSize.width),  // 좌측 navigation width만큼 빼야 zoonIn 시 왼쪽이 전부 보임
      height: Math.min(CANVAS_CONFIG.maxContainerHeight, canvasFullSize.height)
    };

    // Canvas Container Size 조절
    canvasContainer.style.width = containerSize.width + 'px';
    canvasContainer.style.height = containerSize.height + 'px';


    // container와 canvas의 비율 => thumbnail window에 활용
    const ratio = {
      w: containerSize.width / canvasFullSize.width,
      h: containerSize.height / canvasFullSize.height
    };

    /*---------------------------------------
        현재 page에 대한 background size 설정
    ----------------------------------------*/
    bgCanvas.width = canvasFullSize.width * CANVAS_CONFIG.deviceScale;
    bgCanvas.height = canvasFullSize.height * CANVAS_CONFIG.deviceScale;
    bgCanvas.style.width = canvasFullSize.width + 'px';
    bgCanvas.style.height = canvasFullSize.height + 'px';


    // data update
    this._canvasFullSize = canvasFullSize;


    return ratio;
  }


  /**
  *
  * Canvas Container size 설정
  *
  * @param coverCanvas
  * @param canvasContainer
  * @returns
  */
  setContainerSize(canvasContainer: HTMLDivElement) {
    /*------------------------------------
        container Size
        - 실제 canvas 영역을 고려한 width와 height
    -------------------------------------*/
    const containerSize = {
      width: Math.min(CANVAS_CONFIG.maxContainerWidth, this.canvasFullSize.width),
      height: Math.min(CANVAS_CONFIG.maxContainerHeight, this.canvasFullSize.height)
    };


    // Canvas Container Size 조절
    canvasContainer.style.width = containerSize.width + 'px';
    canvasContainer.style.height = containerSize.height + 'px';


    // container와 canvas의 비율 => thumbnail window에 활용
    const ratio = {
      w: containerSize.width / this.canvasFullSize.width,
      h: containerSize.height / this.canvasFullSize.height
    };
    return ratio;
  }

  /**
     * Canvas에 event listener 추가
     * @param {canvas element} sourceCanvas event를 받아들일 canvas
     * @param {canvas element} targetCanvas event가 최종적으로 그려질 canvas
     * @param {object} tool  사용 tool (type, color, width)
     * @param {number} zoomScale 현재의 zoom scale
     */
  addEventHandler(sourceCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement, tool: any, zoomScale: number) {
    console.log(">>>> Add Event handler:", tool, zoomScale);
    const drawingService = this.drawingService;
    const drawStoreService = this.drawStoreService;
    const sourceCtx = sourceCanvas.getContext("2d")!;
    const targetCtx = targetCanvas.getContext("2d")!;

    let oldPoint: number[] = [];
    let newPoint: number[] = [];
    let points: any = [];

    // var maxNumberOfPointsPerSocket = 100;
    let startTime: number | null = null;
    let endTime: number | null = null;

    let isDown = false;
    let isTouch = false;

    const scale = zoomScale || 1;

    // **************************** Mouse/touch Event **************************************** //
    // sourceCanvas.onmousedown = sourceCanvas.ontouchstart = downEvent;
    // sourceCanvas.onmousemove = sourceCanvas.ontouchmove = moveEvent;
    // sourceCanvas.onmouseout = sourceCanvas.onmouseup = sourceCanvas.ontouchend = upEvent;
    // *************************************************************************************** //

    for (const item of this.listenerSet) {
      if (item.id === sourceCanvas.id) {
        sourceCanvas.removeEventListener(item.name, item.handler as EventListener);
      }
    }
    // sourceCanvas가 동일한 경우에 대한 내용 삭제.
    this.listenerSet = this.listenerSet.filter(item => item.id !== sourceCanvas.id);

    sourceCanvas.addEventListener('mousedown', downEvent);
    sourceCanvas.addEventListener('mousemove', moveEvent);
    sourceCanvas.addEventListener('mouseup', upEvent);
    sourceCanvas.addEventListener('mouseout', upEvent);
    sourceCanvas.addEventListener('touchstart', downEvent);
    sourceCanvas.addEventListener('touchmove', moveEvent);
    sourceCanvas.addEventListener('touchend', upEvent);


    this.listenerSet.push({ id: sourceCanvas.id, name: 'mousedown', handler: downEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'mousemove', handler: moveEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'mouseup', handler: upEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'mouseout', handler: upEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'touchstart', handler: downEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'touchmove', handler: moveEvent });
    this.listenerSet.push({ id: sourceCanvas.id, name: 'touchend', handler: upEvent });


    // console.log(this.listenerSet);

    function downEvent(this: HTMLCanvasElement, event: MouseEvent | TouchEvent) {
      console.log('downEvent!!')
      event.preventDefault();
      isDown = true;
      // 시작시 touch/mouse가 동시에 발생할 때 (chrome dev 등)
      // --> touch기준으로 나머지 drawing 동작.
      if (event instanceof TouchEvent) {
        isTouch = true;
        oldPoint = getPoint(event, this, scale);
      } else {
        oldPoint = getPoint(event, this, scale);
      }

      points = oldPoint;
      drawingService.start(sourceCtx, points, tool);

      if (tool.type == 'pointer') {
        // eventBusService.emit(new EventData('gen:newDrawEvent', {
        //   points: oldPoint,
        //   tool
        // }));
        // 포인터일 경우 end가 아닌 start와 move 때 socket으로 전송
        merge(
          fromEvent(sourceCanvas, 'mousemove'),
          fromEvent(sourceCanvas, 'touchmove')
        ).pipe(
          takeUntil(fromEvent(sourceCanvas, 'mouseup')),
          takeUntil(fromEvent(sourceCanvas, 'mouseout')),
          takeUntil(fromEvent(sourceCanvas, 'touchend')),
          throttleTime(30),
          takeUntilDestroyed()
        ).subscribe(() => {
          // eventBusService.emit(new EventData('gen:newDrawEvent', {
          //   points: oldPoint,
          //   tool
          // }));
        });
      }
      startTime = Date.now();
      event.preventDefault();
    };


    // kje: todo: mouse와 touch가 move 도중에 중복되는 경우는 없는지 확인...
    function moveEvent(this: HTMLCanvasElement, event: MouseEvent | TouchEvent) {
      if (!isDown) return;
      newPoint = getPoint(isTouch ? event : event, this, scale);
      if (oldPoint[0] !== newPoint[0] || oldPoint[1] !== newPoint[1]) {
        oldPoint = newPoint;
        points.push(oldPoint[0]); // x
        points.push(oldPoint[1]); // y
        // console.log(points)
        drawingService.move(sourceCtx, points, tool, scale, sourceCanvas); // scale: eraser marker 정확히 지우기 위함.
        event.preventDefault();
        // console.log(points)
      }
    };

    function upEvent() {
      if (!isDown) return;
      isDown = false;
      isTouch = false;

      sourceCtx.globalAlpha = 1

      drawingService.end(targetCtx, points, tool);

      /*----------------------------------------------
        Drawing Event 정보
        -> gen:newDrawEvent로 publish.
      -----------------------------------------------*/

      if (tool.type == 'pointer') {
        sourceCtx.shadowColor = "";
        sourceCtx.shadowBlur = 0;
        tool.type = 'pointerEnd';
        // eventBusService.emit(new EventData('gen:newDrawEvent', {
        //   points: newPoint,
        //   tool
        // }));
        tool.type = 'pointer';
        // document.getElementById('canvas').style.cursor = 'default'
        points = [];
        return clear(sourceCanvas, scale);
      }
      endTime = Date.now();
      const drawingEvent = {
        points,
        tool,
        timeDiff: endTime - startTime!
      };

      drawStoreService.setDrawEvent(1, drawingEvent)
      // Generate Event Emitter: new Draw 알림
      // eventBusService.emit(new EventData('gen:newDrawEvent', drawingEvent));

      // 3. cover canvas 초기화
      clear(sourceCanvas, scale);

      points = [];

      // console.log('upEvent', points)
    };
    /**
     * canvas 초기화
     * @param {canvas element} targetCanvas
     * @param {number} zoomScale
     */
    function clear(targetCanvas: HTMLCanvasElement, zoomScale: number) {
      const targetCtx = targetCanvas.getContext('2d')!;
      const scale = zoomScale || 1;
      targetCtx.clearRect(0, 0, targetCanvas.width / scale, targetCanvas.height / scale);
    }

    /**
     * Point 받아오기
     * - zoom인 경우 zoom 처리 전의 좌표 *
     * @param {*} event touch 또는 mouse event
     * @param {*} target event를 받아들이는 canvas
     * @param {*} zoomScale 현재의 zoom scale
     */
    function getPoint(event: MouseEvent | TouchEvent, target: HTMLCanvasElement, zoomScale: number) {
      const canvasRect = target.getBoundingClientRect();
      const scale = zoomScale || 1;

      let clientX = 0;
      let clientY = 0;

      if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else if (event instanceof TouchEvent && event.touches.length > 0) {
        // Use the first touch in the touches array
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      }

      const point = [
        Math.round((clientX - canvasRect.left) / scale),
        Math.round((clientY - canvasRect.top) / scale)
      ]
      return point;
    }
  }
}
