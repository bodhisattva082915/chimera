import { Mapper } from 'js-data';

class ChimeraMapper extends Mapper {
	constructor (opts) {
		super({
			idAttribute: '_id',
			...opts
		});
	}
}

export default ChimeraMapper;
