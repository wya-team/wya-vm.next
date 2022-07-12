<template>
	<div :style="style" :class="classes" class="vm-combo">
		<Widget 
			v-if="showWidget"
			:style="widgetStyle" 
			:content-style="widgetContentStyle" 
			:theme="theme"
			:modules="modules"
			v-bind="widgetOptions"
			@change="handleWidgetChange"
		/>
		<Artboard 
			ref="frame"
			:frame-style="frameStyle" 
			:width="states.rebuildFrameW" 
			:height="states.rebuildFrameH" 
			:data-source="states.rebuildData" 
			:editor="states.editor" 
			:show-lines="showLines"
			:show-ruler="showRuler"
			:show-zoom-bar="showZoomBar"
			:show-thumbnail="showThumbnail"
			:theme="theme"
			:modules="modules"
			v-bind="frameOptions"
			@activated="handleActivated"
			@deactivated="handleDeactivated"
			@change="handleChange"
			@sort-end="(...rest) => $emit('sort-end', ...rest)"
			@error="(...rest) => $emit('error', ...rest)"
		>
			<template #frame-header>
				<slot name="frame-header" />
			</template>
			<template #frame-footer>
				<slot name="frame-footer" />
			</template>
		</Artboard>
		<!-- v-show主要用于没有页面设置 -->
		<Editor
			v-if="showEditor"
			:value="states.editor"
			:style="editorStyle"
			:width="editorW"
			:height="editorH"
			:modules="modules"
			v-bind="editorOptions"
			@change="handleChange"
		/>
	</div>
</template>

<script setup>
import { provide, computed, watch, ref, getCurrentInstance } from 'vue';
import { Logger } from '@wya/vm-shared';
import { Store, useStates } from './store';
import { PreviewManager, useKeyboard } from './assist';

import { cloneDeep, getUid } from './utils/helper';
import { PAGE_MOULE, SELECTION_MODULE } from './utils/constants';
import Widget from './widget';
import Editor from './editor';
import Frame from './frame';
import './theme-dark.scss';

const emit = defineEmits([
	'change',
	'update:model-value',
	'widget-change',
	'sort-end',
	'error',
	'save'
]);

const props = defineProps({
	width: Number,
	height: Number,
	modelValue: {
		type: Array,
		default: () => ([])
	},
	/**
	 * frame
	 */
	frameStyle: Object,
	frameW: Number,
	frameH: Number,
	frameOptions: Object,
	/**
	 * widget
	 */
	widgetStyle: Object,
	widgetContentStyle: Object,
	widgetW: Number,
	widgetH: Number,
	widgetOptions: Object,

	/**
	 * widget
	 */
	editorStyle: Object,
	editorW: Number,
	editorH: Number,
	editorOptions: Object,

	/**
	 * combo
	 */
	theme: {
		type: String,
		default: 'default' // default / light / dark
	},
	showWidget: {
		type: Boolean,
		default: true
	},
	showEditor: {
		type: Boolean,
		default: true
	},
	showLines: {
		type: Boolean,
		default: true
	},
	showRuler: {
		type: Boolean,
		default: true
	},
	showZoomBar: {
		type: Boolean,
		default: true
	},
	showThumbnail: {
		type: Boolean,
		default: true
	},
	modules: {
		type: Object,
		default: () => ({})
	},
	mode: {
		type: String,
		default: 'draggable'
	},

	keyboardEnabled: {
		type: Boolean,
		default: false
	}
});
useKeyboard();

const instance = getCurrentInstance();
const VMComboId = getUid('combo');
const clipboardData = ref(null);

const Artboard = props.mode === 'draggable' ? Frame.Draggable : Frame.Sortable;
const store = new Store(instance, {
	frameW: props.frameW,
	frameH: props.frameH,
});

const frame = ref();
const states = useStates({
	rebuildData: 'data',
	rebuildFrameW: 'frameW',
	rebuildFrameH: 'frameH',
	current: 'currentSnapshot',
	total: 'totalSnapshot',
	editor: 'currentEditor',
	pageEditor: 'pageEditor',
}, store);

const style = computed(() => {
	const w = !props.width ? 'auto' : `${props.width}px`;
	const h = !props.height ? 'auto' : `${props.height}px`;

	return {
		width: w,
		height: h
	};
});

const classes = computed(() => {
	return {
		'vm-combo__theme--dark': props.theme === 'dark'
	};
});

const syncData = () => {
	emit('change', states.rebuildData);
	emit('update:model-value', states.rebuildData);
};

// draggable
const handleActivated = (e, it) => {
	store.resetCurrentEditor(it);
};

