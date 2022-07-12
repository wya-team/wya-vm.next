<template>
	<div class="vm-grid-lines">
		<div 
			v-for="item in yArr" 
			:key="`y_${item}`" 
			:style="{top: `${item}px`}"  
			class="vm-grid-lines__y"
		/>
		<div 
			v-for="item in xArr" 
			:key="`x_${item}`" 
			:style="{left: `${item}px`}"  
			class="vm-grid-lines__x"
		/>
	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	width: Number,
	height: Number,
	grid: {
		type: Array,
		default: () => {
			return [10, 10];
		}
	}
});

const xArr = computed(() => {
	let length = Math.floor(props.width / props.grid[0]);
	return Array.from({ length }, (v, i) => i * props.grid[0]);
});
const yArr = computed(() => {
	let length = Math.floor(props.height / props.grid[1]);
	return Array.from({ length }, (v, i) => i * props.grid[1]);
});

</script>

<style lang="scss">
.vm-grid-lines {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.vm-grid-lines__x {
	position: absolute;
	left: 0;
	width: 1px;
	height: 100%;
	border-left-color: rgb(214, 214, 214);
	border-left-style: dotted;
	border-left-width: 1px;
	box-sizing: border-box;
}

.vm-grid-lines__y {
	position: absolute;
	top: 0;
	width: 100%;
	height: 1px;
	border-top-color: rgb(214, 214, 214);
	border-top-style: dotted;
	border-top-width: 1px;
	box-sizing: border-box;
}
</style>
