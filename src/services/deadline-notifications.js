const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;

function dateInVietnam(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

async function runDeadlineNotifications({ db, push, logger, now = new Date() }) {
  const today = dateInVietnam(now);
  await db.execute('DELETE FROM notifications WHERE expires_at<=NOW()');
  const [recipients] = await db.execute(
    `SELECT DISTINCT t.id task_id,t.title task_title,t.activity_id,a.title activity_title,u.id user_id
     FROM tasks t
     JOIN activities a ON a.id=t.activity_id
     JOIN users u ON u.is_active=1
     LEFT JOIN task_assignees ta ON ta.task_id=t.id AND ta.user_id=u.id
     WHERE DATE(t.deadline)=? AND t.status!='done' AND (ta.user_id IS NOT NULL OR t.assignee_id=u.id)`,
    [today]
  );
  let created = 0;
  for (const item of recipients) {
    const title = 'Task due today';
    const body = `“${item.task_title}” in “${item.activity_title}” is due today.`;
    const url = `/#activity/${item.activity_id}`;
    const sourceKey = `task-deadline:${item.task_id}:${today}`;
    const [result] = await db.execute(
      `INSERT IGNORE INTO notifications(user_id,activity_id,task_id,kind,title,body,url,source_key,expires_at)
       VALUES(?,?,?,'task_deadline',?,?,?,?,DATE_ADD(NOW(),INTERVAL 7 DAY))`,
      [item.user_id, item.activity_id, item.task_id, title, body, url, sourceKey]
    );
    if (!result.affectedRows) continue;
    created += 1;
    push.queuePush(`deadline task ${item.task_id} to user ${item.user_id}`, {
      userId: item.user_id,
      title,
      message: body,
      url: process.env.APP_BASE_URL ? `${String(process.env.APP_BASE_URL).replace(/\/$/, '')}/#activity/${item.activity_id}` : undefined
    });
  }
  if (created) logger.info(`Created ${created} task deadline notifications for ${today}.`);
  return { date: today, recipients: recipients.length, created };
}

function startDeadlineNotificationScheduler(dependencies, intervalMs = DEFAULT_INTERVAL_MS) {
  let running = false;
  const execute = async () => {
    if (running) return;
    running = true;
    try { await runDeadlineNotifications(dependencies); }
    catch (error) { dependencies.logger.error('Task deadline notification job failed.', error); }
    finally { running = false; }
  };
  setImmediate(execute);
  const timer = setInterval(execute, intervalMs);
  timer.unref?.();
  return () => clearInterval(timer);
}

module.exports = { dateInVietnam, runDeadlineNotifications, startDeadlineNotificationScheduler };
