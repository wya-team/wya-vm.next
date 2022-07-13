<template>
	<div style="display: flex; flex-direction: column;">
		{{ x }}
		<div>w: <input :value="w" @input="handleChange($event, 'w')"></div>
		<div>h: <input :value="h" @input="handleChange($event, 'h')"></div>
		<div>x: <input :value="x" @input="handleChange($event, 'x')"></div>
		<div>y: <input :value="y" @input="handleChange($event, 'y')"></div>
		<div>z: <input :value="z" @input="handleChange($event, 'z')"></div>
		<div>r: <input :value="r" @input="handleChange($event, 'r')"></div>
		<div>name: <input :value="name" @input="handleChange($event, 'name')"></div>
	</div>
</template>

<script setup>
	
const emit = defineEmits(['change']);
defineProps({
	w: Number,
	h: Number,
	r: Number,
	x: Number,
	y: Number,
	z: Number,
	name: [Number, String],
});

const handleChange = (e, key) => {
	emit('change', { [key]: e.target.value });
};
</script>

<style lang="scss">
</style>
