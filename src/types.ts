import {LayoutChangeEvent} from 'react-native';

export type DndId = string | symbol;
export type DndPayload = unknown;
export type HandleDropFunction = (
	draggable: Draggable,
	position: Position,
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
	};
}

export interface Draggable extends LayoutData {
	id: DndId;
	dragging: boolean;
	onDragStart?: HandleDragStartFunction;
	onDragEnd?: HandleDragEndFunction;
	payload?: DndPayload;
}

export interface Droppable extends LayoutData {
	id: DndId;
	onDrop?: HandleDropFunction;
	onEnter?: HandleEnterFunction;
	onLeave?: HandleLeaveFunction;
	payload?: DndPayload;
}

export interface DndRegistration {
	registerDraggable(id: DndId, data: Partial<Draggable>): void;
	updateDraggable(id: DndId, data: Partial<Draggable>): void;
	unregisterDraggable(id: DndId): void;
	registerDroppable(id: DndId, data: Partial<Droppable>): void;
	updateDroppable(id: DndId, data: Partial<Droppable>): void;
	unregisterDroppable(id: DndId): void;
	handleDragStart(id: DndId, position: Position): void;
	handleDragEnd(draggingId: DndId, position: Position): void;
	handleDragMove(draggingId: DndId, position: Position): void;
}

export interface State {
	draggables: Draggable[];
	droppables: Droppable[];
	currentDragging?: DndId;
	currentDropping?: DndId;
}

export interface DndContext extends DndRegistration, State {
	getDraggable(id?: DndId): Draggable | undefined;
	getDroppable(id?: DndId): Droppable | undefined;
}

// Type TviewProps = {
// 	onLayout: ViewProps['onLayout'];
// 	style: ViewProps['style'];
// 	ref: any;
// };

// export interface DroppableRenderProps {
// 	active: boolean;
// 	computeDistance(): number | undefined;
// 	viewProps: TviewProps;
// }

export interface DraggableProps {
	onLayout?: (event: LayoutChangeEvent) => void;
	// Children: (props: DroppableRenderProps) => React.ReactNode;
	bounceBack?: boolean;
	onDragStart?: HandleDragStartFunction;
	onDragEnd?: HandleDragEndFunction;
	payload?: DndPayload;
	customId?: DndId;
}

export interface DroppableProps {
	onLayout?: (event: LayoutChangeEvent) => void;
	onDrop?: HandleDropFunction;
	onEnter?: HandleEnterFunction;
	onLeave?: HandleLeaveFunction;
	payload?: DndPayload;
	customId?: DndId;
}

export interface DraggableInnerProps extends DraggableProps {
	__dndContext: DndContext;
}

export interface DroppableInnerProps extends DroppableProps {
	__dndContext: DndContext;
}
