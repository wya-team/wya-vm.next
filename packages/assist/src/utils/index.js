export const getImagesSize = async (images) => {
	const isSingle = !(images instanceof Array);
	isSingle && (images = [images]);
	images = images.filter(i => !!i && typeof i === 'string');

	const v = await images.reduce((pre, src) => {
		return pre.then((result) => {
			return new Promise((resolve) => {
				let img = new Image();
				let done = () => {
					result[src] = {
						width: img.naturalWidth || 0,
						height: img.naturalHeight || 0
					};
					resolve(result);
					img = null;
				};
				
				img.src = src;
				img.onload = done;
				img.onerror = done;
			});
		});
	}, Promise.resolve({}));

	return isSingle ? v[images[0]] : v;
};