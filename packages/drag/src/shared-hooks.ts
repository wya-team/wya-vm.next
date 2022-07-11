import { ref } from 'vue'; 

const IS_SERVER = typeof window === 'undefined';
const doc = !IS_SERVER && document.documentElement;

let isPressShift = ref(false);
if (!IS_SERVER && doc) {
	doc.addEventListener('keydown', (e) => {
		isPressShift.value = e.keyCode === 16 || e.key === 'Shift';
	});
	doc.addEventListener('keyup', (e) => {
		if (isPressShift.value && (e.keyCode === 16 || e.key === 'Shift')) {
			isPressShift.value = false;
		}
	});
}

export const usePressShiftStatus = () => {
	return isPressShift;
};