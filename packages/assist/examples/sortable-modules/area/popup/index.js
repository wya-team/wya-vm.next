import { Portal, Message } from '@wya/vc';
import PaintWrapper from './paint.vue';

export const Paint = new Portal(PaintWrapper, {
	onBefore(props) {
		Message.loading('数据处理中...');
		return new Promise(resolve => {
			let img = new Image();
			img.src = props.src;
			img.onload = () => {
				Message.destroy();

				resolve({
					frameW: 500,
					frameH: (500 / img.naturalWidth) * img.naturalHeight
				});
			};
		});
	}
});