import { reactive } from 'vue';
import { Mixins } from '../utils/helper';
import History from './history-mixin';
import Editor from './editor-mixin';

class BaseWatcher {
	constructor() {
		this.states = reactive({
			data: [],
		});

		this.onReady.forEach(fn => fn.call(this));
	}
}

export default Mixins(BaseWatcher, History, Editor); 