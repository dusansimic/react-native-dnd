import React, {Context, FC, useEffect, useRef} from 'react';
import {Animated, PanResponder, View} from 'react-native';
import {DndContext, DraggableInnerProps, DraggableProps} from './types';

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

	const moveEvent = Animated.event([null, {dx: pan.x, dy: pan.y}], {
		useNativeDriver: true,
	});

	// Let element: View | undefined;

	const panResponder = useRef(PanResponder.create({
		onMoveShouldSetPanResponder: () => true,
		onPanResponderMove(e, gesture) {
			const {pageX, pageY} = e.nativeEvent;

			__dndContext.handleDragMove(id, {x: pageX, y: pageY});
			moveEvent(e, gesture);
		},
		onPanResponderGrant() {
			console.warn('Grant');
		},
		onPanResponderStart({nativeEvent: {pageX, pageY}}) {
			console.log('Started');
			__dndContext.handleDragStart(id, {x: pageX, y: pageY});
		},
		onPanResponderRelease({nativeEvent: {pageX, pageY}}) {
			if (bounceBack) {
				Animated.spring(pan, {
					toValue: {x: 0, y: 0},
					useNativeDriver: true,
				}).start();
			}

			__dndContext.handleDragEnd(id, {x: pageX, y: pageY});
		},
	})).current;

	// Const localOnLayout = (event: LayoutChangeEvent) => {
	// 	if (onLayout) {
	// 		onLayout(event);
	// 	}

	// 	measure();
	// };

	// const handleRef = (el: any) => {
	// 	/* eslint-disable */
	// 	element = el?.getNode ? el.getNode() : el;
	// 	/* eslint-enable */
	// };

	// const measure = () => {
	// 	element?.measureInWindow((x, y, width, height) => {
	// 		__dndContext.updateDraggable(id, {layout: {x, y, width, height}});
	// 	});
	// };

	return (<View>
		<Animated.View
			// OnLayout={localOnLayout}
			style={{transform: pan.getTranslateTransform()}}
			// Ref={handleRef}
			{...panResponder.panHandlers}
		>
			{children}
		</Animated.View>
	</View>);
	// Return children({
	// 	viewProps: {
	// 		onLayout: localOnLayout,
	// 		// @ts-ignore
	// 		style: {
	// 			transform: pan.getTranslateTransform(),
	// 		},
	// 		ref: handleRef,
	// 		...panResponder.panHandlers,
	// 	},
	// }) as ReactElement<any, any> | null;
};

export const dragView = (Consumer: Context<DndContext>['Consumer']): FC<DraggableProps> => {
	const DragView: FC<DraggableProps> = props => (
		<Consumer>
			{value => <BaseDragView {...props} __dndContext={value} />}
		</Consumer>
	);

	DragView.displayName = 'ConnectedDragView';

	return DragView;
};
