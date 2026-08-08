import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const scheduleEmail = sqliteTable('schedule_email', {
	scheduleId: integer('schedule_id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	accountId: integer('account_id').notNull(),
	name: text('name').default('').notNull(),
	sendEmail: text('send_email').default('').notNull(),
	receiveEmail: text('receive_email').default('[]').notNull(),
	subject: text('subject').default('').notNull(),
	content: text('content').default('').notNull(),
	text: text('text').default('').notNull(),
	sendType: text('send_type').default('').notNull(),
	replyEmailId: integer('reply_email_id').default(0).notNull(),
	attachments: text('attachments').default('[]').notNull(),
	sendAt: text('send_at').notNull(),
	createTime: text('create_time').default(sql`CURRENT_TIMESTAMP`).notNull(),
	status: integer('status').default(0).notNull(),
	message: text('message').default('').notNull(),
	isDel: integer('is_del').default(0).notNull()
});

export default scheduleEmail;
