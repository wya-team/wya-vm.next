import { getCurrentInstance } from 'vue';

export const getInstance = (componentName, privateKey) => {
	const instance = getCurrentInstance();
	const regex = new RegExp(`${componentName}$`);

	return (() => {
		let parent = instance.parent;
		while (
			parent 
			&& !(regex.test(parent?.type?.__name))
			&& (!privateKey || !parent?.[privateKey] || !parent?.proxy?.[privateKey])
		) {
			parent = parent.parent || parent?.type?.parent; // 和portal临时约定
		}
		return parent;
	})();
};
