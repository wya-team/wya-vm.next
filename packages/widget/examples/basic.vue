<template>
	<Widget 
		module="xxx"
		:transfer-data="transferData"
		:transfer-key="transferKey"
	>
		控件
	</Widget>

	<div 
		style=" width: 100px; height: 100px; border: 1px solid black;"
		@dragover.prevent
		@drop="handleDrop"
	>
		拖到这里面
	</div>
</template>

<script setup>
import { Widget } from '../index.ts';

const transferData = { index: 1, name: 'xxx' };
const transferKey = '@wya/vm';
const handleDrop = (e) => {
	let { module, data } = JSON.parse(e.dataTransfer.getData(transferKey)) || {};
	
	alert(`module: ${module}, data: ${JSON.stringify(data)}`);
};
</script>