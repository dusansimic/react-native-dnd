import React, {FC, useEffect} from 'react';
import {LayoutChangeEvent, View} from 'react-native';
import {dndContext} from './dndContext';
import {DroppableInnerProps, DroppableProps} from './types';

const BaseDropView: FC<DroppableInnerProps> = (
	{children, __dndContext, customId, onDrop, onEnter, onLeave, onLayout},
) => {
	const id = customId ?? Symbol('dropview');

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

	let element: View | undefined;

	const localOnLayout = (event: LayoutChangeEvent) => {
		if (onLayout) {
			onLayout(event);
		}

		measure();
	};

	const handleRef = (el: any) => {
		/* eslint-disable */
		element = el?.getNode ? el.getNode() : el;
		/* eslint-enable */
	};

	const measure = () => {
		element?.measureInWindow((x, y, width, height) => {
			__dndContext.updateDroppable(id, {layout: {x, y, width, height}});
		});
	};

	return <View onLayout={localOnLayout} ref={handleRef} style={{zIndex: -1}}>{children}</View>;
};

export const DropView: FC<DroppableProps> = props => <dndContext.Consumer>
	{value => <BaseDropView {...props} __dndContext={value} />}
</dndContext.Consumer>;
