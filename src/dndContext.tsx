import React, {createContext, FC, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {DndContext, DndId, Draggable, Droppable, Position} from './types';

export const dndContext = createContext<DndContext>(undefined!);

export const DndProvider: FC = ({children}) => {
	const dnd = useProvideDnd();
	return <dndContext.Provider value={dnd}><GestureHandlerRootView>
		{children}
	</GestureHandlerRootView></dndContext.Provider>;
};

const useProvideDnd = (): DndContext => {
	const [draggables, setDraggables] = useState<Draggable[]>([]);
	const [droppables, setDroppables] = useState<Droppable[]>([]);
	const [currentDragging, setCurrentDragging] = useState<DndId | undefined>(undefined);
	const [currentDropping, setCurrentDropping] = useState<DndId | undefined>(undefined);

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
			...data,
		};

		setDraggables(draggables => [...draggables, draggable]);
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
				: d,
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
			...data,
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
				: d,
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
	const handleDragStart = (id: DndId, _position: Position) => {
		const draggable = getDraggable(id);

		if (draggable) {
			setCurrentDragging(id);

			if (draggable.onDragStart) {
				console.warn('should start');
				draggable.onDragStart();
			}
		}
	};

	/**
	 * Handle end of draggable drag.
	 * @param id Draggable id
	 * @param position Draggable position
	 */
	const handleDragEnd = (id: DndId, position: Position) => {
		const draggable = getDraggable(id);
		if (!draggable) {
			return;
		}

		const droppable = getDroppableInArea(position);

		if (droppable?.onDrop) {
			droppable.onDrop(draggable, position);
		}

		if (draggable.onDragEnd) {
			draggable.onDragEnd(droppable);
		}

		setCurrentDragging(undefined);
	};

	/**
	 * Handle move of a draggable.
	 * @param id Draggable id
	 * @param position Draggable position
	 */
	const handleDragMove = (id: DndId, position: Position) => {
		const draggable = getDraggable(id);
		if (!draggable) {
			return;
		}

		const currentDroppable = getDroppableInArea(position);
		const prevDropping = currentDropping;

		// TODO: Nisam bas siguran koji se kurac ovde desava pa to treba analizirati
		if (currentDroppable) {
			if (currentDroppable.id !== currentDropping) {
				setCurrentDropping(currentDroppable.id);

				if (currentDroppable.onEnter) {
					currentDroppable.onEnter(draggable, position);
				}
			}
		} else if (currentDropping) {
			if (prevDropping) {
				const prevDroppable = getDroppable(prevDropping);

				if (prevDroppable?.onLeave) {
					prevDroppable.onLeave(draggable, position);
				}
			}

			setCurrentDropping(undefined);
		}
	};

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

	const getDroppableInArea = (position: Position) => droppables.find(({layout}) =>
		position.x >= layout.x
		&& position.y >= layout.y
		&& position.x <= layout.x + layout.width
		&& position.y <= layout.y + layout.height,
	);

	return {
		// States
		draggables,
		droppables,
		currentDragging,
		currentDropping,
		// DNDRegistration
		registerDraggable,
		updateDraggable,
		unregisterDraggable,
		registerDroppable,
		updateDroppable,
		unregisterDroppable,
		handleDragStart,
		handleDragEnd,
		handleDragMove,
		// DNDContext
		getDraggable,
		getDroppable,
	};
};
