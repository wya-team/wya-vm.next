<template>
	<div :class="{ 'is-dark': isDark }" class="vm-ruler">
		<!-- 坐标原点，定位 -->
		<div
			:style="{
				width: `${guideSize}px`,
				height: `${guideSize}px`,
			}"
			:title="`单击${showGuide ? '隐藏' : '显示'}辅助线`"
			class="vm-ruler__guide"
			@click="showGuide = !showGuide"
		/>
		<!-- x轴 -->
		<div
			ref="x"
			:style="{ transform: `translateX(${-scrollLeft}px)` }"
			class="vm-ruler__x"
			@mousemove="handleShowGuideX"
			@mouseleave="showGuideX = false"
		>
			<canvas
				ref="canvasX"
				:width="canvasW"
				:height="guideSize"
				class="vm-ruler__canvas"
			/>
			<!-- X虚线 -->
			<div
				v-show="showGuideX"
				ref="guideX"
				:style="{ left: `${mouseX * scale + placeholderW}px`}"
				class="vm-ruler__guide-x"
				@click.stop="handleAddLineX"
			>
				<span>
					{{ mouseX }}
				</span>
			</div>
			<!-- X实线 -->
			<template v-if="showGuide">
				<div
					v-for="(item, index) in linesX"
					:key="index"
					:style="{
						left: `${item * scale + placeholderW}px`,
					}"
					title="双击删除参考线"
					class="vm-ruler__guide-x is-solid"
					@mousedown.stop="handleMouseDown('x', index)"
					@dblclick="linesX.splice(index, 1)"
				>
					<span>
						{{ item }}
					</span>
				</div>
			</template>
		</div>

		<div class="vm-ruler__wrapper" :style="{ height: `calc(100% - ${guideSize}px)` }">
			<div class="vm-ruler__y">
				<div
					ref="y"
					:style="{
						transform: `rotate(90deg) translateX(${-scrollTop}px)`,
					}"
					class="vm-ruler__y-rotate"
					@mousemove="handleShowGuideY"
					@mouseleave="showGuideY = false"
				>
					<canvas
						ref="canvasY"
						:width="canvasW"
						:height="guideSize"
						class="vm-ruler__canvas"
					/>

					<!-- Y虚线 -->
					<div
						v-show="showGuideY"
						:style="{
							left: `${mouseY * scale + placeholderW}px`,
						}"
						class="vm-ruler__guide-y"
						@click.stop="handleAddLineY"
					>
						<span>
							{{ mouseY }}
						</span>
					</div>

					<!-- Y实线 -->
					<template v-if="showGuide">
						<div
							v-for="(item, index) in linesY"
							:key="index"
							:style="{
								left: `${item * scale + placeholderW}px`,
							}"
							class="vm-ruler__guide-y is-solid"
							title="双击删除参考线"
							@mousedown.stop="handleMouseDown('y', index)"
							@dblclick="linesY.splice(index, 1)"
						>
							<span>
								{{ item }}
							</span>
						</div>
					</template>
				</div>
			</div>
			<slot />
		</div>
	</div>
</template>

<script setup>
import { reactive, ref, computed, watch, onBeforeMount, onUnmounted, onMounted } from 'vue';

import { Clipboard } from '@wya/vc';
import { $, debounce } from '../../utils/helper';

const emit = defineEmits(['guides-change']);
const props = defineProps({
	scrollTop: {
		type: Number,
		default: 0
	},
	scrollLeft: {
		type: Number,
		default: 0
	},
	frameW: {
		type: Number,
		default: 0
	},
	frameH: {
		type: Number,
		default: 0
	},
	clientW: {
		type: Number,
		default: 0
	},
	clientH: {
		type: Number,
		default: 0
	},
	scale: {
		type: Number,
		default: 1
	},
	guides: Array,
	theme: String,
	borderSize: {
		type: Object,
		default() {
			return {
				top: 0,
				left: 0,
				bottom: 0,
				right: 0
			};
		}
	},
	scrollerSize: {
		type: Number,
		default: 0
	}
});

const isMounted = ref(false);
// 辅助线开关区域宽高
const guideSize = ref(20);

// 是否显示鼠标移动的X/Y轴辅助线 (虚线)
const showGuide = ref(true);
const showGuideX = ref(false);
const showGuideY = ref(false);
// 鼠标在X/Y轴的坐标
const mouseX = ref(0);
const mouseY = ref(0);
// 横轴起始X/Y位置
const offsetX = ref(0);
const offsetY = ref(0);

// X/Y轴辅助线 (实线)
const linesX = reactive([]);
const linesY = reactive([]);

