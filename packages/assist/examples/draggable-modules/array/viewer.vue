<template>
	<div :style="[{ height: `${h ? `${h}px` : 'auto' }`, width: `${w ? `${w}px` : 'auto' }`, color: 'black' }]">
		id: {{ id }} <br>
		X: {{ x }} <br>
		Y: {{ y }} <br>
		Z: {{ z }} <br>
		Width: {{ w ? w : 'auto' }} <br>
		Height: {{ h ? h : 'auto' }} <br>
		Rotate: {{ r }} <br>
		Name: {{ name }} <br>
	</div>
</template>

<script setup>
defineProps({
	vm: {
		type: Object,
		default: () => ({})
	},
	id: String,
	x: Number,
	y: Number,
	z: Number,
	w: Number,
	h: Number,
	r: Number,
	name: [Number, String]
});
</script>

<style lang="scss">
</style>
