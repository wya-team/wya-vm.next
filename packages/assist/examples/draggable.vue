<template>
	<div style="position: absolute; top: 5px;">
		<Button @click="theme = theme === 'dark' ? 'light' : 'dark'">
			主题: {{ theme }}
		</Button>
		<Button @click="showRuler = !showRuler">
			标尺: {{ showRuler ? '展示' : '隐藏' }}
		</Button>
		<Button @click="showLines = !showLines">
			网格: {{ showLines ? '展示' : '隐藏' }}
		</Button>
		<Button @click="showZoomBar = !showZoomBar">
			视口大小: {{ showZoomBar ? '展示' : '隐藏' }}
		</Button>
		<Button @click="showThumbnail = !showThumbnail">
			缩略图: {{ showThumbnail ? '展示' : '隐藏' }}
		</Button>
		<Button @click="showSlots = !showSlots">
			头部/尾部(缩放为1时展示): {{ showSlots ? '展示' : '隐藏' }}
		</Button>
		<Button @click="combo.preview()">
			预览
		</Button>
		<Button @click="combo.undo()">
			撤回
		</Button>
		<Button @click="combo.redo()">
			取消撤回
		</Button>
		<Button @click="loadData">
			重置
		</Button>
		<Button @click="combo.download()">
			下载
		</Button>
		<Button @click="combo.upload()">
			上传
		</Button>

		<Button @click="handleClick">
			图片
		</Button>
	</div>
	<div style="padding: 40px 20px 20px 20px">
		<Combo 
			ref="combo"
			v-model="list"
			:frame-style="{ background: 'white' }"
			:frame-w="1920"
			:frame-h="1080"
			:width="style.width"
			:height="style.height"
			:show-lines="showLines"
			:show-zoom-bar="showZoomBar"
			:show-thumbnail="showThumbnail"
			:show-ruler="showRuler"
			:theme="theme"
			:modules="defaultModules"
			keyboard-enabled
			@save="handleSave"
			@error="handleError"
		>
			<template v-if="showSlots" #frame-header>
				<div>header</div>
			</template>
			<template v-if="showSlots" #frame-footer>
				<div>footer</div>
			</template>
		</Combo>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Utils, Button, Message } from '@wya/vc';
import { Combo } from '@wya/vm-core';
import { defaultModules } from './draggable-modules/root';

const { Resize } = Utils;

const list = ref([
	{
		id: `PAGE`,
		module: 'page',
		w: window.screen.width,
		h: window.screen.height,
	}
]);

const combo = ref();
const style = ref({
	width: window.innerWidth - 40,
	height: window.innerHeight - 60,
});
const theme = ref('dark');
const showRuler = ref(true);
const showZoomBar = ref(true);
const showThumbnail = ref(true);
const showLines = ref(false);
const showSlots = ref(true);


const handleResize = () => {
	// 需要减去padding值
	style.value = {
		width: window.innerWidth - 40,
		height: window.innerHeight - 60,
	};
};

const handleClick = async () => {
	const res = await combo.value.getImage();
	console.log(res);
};

const handleSave = (response) => {
	console.log(response, list.value);
};

const handleError = ({ message }) => {
	Message.error(message);
};

const loadData = () => {
	list.value = [
		{
			id: `PAGE`,
			module: 'page',
			w: window.screen.width,
			h: window.screen.height,
		}
	];
};

onMounted(() => {
	Resize.on(document.body, handleResize);
});

onUnmounted(() => {
	Resize.off(document.body, handleResize);
});
</script>

<style lang="scss">
</style>
