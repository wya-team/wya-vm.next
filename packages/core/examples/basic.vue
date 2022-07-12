<template>
	<Combo 
		ref="combo"
		v-model="list"
		:frame-style="{ background: 'white' }"
		:frame-w="1920"
		:frame-h="1080"
		:modules="defaultModules"
	/>
</template>

<script setup>
import { ref } from 'vue';
import { Combo } from '../index.ts';
import { defaultModules } from './modules/root';

const list = ref([
	{
		id: `PAGE`,
		module: 'page',
		w: window.screen.width,
		h: window.screen.height,
	}
]);
</script>

<style lang="scss">
</style>
