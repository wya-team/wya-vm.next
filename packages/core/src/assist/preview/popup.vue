<template>
	<div class="vm-assist-preview-popup" :style="popupStyle">
		<transition v-if="mask" :name="animate">
			<div v-show="isActive" class="vm-assist-preview-popup__mask" @click="handleClose" />
		</transition>
		<transition v-if="mask" :name="animate">
			<div v-show="isActive" class="vm-assist-preview-popup__close" @click="handleClose">
				&#10005;
			</div>
		</transition>
		<transition :name="animate">
			<div v-show="isActive" class="vm-assist-preview-popup__content">
				<component :is="componentType" ref="htmlImg">
					<Preview
						:style="styles"
						:data-source="dataSource" 
						:mode="mode"
						:modules="modules"
					/>
				</component>
			</div>
		</transition>
	</div>
</template>

<script setup>
import { HtmlImage } from '@wya/vc';
import Preview from './preview.vue';

const props = defineProps({
	dataSource: Array,
	styles: {
		type: Object
	},
	className: {
		type: String
	},
	animate: {
		type: String,
		default: 'vm-fade'
	},
	mask: {
		type: Boolean,
		default: true
	},
	mode: {
		type: String,
		default: 'draggable'
	},

	// download / image
	expect: {
		type: String,
	},

	imageOptions: Object,
	modules: Object
});

const isActive = ref(false);
const useImageMode = computed(() => {
	return props.expect === 'image' || props.expect === 'download';
});

const componentType = computed(() => {
	return useImageMode.value ? HtmlImage : 'div';
});

const popupStyle = computed(() => {
	if (useImageMode.value) {
		return {
			top: '100%',
			bottom: 'unset'
		};
	}
	return {};
});

const generateImage = async () => {
	if (props.expect !== 'image') return;
	try {
		const res = await this.$refs.htmlImg.getImage(this.imageOpts || {});

		isActive.value = false;
		emit('portal-fulfilled', res);
	} catch (e) {
		isActive.value = false;
		emit('portal-reject', res);
	}
};

const handleClose = () => {
	isActive.value = false;
	setTimeout(() => {
		emit('portal-reject', res);
	}, 300); // 动画时间
};

defineExpose({
	generateImage
});

</script>

<style lang="scss">
.vm-assist-preview-popup {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.vm-assist-preview-popup__mask {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 997;
	width: 100%;
	height: 100%;
	background-color: rgba(#000, 0.2);

	/* opacity: 0; */
	transition: opacity 0.2s;
}

.vm-assist-preview-popup__content {
	position: relative;
	z-index: 998;
	max-width: 100vw;
	max-height: 100vh;
	overflow: auto; /* 区域之外不形式 */
	transition: transform 0.2s, opacity 0.2s;
}

.vm-assist-preview-popup__close {
	position: absolute;
	top: 30px;
	right: 30px;
	z-index: 999;
	font-size: 24px;
}

.vm-fade-enter,
.vm-fade-leave-active {
	opacity: 0;
}
</style>
