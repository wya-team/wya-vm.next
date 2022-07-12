<template>
	<div class="vm-align-lines">
		<div 
			v-for="item in alignData.yArr" 
			:key="`y_${item}`" 
			:style="{top: `${item}px`}"  
			class="vm-align-lines__y"
		/>
		<div 
			v-for="item in alignData.xArr" 
			:key="`x_${item}`" 
			:style="{left: `${item}px`}"  
			class="vm-align-lines__x"
		/>
	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	dataSource: {
		type: Array,
		default: () => ([])
	},
	editor: Object
});

const alignData = computed(() => {
	if (props.dataSource.length <= 1 || !props.editor) {
		return {
			xArr: [],
			yArr: []
		};
	}
	const { x, y, w, h } = props.editor || {};
	let xArr = [x, x + w / 2, x + w];
	let yArr = [y, y + h / 2, y + h];

	let xyObj = props.dataSource.reduce((result, itemData = {}) => {

		const { x: $x, y: $y, w: $w, h: $h, id } = itemData;
		if (id !== props.editor.id) {
			let $xArr = [$x, $x + $w / 2, $x + $w];
			let $yArr = [$y, $y + $h / 2, $y + $h];
			result.xArr = [...result.xArr, ...$xArr];
			result.yArr = [...result.yArr, ...$yArr];
		}
		return result;
	}, {
		xArr: [],
		yArr: []
	});
	return {
		xArr: xArr.filter(item => xyObj.xArr.includes(item)),
		yArr: yArr.filter(item => xyObj.yArr.includes(item))
	};
});

</script>

<style lang="scss">
.vm-align-lines {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.vm-align-lines__x {
	position: absolute;
	left: 0;
	width: 1px;
	height: 100%;
	border-left-color: #1fb6ff;
	border-left-style: dotted;
	border-left-width: 1px;
	box-sizing: border-box;
}

.vm-align-lines__y {
	position: absolute;
	top: 0;
	width: 100%;
	height: 1px;
	border-top-color: #1fb6ff;
	border-top-style: dotted;
	border-top-width: 1px;
	box-sizing: border-box;
}
</style>
