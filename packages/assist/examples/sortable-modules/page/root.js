import Viewer from './viewer.vue';
import Editor from './editor.vue';

export const page = {
	module: "page",
	type: 'basic',
	name: "页面设置",
	Viewer,
	Editor,
	showWidget: false,
	max: 1, // 只能存在一个
	insertion: 'first', // 只能插入到第一个
	// 初始数据 data 或者 data 都可以
	data: {
		w: 375,
		h: 603,
		closeable: false,
		draggable: false,
		parent: false,

		inner: 0,
		backgroundType: 1,
		backgroundColor: '#F1F2F8',
		backgroundImage: [],
		imageWidth: 0,
		imageHeight: 0,

		title: '',
		titleEditable: 0,
	},
	dataValidity: () => {
		return null;
	},
};