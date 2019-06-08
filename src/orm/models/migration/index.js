import template from './template';

export { default as schema } from './schema';

export const discriminators = {
	[template.name]: template
};