const handleDeactivated = () => {
	store.resetCurrentEditor();
};

// 用户处理widget出来的数据 TODO: 支持记忆片段
const handleWidgetChange = (module, ...rest) => {
	emit('widget-change', module, ...rest);
};

// 数据变化
const handleChange = ({ type, ...payload }) => {
	const { id, original, changed, revert } = payload; 
	switch (type) {
		case 'CREATE':
		case 'UPDATE': // eslint-disable-line
		case 'DELETE':
			if (!id) {
				throw new Error('[wya-vm/combo]: id 必传');
			}
			break;
		case 'SORT':
			if (!original && !changed) {
				throw new Error('[wya-vm/combo]: original/changed 必传');
			}
			break;
		case 'DUMMY':
			if (typeof revert === 'undefined') {
				throw new Error('[wya-vm/combo]: revert 不能为undefined');
			}
			break;
		default:
			break;
	}

	store.commit(type, payload);
	syncData();
};

// 模拟添加
const add = (module, index) => {
	frame.value.handleDrop({
		fake: true,
		dataTransfer: {
			getData: () => {
				return JSON.stringify({
					module,
					data: index
				});
			}
		}
	}, true);
	syncData();
};

/**
 * 删除
 * 
 * @param {object|number} it id | data, 可传id或者data
 * @param {boolean} force 默认是当前编辑的删除，除非强制删除id
 * @returns {void} ~
 */
const remove = (it, force = false) => {
	let isObj = typeof it === 'object';
	let id = (isObj ? it.id : it) || (states.editor || {}).id;
	if (!id || (!force && states.editor.module === PAGE_MOULE)) {
		emit('error', { 
			type: 'id', 
			msg: "请先选择操作对象" 
		});
		return;
	}
	it = isObj 
		? it
		: states.rebuildData.findIndex(i => i.id === id);

	store.commit('DELETE', { 
		id,
		revert: it.selections && it.selections.length
	});

	if (it.module === SELECTION_MODULE) {
		it.selections.forEach(($id) => {
			store.commit('DELETE', { 
				id: $id,
				revert: it.selections && it.selections.length,
			});
		});
	}

	syncData();
};

// 剪切一份
const cut = () => {
	if (
		!states.editor 
		|| states.editor.module === PAGE_MOULE 
		|| states.editor.module === SELECTION_MODULE
	) {
		return;
	} 

	// 粘帖数据缓存
	clipboardData.value = {
		type: 'CUT',
		data: cloneDeep(states.editor),
		selections: states.editor.module === SELECTION_MODULE 
			? cloneDeep(states.rebuildData.filter(i => states.editor.selections.includes(i.id)))
			: []
	};

	// 删除剪切数据
	const revert = clipboardData.value.selections.length;
	store.commit('DELETE', { 
		id: editor.id,
		revert
	});
	clipboardData.value.selections.forEach((id) => {
		store.commit('DELETE', { 
			id,
			revert
		});
	});

	syncData();
};

// 复制一份
const copy = (it) => {
	if (
		!it && (
			!states.editor 
			|| states.editor.module === PAGE_MOULE 
		)
	) {
		return;
	} 

	it = it || states.editor;
	clipboardData.value = {
		type: 'COPY',
		data: cloneDeep(it),
		selections: states.editor.module === SELECTION_MODULE 
			? cloneDeep(states.rebuildData.filter(i => it.selections.includes(i.id)))
			: []
	};
};

// 粘帖一份 这里兼容了组合，其中包含x,y的偏移值
const paste = (override = {}) => {
	if (!clipboardData.value) return;
	let { data, selections = [] } = clipboardData.value;
	const rowIndex = states.rebuildData.length;
	const revert = selections.length;
	const id = getUid();

	let changed = cloneDeep(data);
	changed.x && (changed.x += 10);
	changed.y && (changed.y += 10);
	Object.keys(override).forEach(key => (changed[key] = override[key]));

	changed.id = id;
	if (changed.module === SELECTION_MODULE) {
		selections = selections.map(i => {
			i.id = getUid();
			return i;
		});
		changed.selections = selections.map(i => i.id);

		const diffX = changed.x - data.x;
		const diffY = changed.y - data.y;

		selections.forEach((it, index) => {
			store.commit('CREATE', { 
				index: rowIndex + index,
				id: it.id,
				revert,
				data: {
					...it,
					x: it.x + diffX,
					y: it.y + diffY
				}
			});
		});
	}

	store.commit('CREATE', {
		index: rowIndex + revert,
		id,
		data: changed,
		revert
	});
	syncData();

	// 激活
	frame.value.setActivedById(id);
};

