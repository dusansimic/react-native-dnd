import React, {FC, useEffect, useRef} from 'react';
import {Animated, NativeTouchEvent, PanResponder} from 'react-native';
import {dndContext} from './dndContext';
import {DraggableInnerProps, DraggableProps} from './types';

const BaseDragView: FC<DraggableInnerProps> = (
	{children, __dndContext, customId, bounceBack, onDragStart, onDragEnd, payload},
) => {
	const pan = useRef(new Animated.ValueXY()).current;
	const id = customId ?? Symbol('dragview');
	console.warn('Hi there');

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		__dndContext.registerDraggable(id, {onDragStart, onDragEnd, payload});
		return () => {
			__dndContext.unregisterDraggable(id);
		};
	}, []);

	useEffect(() => {
		__dndContext.updateDraggable(id, {onDragStart});
	}, [onDragStart]);
	useEffect(() => {
		__dndContext.updateDraggable(id, {onDragEnd});
	}, [onDragEnd]);
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		__dndContext.updateDraggable(id, {payload});
	}, [payload]);

	const panResponder = useRef(PanResponder.create({
		onStartShouldSetPanResponder: () => true,
		onMoveShouldSetPanResponder: () => true,
		onPanResponderMove: Animated.event<NativeTouchEvent>([null, {dx: pan.x, dy: pan.y}], {
			useNativeDriver: false,
			listener: ({nativeEvent: {pageX, pageY}}) => {
				console.log(pageX, pageY);
				__dndContext.handleDragMove(id, {x: pageX, y: pageY});
			},
		}),
		onPanResponderGrant: () => {
			console.warn('Grant');
		},
		onPanResponderStart: ({nativeEvent: {pageX, pageY}}) => {
			console.log('Started');
			__dndContext.handleDragStart(id, {x: pageX, y: pageY});
		},
		onPanResponderRelease: ({nativeEvent: {pageX, pageY}}) => {
			if (bounceBack) {
				Animated.spring(pan, {
					toValue: {x: 0, y: 0},
					useNativeDriver: true,
				}).start();
			}

			__dndContext.handleDragEnd(id, {x: pageX, y: pageY});
		},
	})).current;

	return <Animated.View
		style={{transform: pan.getTranslateTransform()}}
		{...panResponder.panHandlers}
	>
		{children}
	</Animated.View>;
};

export const DragView: FC<DraggableProps> = props => <dndContext.Consumer>
	{value => <BaseDragView {...props} __dndContext={value} />}
</dndContext.Consumer>;
