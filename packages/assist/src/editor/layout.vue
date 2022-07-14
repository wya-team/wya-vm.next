<template>
	<div style="display: flex; flex-direction: column;">
		<Header :title="title" />
		<slot />
	</div>
</template>

<script setup>
import Header from './header.vue';

defineProps({
	title: {
		type: [Number, String],
		default: ''
	}
});
</script>