const canvas = ref([]);
const canvasX = ref(null);
const canvasY = ref(null);
const x = ref(null);
const y = ref(null);

const movingAxias = ref('');
const movingIndex = ref(-1);

/**
 * 刻度的宽度
 */
const canvasW = computed(() => {
	const { frameW, frameH, scale, borderSize, clientW, clientH } = props;
	const { scrollerSize } = props;

	const offsetW = borderSize.left + borderSize.right + guideSize.value;
	const offsetH = borderSize.top + borderSize.bottom + guideSize.value;

	/**
	 * TODO: 动态计算
	 * 用于滚动距离避免重绘[动态计算canvasW时出现不绘制]，主要是元素拖动到画布以外，超过5000就不计算了
	 */
	let width = Math.max(
		5000,
		frameW * scale + offsetW,
		frameH * scale + offsetH,
		clientW,
		clientH
	);
	return scrollerSize + width;
});
// 0刻度距离轴容器左边的距离
const placeholderW = computed(() => {
	return props.borderSize.left + guideSize.value;
});

// 10刻度间隔(缩放后)
const interval = computed(() => {
	const { scale } = props;
	// 10刻度所占像素初始值
	let width = 100;
	
	if (scale <= 0) return width;

	// 目标： 缩放后十刻度占屏幕实际尺寸 60 - 100 像素
	while (width * scale < 60) { // 缩小
		width += 50;
	}
	while (width * scale > 100) { // 放大
		width - 20 >= 0 ? width -= 20 : width -= 10;
	}
	return width * scale;
});

const isDark = computed(() => {
	return props.theme === 'dark';
});

const refreshCanvas = () => {
	canvas?.value?.forEach?.($canvas => repaint($canvas.value));
};

// 轴距离容器左边有20px的间距和辅助线开关区域的宽度
const repaint = ($canvas) => {
	if (!isMounted.value || !$canvas) return;
	let ctx = $canvas.getContext('2d');
	// 重置画布
	$canvas.height = $canvas.height; // eslint-disable-line

	ctx.beginPath();
	ctx.fillStyle = isDark.value ? '#474747' : '#FAFAFA';
	ctx.fillRect(0, 0, canvasW.value, guideSize.value);
	ctx.translate(placeholderW.value, 0); // (20, 0)坐标开始画10刻度线
	ctx.fillStyle = isDark.value ? "#615E5B" : '#000';
	ctx.save();
	for (let i = 0; i < canvasW.value / interval.value; i++) {
		// 画刻度线
		ctx.fillStyle = isDark.value ? "#615E5B" : '#000';
		ctx.translate(i * interval.value, 0);
		ctx.fillRect(0, 0, 1, guideSize.value);
		ctx.restore();
		ctx.save();
		// 返回画刻度数字
		ctx.fillStyle = "#8C8D89";
		ctx.font = "12px";
		// 文字在轴内的 3/5 位置
		ctx.fillText(((i * interval.value) / props.scale).toFixed(0), i * interval.value + 4, (guideSize.value / 5) * 3);
	}
	// 还原到 (20, 0)坐标
	ctx.restore();
	// 移到 (20, 17)坐标
	ctx.translate(0, guideSize.value - 3);
	ctx.save(); // (20, 17)坐标开始画1刻度线
	for (let i = 0; i < (canvasW.value / interval.value) * 10; i++) {
		if (i % 10 !== 0) {
			ctx.translate((i * interval.value) / 10, 0);
			ctx.fillRect(0, 0, 1, 3);
			ctx.restore();
			ctx.save();
		}
	}
};

// 参考X虚线显示
const handleShowGuideX = (e) => {
	const { scrollLeft, scale } = props;
	if (
		x.value.contains(e.target)
		&& !$(e.target).hasClass('is-solid')
	) {
		showGuideX.value = true;
		mouseX.value = Math.floor((e.clientX - offsetX.value - placeholderW.value + scrollLeft) / scale);
	} else {
		showGuideX.value = false;
	}
};

// 参考Y虚线显示
const handleShowGuideY = (e) => {
	const { scrollTop, scale } = props;
	if (
		y.value.contains(e.target)
		&& !$(e.target).hasClass('is-solid')
	) {
		showGuideY.value = true;
		mouseY.value = Math.floor((e.clientY - offsetY.value - placeholderW.value + scrollTop) / scale);
	} else {
		showGuideY.value = false;
	}
};

const handleAddLineX = () => {
	!linesX.includes(mouseX.value) && linesX.push(mouseX.value);
};

const handleAddLineY = () => {
	!linesY.includes(mouseY.value) && linesY.push(mouseY.value);
};

