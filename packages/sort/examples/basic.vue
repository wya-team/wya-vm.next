<template>
	<div class="wrapper">
		<transition-group tag="div" name="flip-list">
			<div v-for="(it, index) in dataSource" :key="it._id" class="item">
				<Sort
					ref="sort"
					:index="index"
					:prevent="false"
					@sorting="handleSort"
				>
					<div style="padding: 20px;">
						{{ it._id }}
					</div>
				</Sort>
			</div>
		</transition-group>
	</div>
</template>

<script setup>
import { reactive } from 'vue'; 
import { Sort } from '../index.ts';

const dataSource = reactive(Array.from({ length: 10 }).map((_, index) => ({ _id: index + 1 })));
const handleSort = (changed) => {
	let current = dataSource[changed[0]];

	// 插入, 如果在目标元素之后插入，插入位置+1;
	dataSource.splice(changed[1] + (changed[0] < changed[1]), 0, current);
	// 删除自身, 如果在之前插入，删除位置+1;
	dataSource.splice(changed[0] + (changed[0] > changed[1]), 1);
};

</script>

<style lang="scss">
.wrapper {
	position: relative;
	overflow: auto;
	border: 1px solid #999;
	flex-shrink: 0;
}

.item {
	transition: all 0.5s;
}

// 开始消失/进入的元素
.flip-list-enter,
.flip-list-leave-to {
	opacity: 0;
}

.flip-list-leave-active {
	display: none;
}
</style>