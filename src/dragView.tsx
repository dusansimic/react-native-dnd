import React, {createRef, FC, useEffect} from 'react';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {dndContext} from './dndContext';
import {DraggableInnerProps, DraggableProps, Position} from './types';

type GestureContext = {
	startX: number;
	startY: number;
};

const BaseDragView: FC<DraggableInnerProps> = (
	{children, __dndContext, customId, bounceBack, onDragStart, onDragEnd, payload},
) => {
	const x = useSharedValue(0);
	const y = useSharedValue(0);
	const id = customId!;
	const ref = createRef<Animated.View>();

	const handleDragStart = (position: Position) => {
		__dndContext.handleDragStart(id, position);
	};

	const handleDragMove = (position: Position) => {
		__dndContext.handleDragMove(id, position);
	};

	const handleDragEnd = (position: Position) => {
		__dndContext.handleDragEnd(id, position);
	};

	const onLayout = () => {
		measure();
	};

	const measure = () => {
		ref.current?.measureInWindow((x, y, width, height) => {
			__dndContext.updateDroppable(id, {layout: {x, y, width, height}});
		});
	};

	useEffect(() => {
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
		__dndContext.updateDraggable(id, {payload});
	}, [payload]);

	const handler = useAnimatedGestureHandler({
		onStart: (e, ctx: GestureContext) => {
			ctx.startX = x.value;
			ctx.startY = y.value;
			runOnJS(handleDragStart)({x: e.absoluteX, y: e.absoluteY});
		},
		onActive: (e, ctx: GestureContext) => {
			x.value = ctx.startX + e.translationX;
			y.value = ctx.startY + e.translationY;
			runOnJS(handleDragMove)({x: e.absoluteX, y: e.absoluteY});
		},
		onEnd: e => {
			if (bounceBack) {
				x.value = withSpring(0);
				y.value = withSpring(0);
			}

			runOnJS(handleDragEnd)({x: e.absoluteX, y: e.absoluteY});
		},
	});

	const style = useAnimatedStyle(() => ({
		transform: [{translateX: x.value}, {translateY: y.value}],
	}));

	return <PanGestureHandler onGestureEvent={handler}>
		<Animated.View onLayout={onLayout} ref={ref} style={style}>
			{children}
		</Animated.View>
	</PanGestureHandler>;
};

export const DragView: FC<DraggableProps> = ({customId, ...props}) => {
	const id = customId ?? Symbol('dragview');
	return <dndContext.Consumer>
		{value => <BaseDragView customId={id} {...props} __dndContext={value} />}
	</dndContext.Consumer>;
};
