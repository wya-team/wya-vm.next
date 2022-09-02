import Viewer from './viewer.vue';
import Editor from './editor.vue';

export const tpl = {
	module: "tpl",
	type: '基础',
	name: "tpl",
	Viewer,
	Editor,
	max: '', // 最多存放元素
	insertion: '', // first/last/none 插入方式
	// 初始数据 data 或者 data 都可以
	data: {
		closeable: true,

		inner: 0,
		backgroundColor: '#fff',
		backgroundImage: 'https://oss.ruishan666.com/image/xcx/180313/942996157518/10053669,2880,1800.jpg',
		backgroundType: 1,
		paddingVertical: 0,
		paddingHorizontal: 0,
		borderRadius: 0,
		content: ''
	},
	dataValidity: () => {
		return null;
	}
};