const operateDOMEvents = (type) => {
	let fn = (
		type === 'add'
			? document.documentElement.addEventListener
			: document.documentElement.removeEventListener
	).bind(document.documentElement);

	fn('mouseup', handleMouseUp);
	fn('mousemove', handleMouseMove);
};

// 鼠标按下事件
const handleMouseDown = (axias, index) => {
	Clipboard.clearSelection();

	movingIndex.value = index;
	movingAxias.value = axias;

	operateDOMEvents('add');
};

// 鼠标放手事件
const handleMouseUp = () => {
	Clipboard.clearSelection();
	operateDOMEvents('remove');
};

const handleMouseMove = (e) => {
	const { scrollLeft, scrollTop, scale } = props;
	if (movingAxias.value === 'x') {
		linesX.splice(
			movingIndex.value,
			1,
			Math.floor((e.clientX - offsetX.value - placeholderW.value + scrollLeft) / scale),
		);
		return;
	}

	if (movingAxias.value === 'y') {
		linesY.splice(
			movingIndex.value,
			1,
			Math.floor((e.clientY - offsetY.value - placeholderW.value + scrollTop) / scale),
		);
		return;
	}
};

watch(
	() => linesX,
	() => {
		emit('guides-change', [linesX, linesY]);
	},
	{ deep: true }
);

watch(
	() => linesY,
	() => {
		emit('guides-change', [linesX, linesY]);
	},
	{ deep: true }
);

onBeforeMount(() => {
	let watchArr = [
		'frameW',
		'frameH',
		'scale',
		'clientW',
		'clientH',
		'theme'
	];

	let hook = debounce(refreshCanvas, 50);

	watchArr.forEach(item => watch(() => props[item], hook));
});

onMounted(() => {
	isMounted.value = true;
	// 兼容使用portal时，有300ms的动画延迟
	setTimeout(() => {
		canvas.value = [canvasX, canvasY];
		offsetX.value = x.value.getBoundingClientRect().x;
		offsetY.value = y.value.getBoundingClientRect().y;
		refreshCanvas();
	}, 300);
});

onUnmounted(() => {
	operateDOMEvents('remove');
});

defineExpose({
	guideSize
});
</script>

<style lang="scss">
@import "../../style/index.scss";

$block: vm-ruler;
$blue-guide: rgba(0, 173, 255, 0.84);
$blue-label: rgba(64, 116, 180, 0.7);

@include block($block) {
	/* height: 100%; // 动态计算 */
	position: relative;
	display: flex;
	flex-direction: column;

	@include element(x) {
		position: relative;
		z-index: 2;
		display: flex;
	}

	@include element(wrapper) {
		display: flex;

		/* height: 100% // 动态计算 */
	}

	@include element(y) {
		z-index: 2;
		width: 20px;
		height: 100%;
	}

	@include element(y-rotate) {
		position: relative;
		display: flex;
		margin-top: -39px;
		transform-origin: 0 100% 0;
	}

	@include element(guide) {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 3;
		width: 20px;
		height: 20px;
		cursor: pointer;
		background: $theme-light-bg;
	}

	@include element(canvas) {
		background: $theme-light-ruler-bg;
	}

	@include when(dark) {
		@include element(canvas) {
			background: $theme-dark-ruler-bg;
		}

		@include element(guide) {
			background: $theme-dark-guide-bg;
		}

		@include element(guide) {
			background: $theme-dark-guide-bg;
		}
	}
}

@include block(vm-ruler__guide-x) {
	position: absolute;
	top: 0;
	height: 100vh;
	padding-left: 5px;
	cursor: ew-resize;
	border-left: 1px dashed $blue-guide;

	> span {
		position: absolute;
		display: flex;
		padding: 0 4px;
		line-height: 20px;
		color: #fff;
		background: $blue-label;
		border-radius: 1px;
		box-shadow: 0 0 5px -3px #000;
		user-select: none;
		justify-content: center;
		align-items: center;
	}

	@include when(solid) {
		border-left: 1px solid $blue-guide;
	}
}

@include block(vm-ruler__guide-y) {
	position: absolute;
	top: 20px;
	width: 100vw;
	padding-bottom: 5px;
	cursor: ns-resize;
	border-bottom: 1px dashed $blue-guide;
	transform: rotate(-90deg);
	transform-origin: 0 100% 0;

	> span {
		position: absolute;
		top: 5px;
		left: 25px;
		padding: 0 4px;
		line-height: 20px;
		color: #fff;
		background: $blue-label;
		border-radius: 1px;
		transform: rotate(90deg);
		box-shadow: 0 0 5px -3px #000;
		user-select: none;
		transform-origin: 0 0 0;
	}

	@include when(solid) {
		border-bottom: 1px solid $blue-guide;
	}
}

</style>
