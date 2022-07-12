<template>
	<div :style="style" class="vm-widget">
		<div class="vm-widget__wrapper">
			<p class="vm-widget__header">
				组件库
			</p>
			<div v-if="showTip" class="vm-widget__tip">
				<span class="vm-widget__icon-warn">!</span>
				<p>请拖动下方组件到指定位置设置</p>
				<span @click="showTip = !showTip">✕</span>
			</div>
			<div class="vm-widget__menu">
				<div class="vm-widget__tabs">
					<p
						v-for="(item) in tabs"
						:key="item"
						:class="{ 'is-active': currentTab == item}"
						@click="currentTab = item"
					>
						{{ item }}
					</p>
				</div>
				<div :style="contentStyle" class="vm-widget__content">
					<Widget
						v-for="(it) in toolsList[currentTab]"
						:key="it.module"
						:draggable="it.draggable"
						:module="it.module"
					>
						<!-- 组件标题 -->
						<div
							:class="{ 'is-active': it.active, 'is-draggable': it.draggable, 'is-click': it.widgets }"
							class="vm-widget__title"
							@click="it.widgets && (it.active = !it.active)"
						>
							<!-- eslint-disable -->
							<p v-if="typeof it.component === 'string'" v-html="it.component" />
							<!-- eslint-enable -->
							<component :is="it.Widget" v-else v-on="handleEvent(it.module)" />
							<div v-if="it.widgets" class="vm-widget__arrow" />
						</div>
						<!-- 子元素 -->
						<div v-if="it.active" class="vm-widget__combo">
							<Widget
								v-for="(widget, index) in it.widgets"
								:key="index"
								:module="it.module"
								:transfer-data="index"
								draggable
								class="vm-widget__item"
							>
								<template v-if="widget.render">
									<Customer
										:render="widget.render"
										:index="index"
									/>
								</template>
								<template v-else>
									<img :src="widget.image">
									<p>{{ widget.name }}</p>
								</template>
							</Widget>
						</div>
					</Widget>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Widget } from '@wya/vm-widget';
import { Customer } from '@wya/vc';
import { hasOwn } from '../utils/helper';

const emit = defineEmits(['change']);
const props = defineProps({
	width: Number,
	height: Number,
	type: {
		type: String,
		default: 'free' // sort-list
	},
	dataSource: Array,
	contentStyle: Object,
	modules: Object
});


const toolsList = ref([]);

const tabs = computed(() => {
	return Object.keys(toolsList.value).filter(i => i && i !== 'undefined');
});

const showTip = ref(true);
const currentTab = ref();

const style = computed(() => {
	const w = props.width === 0 ? 'auto' : `${props.width}px`;
	const h = props.height === 0 ? 'auto' : `${props.height}px`;

	return {
		width: w,
		height: h
	};
});

const handleEvent = (module) => {
	return {
		change: (...rest) => emit('change', module, ...rest)
	};
};

watch(
	() => props.modules,
	(modules) => {
		let isFirst;
		let result = {};
		for (let key in modules) {
			// 过滤页面设置
			if (hasOwn(modules, key) && modules[key].type !== 'basic') {
				let item = modules[key];
				let type = item.type || 'undefined';
				if (!result[type]) {
					result[type] = [];
					isFirst = true;
				}
				if (item.showWidget || typeof item.showWidget === 'undefined') {
					result[type].push({
						module: item.module,
						component: item.Widget || item.name,
						widgets: item.widgets,
						// 最外层拖拽
						draggable: !!(!item.widgets && item.Viewer && item.Editor),

						// 更多, 由click事件控制
						active: !!(isFirst && item.widgets)
					});
				}
			}
			isFirst = false;
		}
		toolsList.value = result;

		if (!currentTab.value) {
			currentTab.value = tabs.value[0];
		}
	},
	{
		immediate: true
	}
);
</script>

<style lang="scss">
@import "../style/index.scss";

$block: vm-widget;
$tabs-w: 48px;
$content-w: 236px;
$w: $tabs-w + $content-w;

@include block($block) {
	flex: 0 0 $w;
	width: $w;

	@include element(wrapper) {
		display: flex;
		height: 100%;
		padding: 10px 0 0;
		background: $white;
		flex-direction: column;
		align-items: stretch;
	}

	@include element(header) {
		padding: 8px 15px;
		font-size: 15px;
		font-weight: 400;
		color: #000;
	}

	@include element(tip) {
		display: flex;
		height: 40px;
		padding: 0 10px;
		margin: 2px 9px 15px;
		color: $assit;
		background: #fdf5e8;
		border: none;
		border-radius: 4px;
		align-items: center;

		p {
			flex: 1;
		}

		span {
			/* color: $assit; */
			cursor: pointer;
		}
	}

	@include element(icon-warn) {
		width: 14px;
		height: 14px;
		margin-right: 7px;
		font-size: 12px;
		line-height: 14px;
		color: $white;
		text-align: center;
		background: #ec9c39;
		border-radius: 100%;
	}

	@include element(menu) {
		display: flex;
		overflow-y: auto;
		border-top: 1px solid $border;
		flex: 1;
		justify-content: space-between;
		align-items: stretch;
		flex-wrap: nowrap;
	}

	@include element(tabs) {
		display: flex;
		width: $tabs-w;
		height: 100%;
		padding: 0;
		font-size: 12px;
		line-height: 24px;
		color: $assit;
		border-right: 1px solid $border;
		justify-content: flex-start;
		flex-direction: column;

		@include scroller();

		p {
			height: 49px;
			line-height: 49px;
			text-align: center;
			cursor: pointer;

			&.is-active {
				color: $black;
				background-color: $acitved;
			}
		}
	}

	@include element(content) {
		width: $content-w;
		height: 100%;
		overflow: auto;

		@include scroller();
	}

	@include element(title) {
		/* font-weight: bold; */
		display: flex;
		padding: 15px 12px;
		font-size: 12px;
		color: #000;
		cursor: pointer;
		border-bottom: 1px solid $border;
		justify-content: space-between;
		align-items: center;

		@include when(draggable) {
			cursor: move;
		}

		@include when(click) {
			cursor: pointer;
		}

		@include when(active) {
			color: $primary;

			.vm-widget__arrow {
				transform: rotate(-135deg);
			}
		}
	}

	@include element(arrow) {
		width: 8px;
		height: 8px;
		border: 2px solid $border;
		border-top: 0;
		border-left: 0;
		transform: rotate(45deg);
		transition: transform 0.2s ease-in-out;
	}

	@include element(combo) {
		display: flex;
		width: 100%;

		/* justify-content: center; */
		padding: 6px 6px;
		border-bottom: 1px solid $border;
		flex-wrap: wrap;
	}

	@include element(item) {
		flex: 0 0 50%;
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: 6px 6px;
		cursor: move;

		img {
			width: 100%;

			/* border: 1px dashed $border; */
		}

		p {
			padding-top: 8px;
		}
	}
}

</style>
