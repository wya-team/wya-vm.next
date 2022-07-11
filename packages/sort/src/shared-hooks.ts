import { ref } from 'vue'; 

let currentDrag = ref(null); // 共享
export const useCurrentDrag = () => {
	return [
		currentDrag,
		(v) => {
			currentDrag.value = v;
		}
	];
};