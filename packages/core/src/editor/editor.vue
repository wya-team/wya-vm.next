<template>
	<div 
		v-if="currentValue"
		:style="styles" 
		class="vm-editor vm-hack-editor"
	>	
		<div class="vm-editor__wrapper">
			<!-- <div class="vm-editor__arrow" /> -->
			<template v-if="currentValue.module !== SELECTION_MODULE">
				<!-- vm-type让组件内部处理如何渲染或其他操作 -->
				<component
					:is="modules[currentValue.module].Editor"
					ref="target"
					:key="currentValue.id"
					v-bind="currentValue"
					@change="handleChange"
				/>
			</template>
			<template v-else>
				<!-- 组合拖拽 -->
				<div />
			</template>
		</div>
	</div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import { valueIsNaN, hasOwn, debounce } from "../utils/helper";
import { SELECTION_MODULE } from "../utils/constants";

const emit = defineEmits(['change']);
const props = defineProps({
	value: Object,
	width: {
		type: Number,
		default: 328
	},
	height: Number,
	modules: {
		type: Object,
		default: () => ({})
	}
});

const currentValue = ref(props.value);
const styles = computed(() => {
	const { width } = props;
	return { 
		flex: `0 0 ${width}px`, 
		width: `${width}px`, 
	};
});

// 延迟触发, 用户端在激活时不要立马做操作, 失焦事件需要触发对应的change事件
const resetCurEditor = debounce(function () {
	currentValue.value = props.value;
}, 10);

/**
 * 从Viewer传递出来
 * id 和 history 这是内部字段
 * 
 * @param {object} opts ~
 */
const handleChange = (opts = {}) => {
	if (typeof opts !== 'object') return;
	const { id, history, ...rest } = opts;

	const changed = {};
	for (let key in rest) {
		let val = rest[key];

		['x', 'y', 'z', 'r', 'w', 'h'].includes(key) && (val = Number(val));

		if (hasOwn(rest, key) && !valueIsNaN(val)) {
			changed[key] = val;
		}
	}

	emit('change', {
		type: 'UPDATE',
		id: id || currentValue.value.id,
		changed,
		// 是否记录历史
		history
	});
};

const emitChange = (id, opts = {}) => {
	handleChange({
		...opts,
		id
	});
};

watch(
	() => props.value,
	(v) => {
		// 相关触发失焦，frame 中子元素需要设置prevent，默认不阻止
		resetCurEditor(v);
	},
	{
		deep: true
	}
);

defineExpose({
	emitChange
});

</script>
<style lang="scss">
@import "../style/index.scss";

$block: vm-editor;

@include block($block) {
	flex-shrink: 0;

	@include element(wrapper) {
		position: relative;
		z-index: 2;
		height: 100%;
		padding: 0;
		background: #fff;
		border: 1px solid #0000001a;
		border-radius: 0;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
	}

	@include element(arrow) {
		position: absolute;
		top: 20px;
		left: -7px;
		width: 14px;
		height: 14px;
		background: #fff;
		border-bottom: 1px solid #0000001a;
		border-left: 1px solid #0000001a;
		border-color: #0000;
		border-style: solid;
		transform: translateX(-50%) rotate(45deg);
		transform: rotate(45deg);
		box-shadow: -3px 3px 7px rgba(0, 0, 0, 0.07);
	}
}
</style>
