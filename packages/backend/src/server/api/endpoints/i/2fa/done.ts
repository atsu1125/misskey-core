import * as speakeasy from 'speakeasy';
import * as OTPAuth from 'otpauth';
import define from '../../../define.js';
import { UserProfiles } from '@/models/index.js';

export const meta = {
	requireCredential: true,

	secure: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		token: { type: 'string' },
	},
	required: ['token'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const token = ps.token.replace(/\s/g, '');

	const profile = await UserProfiles.findOneByOrFail({ userId: user.id });

	if (profile.twoFactorTempSecret == null) {
		throw new Error('二段階認証の設定が開始されていません');
	}

	const verified = (speakeasy as any).totp.verify({
		secret: profile.twoFactorTempSecret,
		encoding: 'base32',
		token: token,
	});

	if (!verified) {
		throw new Error('not verified');
	}

	const backupCodes = Array.from({ length: 5 }, () => new OTPAuth.Secret().base32);

	await UserProfiles.update(user.id, {
		twoFactorSecret: profile.twoFactorTempSecret,
		twoFactorBackupSecret: backupCodes,
		twoFactorEnabled: true,
	});

	return {
		backupCodes: backupCodes,
	};
});
