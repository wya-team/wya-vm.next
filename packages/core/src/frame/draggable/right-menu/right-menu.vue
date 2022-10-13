<template>
	<div
		v-show="isActive"
		ref="vm-right-menu"
		:style="{
			left: `${event.clientX}px`,
			top: `${top}px`
		}"
		class="vm-right-menu"
	>
		<div class="vm-right-menu__content">
			<div
				v-for="item in menu"
				:key="item"
				class="vm-right-menu__item"
				@click="handleClick(item)"
				@mousedown.stop
			>
				<Icon
					:type="icons[item]"
					class="vm-right-menu__icon"
				/>
				<span>
					{{ typeof menuName[item] === 'function' ? menuName[item](dataSource) : menuName[item] }}
				</span>
			</div>
		</div>
	</div>
</template>
<script setup>
import { onMounted, onUnmounted, ref, getCurrentInstance, computed } from 'vue';
import { Icon } from '@wya/vc';
import { RIGHT_MENU_MAP, RIGHT_MENU_NAME_MAP, RIGHT_MENU_ICON_MAP } from '../../../utils/constants';

const emit = defineEmits(['portal-fulfilled', 'portal-rejected']);
const props = defineProps({
	event: MouseEvent,
	dataSource: {
		type: Object,
		default: () => ({})
	},
	// 用于右键过滤显示元素
	filter: {
		type: Function,
		default() {
			return () => true;
		}
	},
	icons: {
		type: Object,
		default: () => {
			return RIGHT_MENU_ICON_MAP;
		}
	}
});

const instance = getCurrentInstance();
const isActive = ref(false);
const wrapHeight = ref(175);
const menuName = ref(RIGHT_MENU_NAME_MAP);
const menu = ref(Object.keys(RIGHT_MENU_MAP).map((key) => RIGHT_MENU_MAP[key]).filter(props.filter));

const top = computed(() => {
	return (window.innerHeight - props.event.clientY) < wrapHeight.value
		? (props.event.clientY - wrapHeight.value) : props.event.clientY;
});

const handleClick = (item) => {
	isActive.value = false;
	emit('portal-fulfilled', item);
};

const operateDOMEvents = (type) => {
	let fn = (
		type === 'add'
			? document.documentElement.addEventListener
			: document.documentElement.removeEventListener
	).bind(document.documentElement);

	fn('click', handleDeselect);
};

const handleDeselect = (e) => {
	let path = e.path || e.composedPath() || [];
	let inArea = path.some(el => el === instance.vnode.el || el === props.event.target);

	if (!inArea) {
		isActive.value = false;
		emit('portal-rejected');
	}
};

onMounted(() => {
	isActive.value = true;
	operateDOMEvents('add');
});

onUnmounted(() => {
	operateDOMEvents('remove');
});
</script>f
<style lang="scss">
.vm-right-menu {
	position: fixed;
	z-index: 1999;
	width: 104px;
	padding: 6px 0;
	background: #444;
	border: 1px solid #47daff;
	border-radius: 4px;

	.vm-right-menu__content {
		display: flex;
		flex-direction: column;
		align-items: center;

		.vm-right-menu__item {
			display: block;
			display: flex;
			width: 100%;
			height: 32px;
			padding-left: 14px;
			line-height: 32px;
			color: #fff;
			cursor: pointer;
			align-items: center;
			justify-content: flex-start;

			&:hover {
				color: #16f2f6;
				background: #343434;
			}
		}

		.vm-right-menu__icon {
			margin-right: 8px;
			font-size: 12px;
		}
	}
}
</style>
