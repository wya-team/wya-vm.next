import { watch, getCurrentInstance, onMounted, onUnmounted } from 'vue';

import Keyboard from './manager';

export const useKeyboard = () => {
	const instance = getCurrentInstance();
	const { props } = instance;

	const keyboard = new Keyboard(instance);
	watch(
		() => props.keyboardEnabled,
		(v) => {
			keyboard.enable(v);
		}
	);

	onMounted(() => {
		keyboard.init();
	});

	onUnmounted(() => {
		keyboard.destroy();
	});

	return keyboard;
};
