import app from '../hono/hono';
import result from '../model/result';
import userContext from '../security/user-context';
import scheduleEmailService from '../service/schedule-email-service';

app.post('/schedule/create', async (c) => {
	const data = await scheduleEmailService.create(c, await c.req.json(), userContext.getUserId(c));
	return c.json(result.ok(data));
});

app.get('/schedule/list', async (c) => {
	const data = await scheduleEmailService.list(c, c.req.query(), userContext.getUserId(c));
	return c.json(result.ok(data));
});

app.delete('/schedule/cancel', async (c) => {
	await scheduleEmailService.cancel(c, c.req.query(), userContext.getUserId(c));
	return c.json(result.ok());
});