// 撤回
const undo = () => {
	let current = states.current - 1;
	if (current < 0) {
		emit('error', { 
			type: 'undo', 
			msg: "目前已经是初始状态" 
		});
		return;
	}

	// 需要连续回滚
	let { revert } = store.historyData[current] || {};

	store.commit('UNDO', { current });

	if (revert) {
		Array.from({ length: revert }).forEach(() => {
			store.commit('UNDO', { current: states.current - 1 });
		});
	}

	Logger.debug(`current: ${states.current}, total: ${states.total}`);
	syncData();
};

// 取消撤回
const redo = () => {
	let current = states.current + 1;
	if (current > states.total) {
		emit('error', { 
			type: 'undo', 
			msg: "目前已经是最终状态" 
		});
		return;
	}

	// 需要连续回滚
	let { revert } = store.historyData[current] || {};

	store.commit('REDO', { current });
	if (revert) {
		Array.from({ length: revert }).forEach(() => {
			store.commit('REDO', { current: states.current + 1 });
		});
	}

	Logger.debug(`current: ${states.current}, total: ${states.total}`);
	syncData();
};

// widget-save
const save = () => {
	const data = cloneDeep(states.rebuildData) || [];

	if (data.length === 0) {
		emit('error', { 
			type: 'save', 
			msg: `保存对象不能为空` 
		});
		return false;
	}
	const { modules } = props;
	for (let i = 0; i < data.length; i++) {
		let { module: mod } = data[i];
		if (modules[mod].dataValidity) {
			let error = modules[mod].dataValidity(data[i]);
			if (error) {
				let msg = error.msg || error.message || error.error || error; // 兼容验证器使用
				emit('error', { 
					type: 'save', 
					msg: `第${i + 1}个 - ${msg}`, 
					index: i 
				});
				// 错误元素激活
				frame.value.setActived(i);
				return false;
			}
		}
	}
	/**
	 * 数据验证
	 */
	emit('save', data);
	return true;
};

const getImage = (opts = {}) => {
	return new Promise((resolve, reject) => {
		PreviewManager.popup({
			dataSource: cloneDeep(states.rebuildData),
			styles: {
				...props.frameStyle,
				width: props.rebuildFrameW === 0 ? 'auto' : `${props.rebuildFrameW}px`,
				height: props.rebuildFrameH === 0 ? 'auto' : `${props.rebuildFrameH}px`
			},
			className: 'vm-combo__frame',

			expect: 'image',
			imageOptions: opts,
			onSure: resolve,
			onClose: reject,
			mode: props.mode,
			modules: props.modules
		});
	});
};

const preview = () => {
	if (states.rebuildData.length === 0) {
		emit('error', { 
			type: 'preview', 
			msg: `预览数据对象不能为空` 
		});
		return false;
	}
	previewManager.popup({
		dataSource: cloneDeep(states.rebuildData),
		styles: {
			...props.frameStyle,
			width: states.rebuildFrameW === 0 ? 'auto' : `${states.rebuildFrameW}px`,
			height: states.rebuildFrameH === 0 ? 'auto' : `${states.rebuildFrameH}px`
		},
		className: 'vm-combo__frame'
	});

	return true;
};

const download = () => {
	const content = JSON.stringify(props.modelValue, null, '\t');
	const blob = new Blob([content], {
		type: 'application/json;charset=UTF-8'
	});

	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.textContent = 'download json';
	link.href = url;
	link.download = 'data'; // moment().format('YYYY-MM-DD')
	link.click();

	URL.revokeObjectURL(url);
};

const upload = () => {
	const input = document.createElement('input');
	input.type = 'file';
	// 限定文件类型
	input.accept = '.json';
	input.click();

	input.onchange = () => {
		const file = input.files[0];

		// FileReader实例
		const reader = new FileReader();
		reader.readAsText(file, 'UTF-8');
		reader.onload = e => {
			try {
				let v = JSON.parse(e.target.result);
				store.commit('INIT', v);
			} catch ($e) {
				console.log($e);
			}
		};
	};
};

watch(
	() => props.modelValue,
	(v) => {
		store.commit('INIT', v);
	},
	{
		deep: true,
		immediate: true,
	}
);

provide('@wya/vm', {
	getVM: () => instance,
	getData: () => props.modelValue
});

defineExpose({
	store,
	VMComboId,
	frame,
	add,
	remove,
	cut,
	copy,
	paste,
	undo,
	redo,
	save,
	getImage,
	preview,
	download,
	upload,
	clipboardData
});
</script>

<style lang="scss">
@import "./style/index.scss";

.vm-combo {
	display: flex;
}
</style>
