import resendService from '../service/resend-service';
import emailService from '../service/email-service';
import app from '../hono/hono';

/** 1x1 透明 GIF */
const PIXEL_GIF = Uint8Array.from(
	atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
	c => c.charCodeAt(0)
);

app.post('/webhooks',async (c) => {
	try {
		await resendService.webhooks(c, await c.req.json());
		return c.text('success', 200)
	} catch (e) {
		return  c.text(e.message, 500)
	}
})

/** 邮件打开追踪像素（Gmail 等加载远程图片时触发） */
app.get('/open/:token', async (c) => {
	const raw = c.req.param('token') || '';
	const trackId = raw.replace(/\.gif$/i, '');
	try {
		await emailService.markOpenedByTrackId(c, trackId);
	} catch (e) {
		console.error('open track failed', e);
	}
	return c.body(PIXEL_GIF, 200, {
		'Content-Type': 'image/gif',
		'Cache-Control': 'no-store, no-cache, must-revalidate, private',
		'Pragma': 'no-cache'
	});
});
