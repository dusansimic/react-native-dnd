import React, {createRef, FC, useEffect} from 'react';
import {View} from 'react-native';
import {dndContext} from './dndContext';
import {DroppableInnerProps, DroppableProps} from './types';

const BaseDropView: FC<DroppableInnerProps> = (
	{children, __dndContext, customId, onDrop, onEnter, onLeave, payload},
) => {
	const id = customId!;
	const ref = createRef<View>();

	useEffect(() => {
		__dndContext.registerDroppable(id, {onDrop, onEnter, onLeave});
		return () => {
			__dndContext.unregisterDroppable(id);
		};
	}, []);

	useEffect(() => {
		__dndContext.updateDroppable(id, {onDrop});
	}, [onDrop]);
	useEffect(() => {
		__dndContext.updateDroppable(id, {onEnter});
	}, [onEnter]);
	useEffect(() => {
		__dndContext.updateDroppable(id, {onLeave});
	}, [onLeave]);
	useEffect(() => {
		__dndContext.updateDroppable(id, {payload});
	}, [payload]);

	const onLayout = () => {
		measure();
	};

	const measure = () => {
		ref.current?.measureInWindow((x, y, width, height) => {
			__dndContext.updateDroppable(id, {layout: {x, y, width, height}});
		});
	};

	return <View onLayout={onLayout} ref={ref} style={{zIndex: -1}}>
		{children}
	</View>;
};

export const DropView: FC<DroppableProps> = ({customId, ...props}) => {
	const id = customId ?? Symbol('dropview');

	return <dndContext.Consumer>
		{value => <BaseDropView customId={id} {...props} __dndContext={value} />}
	</dndContext.Consumer>;
};
