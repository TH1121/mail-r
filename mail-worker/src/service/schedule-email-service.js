import orm from '../entity/orm';
import scheduleEmail from '../entity/schedule-email';
import { and, desc, eq, inArray, lte, lt, gt, asc, count } from 'drizzle-orm';
import BizError from '../error/biz-error';
import { isDel, scheduleEmailConst } from '../const/entity-const';
import { t } from '../i18n/i18n';
import dayjs from 'dayjs';
import accountService from './account-service';
import emailService from './email-service';

const scheduleEmailService = {

	async create(c, params, userId) {
		const {
			accountId,
			name,
			receiveEmail,
			subject,
			content,
			text,
			sendType,
			emailId,
			attachments = [],
			sendAt
		} = params;

		if (!sendAt) {
			throw new BizError(t('emptyScheduleTime'));
		}

		const sendAtTime = dayjs(sendAt);
		if (!sendAtTime.isValid() || sendAtTime.isBefore(dayjs().add(1, 'minute'))) {
			throw new BizError(t('invalidScheduleTime'));
		}

		if (!Array.isArray(receiveEmail) || receiveEmail.length === 0) {
			throw new BizError(t('emptyRecipient'));
		}

		const accountRow = await accountService.selectById(c, accountId);
		if (!accountRow || accountRow.userId !== userId) {
			throw new BizError(t('senderAccountNotExist'));
		}

		const row = await orm(c).insert(scheduleEmail).values({
			userId,
			accountId,
			name: name || '',
			sendEmail: accountRow.email,
			receiveEmail: JSON.stringify(receiveEmail),
			subject: subject || '',
			content: content || '',
			text: text || '',
			sendType: sendType || '',
			replyEmailId: emailId || 0,
			attachments: JSON.stringify(attachments || []),
			sendAt: sendAtTime.toISOString(),
			status: scheduleEmailConst.status.PENDING,
			message: '',
			isDel: isDel.NORMAL
		}).returning().get();

		return this.formatRow(row);
	},

	formatRow(row) {
		if (!row) return row;
		return {
			...row,
			receiveEmail: this.parseJson(row.receiveEmail, []),
			attachments: this.parseJson(row.attachments, []),
			emailId: row.scheduleId,
			type: 1,
			createTime: row.sendAt
		};
	},

	parseJson(value, fallback) {
		if (Array.isArray(value)) return value;
		try {
			return JSON.parse(value || '[]');
		} catch {
			return fallback;
		}
	},

	async list(c, params, userId) {
		let { scheduleId, size, timeSort } = params;
		size = Number(size) || 20;
		scheduleId = Number(scheduleId);
		timeSort = Number(timeSort);

		if (size > 50) size = 50;
		if (!scheduleId) {
			scheduleId = timeSort ? 0 : 9999999999;
		}

		const query = orm(c).select().from(scheduleEmail).where(
			and(
				eq(scheduleEmail.userId, userId),
				eq(scheduleEmail.isDel, isDel.NORMAL),
				timeSort ? gt(scheduleEmail.scheduleId, scheduleId) : lt(scheduleEmail.scheduleId, scheduleId)
			)
		);

		if (timeSort) {
			query.orderBy(asc(scheduleEmail.scheduleId));
		} else {
			query.orderBy(desc(scheduleEmail.scheduleId));
		}

		const list = await query.limit(size).all();
		const totalRow = await orm(c).select({ total: count() }).from(scheduleEmail).where(
			and(
				eq(scheduleEmail.userId, userId),
				eq(scheduleEmail.isDel, isDel.NORMAL)
			)
		).get();

		return {
			list: list.map(item => this.formatRow(item)),
			total: totalRow?.total || 0,
			latestEmail: {}
		};
	},

	async cancel(c, params, userId) {
		const { scheduleIds } = params;
		const ids = String(scheduleIds).split(',').map(Number).filter(Boolean);
		if (!ids.length) return;

		await orm(c).update(scheduleEmail).set({ isDel: isDel.DELETE }).where(
			and(
				eq(scheduleEmail.userId, userId),
				inArray(scheduleEmail.scheduleId, ids)
			)
		).run();
	},

	async processDue(c) {
		const now = dayjs().toISOString();
		const dueList = await orm(c).select().from(scheduleEmail).where(
			and(
				eq(scheduleEmail.isDel, isDel.NORMAL),
				eq(scheduleEmail.status, scheduleEmailConst.status.PENDING),
				lte(scheduleEmail.sendAt, now)
			)
		).limit(30).all();

		for (const row of dueList) {
			try {
				const receiveEmail = this.parseJson(row.receiveEmail, []);
				const attachments = this.parseJson(row.attachments, []);
				await emailService.send(c, {
					accountId: row.accountId,
					name: row.name,
					sendType: row.sendType,
					emailId: row.replyEmailId || undefined,
					receiveEmail,
					text: row.text,
					content: row.content,
					subject: row.subject,
					attachments
				}, row.userId);

				await orm(c).delete(scheduleEmail).where(eq(scheduleEmail.scheduleId, row.scheduleId)).run();
			} catch (e) {
				console.error('定时发送失败', row.scheduleId, e);
				await orm(c).update(scheduleEmail).set({
					status: scheduleEmailConst.status.FAILED,
					message: e.message || String(e)
				}).where(eq(scheduleEmail.scheduleId, row.scheduleId)).run();
			}
		}
	}
};

export default scheduleEmailService;
