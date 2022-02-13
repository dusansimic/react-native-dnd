export type DndContext = {};

export type DndId = string | symbol;
export type HandleDropFunction = (
  draggable: Draggable,
  position: Position
) => any;
export type HandleEnterFunction = (
  draggable: Draggable,
  position: Position
) => any;
export type HandleLeaveFunction = (
  draggable: Draggable,
  position: Position
) => any;
export type HandleDragStartFunction = () => any;
export type HandleDragEndFunction = (droppale?: Droppable) => any;

export interface Position {
  x: number;
  y: number;
}

interface LayoutData {
	layout: {
    x: number;
    y: number;
    width: number;
    height: number;
	}
}

export interface Draggable extends LayoutData {
  id: DndId;
  dragging: boolean;
  onDragStart?: HandleDragStartFunction;
  onDragEnd?: HandleDragEndFunction;
  payload?: any;
}

export interface Droppable extends LayoutData {
  id: DndId;
  onDrop?: HandleDropFunction;
  onEnter?: HandleEnterFunction;
  onLeave?: HandleLeaveFunction;
}

export type RegisterDraggableFunction = (id: DndId, data: Partial<Draggable>) => void;

export interface DNDRegistration {
  registerDraggable: RegisterDraggableFunction;
  updateDraggable(id: DndId, data: Partial<Draggable>): void;
  unregisterDraggable(id: DndId): void;
  registerDroppable(id: DndId, data: Partial<Droppable>): void;
  updateDroppable(id: DndId, data: Partial<Draggable>): void;
  unregisterDroppable(id: DndId): void;
  handleDragStart(id: DndId, position: Position): void;
  handleDragEnd(draggingId: DndId, position: Position): void;
  handleDragMove(draggingId: DndId, position: Position): void;
}

export interface State {
  draggables: Draggable[];
  droppables: Droppable[];
  dragOffset: number[];
  currentDragging?: DndId;
  currentDropping?: DndId;
}
