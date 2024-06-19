import { Injectable, effect, signal } from '@angular/core';

/**
 * type :  pen(펜), eraser(지우개), highlighter(형광팬), pointer(레이저 포인터), line(도형 선긋기), 도형 
 */
export interface DrawTool {
  type?: string,
  color: string,
  width: number
}

/**
 * PageDrawingEvent는 한 획을 저장하는 변수
 * points : [ X좌표, Y좌표 ...반복 ]
 * timeDiff : mouseDown 이벤트 부터 mouseUp이벤트 까지 시간
 * tool: DrawTool
 */
export interface PageDrawingEvent {
  points: number[],
  timeDiff: number,
  tool: DrawTool
}

/**
 * pdf 페이지 별 드로잉 이벤트를 저장하는 변수
 * PageDrawingEvent는 한 획이다. 한페이지에 여러개의 PageDrawingEvent 있을 경우, 획을 여러번 그린거다.
 * ex) pageNum 0, [{PageDrawingEvent}, {PageDrawingEvent}, {PageDrawingEvent}]
 */
export interface DrawVar {
  pageNum: number,
  drawingEvent: PageDrawingEvent[]
}


@Injectable({
  providedIn: 'root'
})
export class DrawStoreService {

  drawVar = signal<DrawVar[]>([])
  pageDrawingEvent = signal<PageDrawingEvent>({} as PageDrawingEvent)

  constructor() {
    effect(() => {
      console.log('drawVar : ', this.drawVar())
      console.log('pageDrawingEvent : ', this.pageDrawingEvent())
    })

  }


  /**
   * Draw event 받아오기
   *
   * @param docNum 문서 번호
   * @param pageNum 페이지 번호
   * @returns
   */
  getDrawingEvents(pageNum: number) {
    return this.drawVar().find((item) => item.pageNum === pageNum);
  }

  /**
   * 해당 page에 새로운 draw event 저장
   * @param {number} pdfNum 페이지 번호
   * @param {object} drawingEvent 새로운 draw event
   */
  setDrawEvent(pageNum: number, drawingEvent: any) {

    // 해당 페이지에 드로우 이벤트가 있는지 확인.
    const itemIndex = this.drawVar().findIndex((item: any) => item.pageNum === pageNum);

    // 현재 해당 page의 data가 없는 경우, 최초 생성
    if (itemIndex < 0) {
      this.drawVar.update(array => [...array, { pageNum: pageNum, drawingEvent: [drawingEvent] }]);
    }
    // 해당 page의 data가 있는 경우, 기존 data에 event 추가
    else {
      // 해당 페이지의 기존 드로우 이벤트와 새로 추가된 드로우 이벤트를 합치는 변수
      const updatedDrawingEvents = [...this.drawVar()[itemIndex].drawingEvent, drawingEvent];
      // updatedDrawingEvents로 시그널 update
      this.drawVar.update(array => array.map((item, index) =>
        index === itemIndex ? { ...item, drawingEvent: updatedDrawingEvents } : item
      ));
    }
  }

  /**
   * 특정 page의 draw event 모두 삭제
   * @param {number} pageNum 페이지 번호
   */
  clearDrawingEvents(pageNum: number) {
    this.drawVar.update(array => array.filter(item => item.pageNum !== pageNum));
  }


  /**
   * draw event 모두 삭제
   */
  resetDrawingEvents() {
    this.drawVar.set([]);
  }

}
