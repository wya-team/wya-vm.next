<template>
	<Modal
		v-model="isActive"
		:mask-closable="false"
		title="绘制热区"
		size="large"
		class="vm-basic-area-paint"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<Button class="vm-hack-entry">
			测试：销毁editor
		</Button>
		<Button class="vm-hack-entry vm-hack-editor">
			测试：无法销毁
		</Button>
		<div>
			<br>
		</div>
		<div style="display: flex; align-items: flex-start;">
			<Combo
				ref="combo"
				v-model="editorData"
				:frame-w="dataSource.frameW"
				:frame-h="dataSource.frameH"
				:width="dataSource.frameW"
				:height="dataSource.frameH > 500 ? 500 : dataSource.frameH"
				:show-widget="false"
				:show-editor="false"
				:show-lines="false"
				:show-ruler="false"
				:show-zoom-bar="false"
				:show-thumbnail="false"
				:modules="[paint]"
				:frame-style="{
					'background-image': `url(${src})`,
					'background-size': '100%'
				}"
			/>
			<div class="vm-basic-area-paint__content">
				<div class="vm-basic-area-paint__operation">
					<Widget module="paint">
						<Button @click="handleAdd">
							添加热区
						</Button>
					</Widget>
					<span style="font-size: 12px; color: #999;">最多10个</span>
				</div>
				<div class="vm-basic-area-paint__list">
					<div
						v-for="(item, index) in editorData"
						:key="index"
						class="vm-basic-area-paint__item"
					>
						<span>热区{{ index + 1 }}：</span>
						<Icon
							type="clear"
							class="vm-basic-area-paint__close"
							@click="handleDelete(index)"
						/>
						<div>
							<Dropdown
								:portal="true"
								trigger="click"
								placement="right-bottom"
								portal-class-name="vm-hack-editor"
								@click="(name) => handleSelect(name, item)"
							>
								<a href="javascript:void(0)">
									<span style="color: #5495f6; cursor: pointer;">链接选择: {{ item.name }}</span>
								</a>
								<template #list>
									<Dropdown.Menu>
										<Dropdown.Item
											v-for="($item, $index) in page"
											:key="$index"
											:name="$item.value"
										>
											{{ $item.label }}
										</Dropdown.Item>
									</Dropdown.Menu>
								</template>
							</Dropdown>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Modal>
</template>
<script setup>
import { watch, onMounted, ref, getCurrentInstance } from 'vue';
import { Button, Modal, Dropdown, Icon } from '@wya/vc';
import { Combo } from '@wya/vm-core';
import { Widget } from '@wya/vm-widget';
import { paint } from './paint/index';

const emit = defineEmits(['portal-fulfilled', 'portal-rejected']);
const props = defineProps({
	src: String,
	dataSource: Object,
	list: Array
});

const combo = ref();
const isActive = ref(false);
const editorData = ref([]);
const page = ref([
	{
		value: "1",
		label: '测试1'
	},
	{
		value: "2",
		label: '测试2'
	}
]);

const instance = getCurrentInstance();
const handleSelect = (value, item) => {
	let it = page.value.find(i => i.value == value);
	item.route = `/${it.value}`;
	item.name = `/${it.label}`;
};

const handleDelete = (index) => {
	editorData.value.splice(index, 1);
};

const handleAdd = () => {
	const id = combo.value.add('paint');
	combo.value.update({
		id,
		x: instance.vnode.el.querySelector('.vm-frame-draggable__wrapper').scrollLeft,
		y: instance.vnode.el.querySelector('.vm-frame-draggable__wrapper').scrollTop
	});
};

const handleOk = () => {
	emit('portal-fulfilled', editorData.value);
};
const handleCancel = () => {
	emit('portal-rejected');
};

watch(
	() => props.list,
	(v) => {
		setTimeout(() => {
			editorData.value = v;
		}, 301);
	},
	{
		immediate: true
	}
);

onMounted(() => {
	isActive.value = true;
});
</script>

<style lang="scss">
$block: vm-basic-area-paint;

@include block($block) {
	@include element(content) {
		width: 100%;
		padding-left: 8px;

		@include element(operation) {
			display: flex;
			padding-bottom: 8px;
			padding-left: 8px;
			border-bottom: 1px solid #e8e8e8;
			justify-content: space-between;
			align-items: flex-end;
		}

		@include element(list) {
			padding-top: 15px;

			@include element(item) {
				position: relative;
				display: flex;
				width: 100%;
				padding: 10px 8px;
				margin-bottom: 15px;
				border: 1px dashed #e8e8e8;
				align-items: flex-start;

				@include element(close) {
					position: absolute;
					top: -8px;
					right: -8px;
					font-size: 16px;
					color: #999;
					cursor: pointer;
				}
			}
		}
	}
}

</style>
