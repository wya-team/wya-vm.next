import { Portal } from '@wya/vc';
import Preview from './preview.vue';
import PreviewPopup from './popup.vue';

export { Preview };
export const PreviewManager = new Portal(PreviewPopup, {
	promise: false
});