import emailService from './email-service';
import { emailConst } from '../const/entity-const';
import BizError from '../error/biz-error';
import orm from '../entity/orm';
import email from '../entity/email';
import { eq } from 'drizzle-orm';

const { status } = emailConst;

/** 发送状态优先级：数值越大表示越靠后/更终态（打开 > 送达 > 延迟/已发） */
const STATUS_RANK = {
	[status.SENT]: 1,
	[status.DELAYED]: 2,
	[status.DELIVERED]: 3,
	[status.OPENED]: 4,
	[status.COMPLAINED]: 10,
	[status.BOUNCED]: 10,
	[status.FAILED]: 10
};

const resendService = {

	async webhooks(c, body) {

		const resendEmailId = body.data?.email_id;
		if (!resendEmailId) {
			throw new BizError('缺少 email_id');
		}

		const current = await orm(c).select().from(email).where(eq(email.resendEmailId, resendEmailId)).get();
		if (!current) {
			throw new BizError('更新邮件状态记录失败');
		}

		const params = {
			resendEmailId,
			status: null,
			message: null
		};

		if (body.type === 'email.delivered') {
			params.status = status.DELIVERED;
		}

		if (body.type === 'email.opened') {
			params.status = status.OPENED;
		}

		if (body.type === 'email.complained') {
			params.status = status.COMPLAINED;
		}

		if (body.type === 'email.bounced') {
			params.status = status.BOUNCED;
			params.message = JSON.stringify(body.data.bounce);
		}

		if (body.type === 'email.delivery_delayed') {
			params.status = status.DELAYED;
		}

		if (body.type === 'email.failed') {
			params.status = status.FAILED;
			params.message = body.data.failed?.reason || null;
		}

		if (params.status === null) {
			return;
		}

		const nextRank = STATUS_RANK[params.status] ?? 0;
		const currentRank = STATUS_RANK[current.status] ?? 0;

		// 已打开后不再被「送达/延迟」回退；失败类终态不被打开覆盖
		if (nextRank < currentRank) {
			return;
		}

		if (params.status === current.status && body.type !== 'email.bounced' && body.type !== 'email.failed') {
			return;
		}

		const emailRow = await emailService.updateEmailStatus(c, params);

		if (!emailRow) {
			throw new BizError('更新邮件状态记录失败');
		}

	}
}

export default resendService
