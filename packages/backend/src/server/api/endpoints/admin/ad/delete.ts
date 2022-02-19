import define from '../../../define';
import { Ads } from '@/models/index';
import { ApiError } from '../../../error';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	errors: {
		noSuchAd: {
			message: 'No such ad.',
			code: 'NO_SUCH_AD',
			id: 'ccac9863-3a03-416e-b899-8a64041118b1',
		},
	},
} as const;

const paramDef = {
	type: 'object',
	properties: {
		id: { type: 'string', format: 'misskey:id' },
	},
	required: ['id'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, me) => {
	const ad = await Ads.findOne(ps.id);

	if (ad == null) throw new ApiError(meta.errors.noSuchAd);

	await Ads.delete(ad.id);
});
