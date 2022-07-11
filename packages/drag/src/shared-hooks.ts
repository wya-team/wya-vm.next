const IS_SERVER = typeof window === 'undefined';
const doc = !IS_SERVER && document.documentElement;

let isPressShift = ref(false);
if (!IS_SERVER) {
	doc.addEventListener('keydown', (e) => {
		isPressShift = e.keyCode === 16 || e.key === 'Shift';
	});
	doc.addEventListener('keyup', (e) => {
		if (isPressShift && (e.keyCode === 16 || e.key === 'Shift')) {
			isPressShift = false;
		}
	});
}

export const usePressShiftStatus = () => {
	return isPressShift;
};