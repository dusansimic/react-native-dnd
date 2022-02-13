import {createContext, FC, useState} from 'react';
import {DragView} from './dragView';
import { DndContext, DndId, DNDRegistration, Draggable, Droppable, Position, RegisterDraggableFunction } from './types';

const dndContext = createContext<DndContext>({});

export const ProvideDnd: FC<{}> = ({children}) => {
	const dnd = useProvideDnd();
	return <dndContext.Provider value={dnd}>
		{children}
	</dndContext.Provider>
};

const useProvideDnd = (): DNDRegistration => {
	const [draggables, setDraggables] = useState<Draggable[]>([]);
	const [droppables, setDroppables] = useState<Droppable[]>([]);
	const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
	const [currentDragging, setCurrentDragging] = useState<DndId | undefined>(undefined);

	/**
	 * Register a new draggable. If draggable with the same id is already registered, error is
	 * thrown.
	 * @param id Draggable id
	 * @param data Partial draggable data
	 */
	const registerDraggable = (id: DndId, data: Partial<Draggable>) => {
		const existing = getDraggable(id);
		if (existing) {
			throw new Error('Draggable has already been registered.');
		}

		const draggable: Draggable = {
			id,
			layout: {x: 0, y: 0, width: 0, height: 0},
			dragging: false,
			...data
		};

		setDraggables((draggables) => [...draggables, draggable]);
	};

	/**
	 * Update registered draggable data. If draggable is not registered, nothing happens.
	 * @param id Draggable id
	 * @param data Draggable data
	 */
	const updateDraggable = (id: DndId, data: Draggable) => {
		setDraggables(ds => ds.map(
			d => d.id === id
				? {...d, ...data}
				: d
		));
	};

	/**
	 * Unregister a draggable. If draggable is not registered, nothing happens.
	 * @param id Draggable id
	 */
	const unregisterDraggable = (id: DndId) => {
		setDraggables(ds => ds.filter(d => d.id !== id));
	};

	/**
	 * Register a new droppable. If droppable with the same id is already registered, error is
	 * thrown.
	 * @param id Droppable id
	 * @param data Partial doppable data
	 */
	const registerDroppable = (id: DndId, data: Partial<Droppable>) => {
		const existing = getDroppable(id);
		if (existing) {
			throw new Error('Droppable has already been registered.');
		}

		const droppable: Droppable = {
			id,
			layout: {x: 0, y: 0, width: 0, height: 0},
			...data
		};

		setDroppables(ds => [...ds, droppable]);
	};

	/**
	 * Update registered droppable data. If droppable is not registered, nothing happens.
	 * @param id Droppable id
	 * @param data Droppable data
	 */
	const updateDroppable = (id: DndId, data: Droppable) => {
		setDroppables(ds => ds.map(
			d => d.id === id
				? {...d, ...data}
				: d
		));
	};

	/**
	 * Unregister a droppable. If droppable is not registered, nothing happens.
	 * @param id Droppable id
	 */
	const unregisterDroppable = (id: DndId) => {
		setDroppables(ds => ds.filter(d => d.id !== id));
	};

	/**
	 * Handle start of draggable drag.
	 * @param id Draggable id
	 * @param position Draggable position
	 */
	const handleDragStart = (id: DndId, position: Position) => {
		const draggable = getDraggable(id);

		if (draggable) {
			const {layout} = draggable;

			const center = [
				layout.x - Math.round(layout.width / 2),
				layout.y - Math.round(layout.height / 2),
			];

			setDragOffset([position.x - center[0], position.y - center[1]]);
			setCurrentDragging(id);

			if (draggable.onDragStart) {
				draggable.onDragStart();
			}
		}
	}

	const handleDragEnd = (id: DndId, position: Position) => {
      const droppable = this.getDroppableInArea(position);
      const draggable = this.getDraggable(draggingId);

      if (draggable && droppable && droppable.onDrop) {
        droppable.onDrop(draggable, position);
      }

      if (draggable && draggable.onDragEnd) {
        draggable.onDragEnd(droppable);
      }

      this.setState({ currentDragging: undefined, dragOffset: [0, 0] });
	}

	/**
	 * Get a draggable matching the id. If match is not found, undefined is returned.
	 * @param id Id a the draggable
	 * @returns Draggable or undefined
	 */
	const getDraggable = (id?: DndId) => draggables.find(d => d.id === id);

	/**
	 * Get a droppable matching the id. If match is not found, undefined is returned.
	 * @param id Id a the droppable
	 * @returns Droppable or undefined
	 */
	const getDroppable = (id?: DndId) => droppables.find(d => d.id === id);

	const getDroppableInArea = (position: Position) => 

	const handleDragMove = () => {}

	return {
		registerDraggable,
		updateDraggable,
		unregisterDraggable,
		registerDroppable,
		updateDroppable,
		unregisterDroppable,
		handleDragStart,
		handleDragEnd,
		handleDragMove,
	};
}
