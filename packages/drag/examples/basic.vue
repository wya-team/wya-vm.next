<template>
	<div style="height: 100vh;">
		<Drag
			v-model:x="x"
			v-model:y="y"
			:parent="false"
			:handles="handles"
		>
			<div>
				<div @click="handleClick">
					随意拖拽且可点击
				</div>
				<input v-model="value" type="text">
			</div>
		</Drag>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { Message } from '@wya/vc';
import { Drag } from '../index.ts';

const value = ref('我可以输入');

const x = ref(0);
const y = ref(0);

const handles = ref([]);
const handleClick = () => {
	Message.success('你点击了我');
};
</script>