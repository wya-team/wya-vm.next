<template>
	<div class="vm-hack-entry">
		<div style="padding: 10px">
			<vc-button @click="theme = theme === 'dark' ? 'light' : 'dark'">
				主题: {{ theme }}
			</vc-button>
			<vc-button @click="showSlots = !showSlots">
				头部/尾部: {{ showSlots ? '展示' : '隐藏' }}
			</vc-button>
			<vc-button @click="$refs.combo.preview()">
				预览
			</vc-button>
			<vc-button @click="$refs.combo.undo()">
				撤回
			</vc-button>
			<vc-button @click="$refs.combo.redo()">
				取消撤回
			</vc-button>
		</div>

		<!-- <vm-preview :data-source="list"/> -->
		<vm-combo 
			ref="combo"
			v-model="list"
			:frame-w="375"
			:frame-h="606"
			:editor-w="400"
			:show-assist="false"
			:width="style.width"
			:height="style.height"
			:modules="defaultModules"
			mode="sortable"
			@save="handleSave"
			@error="handleError"
		>
			<template v-if="showSlots" #frame-header>
				<div>header</div>
			</template>
			<template v-if="showSlots" #frame-footer>
				<div>footer</div>
			</template>
		</vm-combo>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { Message, Utils, Button as VcButton } from '@wya/vc';
import { Combo as VmCombo } from '@wya/vm';
import { defaultModules } from './modules/root';

const { Resize } = Utils;

const list = ref([
	{
		id: String(Math.random()),
		module: 'page',
	}
]);

const style = ref({
	width: window.innerWidth - 40,
	height: window.innerHeight - 60,
});

const theme = ref('dark');
const showSlots = ref(false);


const handleResize = () => {
	// 需要减去padding值
	style.value = {
		width: window.innerWidth - 40,
		height: window.innerHeight - 60,
	};
};

const handleSave = (response) => {
	console.log(response, list.value);
};

const handleError = ({ msg }) => {
	Message.error(msg);
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
