import { Injectable, signal } from '@angular/core';

type ToolName =
  | 'pointer'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'line'
  | 'circle'
  | 'rectangle'
  | 'roundedRectangle';

export interface DrawTool {
  type?: string;
  color: string;
  width: number;
}
export interface ToolsConfig {
  [key: string]: DrawTool | undefined;
  pointer: DrawTool;
  pen: DrawTool;
  highlighter?: DrawTool;
  eraser?: DrawTool;
  line?: DrawTool;
  circle?: DrawTool;
  rectangle?: DrawTool;
  roundedRectangle?: DrawTool;
}

// 변수 초기화값
export interface EditInfo {
  mode: string; // draw : 그리기 모드, move : 드래그 모드
  tool: string;
  toolsConfig: ToolsConfig;
  toolDisabled: boolean;
  editDisabled: boolean;
}

const InitEditInfo: EditInfo = {
  mode: 'draw', // draw, sync(여기? 또는 별도?)
  tool: 'pen', // eraser, ...

  toolsConfig: {
    pointer: { type: 'pointer', width: 20, color: 'black' },
    pen: { type: 'pen', width: 4, color: 'black' },
  },

  toolDisabled: false, // move인 경우
  editDisabled: false, // Edit 자체 동작을 모두 방지(권한 관련)
  // syncMode, ....
};

@Injectable({
  providedIn: 'root',
})
export class EditInfoService {
  editInfo = signal<EditInfo>(InitEditInfo);

  constructor() {}

  getCurrentTool(tool: ToolName) {
    return this.editInfo().toolsConfig[tool];
  }
}
