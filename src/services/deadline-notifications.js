const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;

function dateInVietnam(now = new Date(), days = 0) {
  const shifted = new Date(now.getTime() + days * 86400000);
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit' }).formatToParts(shifted);
  const value = Object.fromEntries(parts.map(part => [part.type,part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

async function runDeadlineNotifications({ db, push, mailer, logger, now = new Date() }) {
  const tomorrow=dateInVietnam(now,1);
  await db.execute('DELETE FROM notifications WHERE expires_at<=NOW()');
  const [taskRecipients]=await db.execute(`SELECT DISTINCT t.id task_id,t.title,t.deadline,t.activity_id,a.title activity_title,u.id user_id,u.name,u.email FROM tasks t JOIN activities a ON a.id=t.activity_id JOIN users u ON u.is_active=1 LEFT JOIN task_assignees ta ON ta.task_id=t.id AND ta.user_id=u.id WHERE DATE(t.deadline)=? AND t.status!='done' AND (ta.user_id IS NOT NULL OR u.id=t.assignee_id OR u.id=t.assigned_by)`,[tomorrow]);
  const [activityRecipients]=await db.execute(`SELECT DISTINCT a.id activity_id,a.title,a.title activity_title,a.deadline,NULL task_id,u.id user_id,u.name,u.email FROM activities a JOIN users u ON u.is_active=1 WHERE DATE(a.deadline)=? AND a.status NOT IN ('completed','cancelled') AND (u.id=a.creator_id OR EXISTS(SELECT 1 FROM participants p WHERE p.activity_id=a.id AND p.user_id=u.id AND p.state!='declined') OR EXISTS(SELECT 1 FROM tasks t JOIN task_assignees ta ON ta.task_id=t.id WHERE t.activity_id=a.id AND ta.user_id=u.id) OR EXISTS(SELECT 1 FROM activity_teams at WHERE at.activity_id=a.id AND at.contact_user_id=u.id) OR EXISTS(SELECT 1 FROM activity_teams at JOIN user_teams ut ON ut.team_id=at.team_id WHERE at.activity_id=a.id AND ut.user_id=u.id))`,[tomorrow]);
  let created=0;
  for(const item of [...taskRecipients,...activityRecipients]){
    const isTask=Boolean(item.task_id),title=isTask?'Task due tomorrow':'Activity due tomorrow',body=`“${item.title}” is due tomorrow.`,sourceKey=`${isTask?'task':'activity'}-deadline-day-before:${item.task_id||item.activity_id}:${tomorrow}`;
    const [result]=await db.execute(`INSERT IGNORE INTO notifications(user_id,activity_id,task_id,kind,title,body,url,source_key,expires_at) VALUES(?,?,?,'deadline_reminder',?,?,?,?,DATE_ADD(NOW(),INTERVAL 7 DAY))`,[item.user_id,item.activity_id,item.task_id,title,body,`/#activity/${item.activity_id}`,sourceKey]);
    if(!result.affectedRows)continue;
    created+=1;
    push.queuePush(`deadline reminder to user ${item.user_id}`,{userId:item.user_id,title,message:body,url:process.env.APP_BASE_URL?`${String(process.env.APP_BASE_URL).replace(/\/$/,'')}/#activity/${item.activity_id}`:undefined});
    mailer.notifyDeadlineReminder(item,item);
  }
  if(created)logger.info(`Created ${created} one-day deadline reminders for ${tomorrow}.`);
  return {date:tomorrow,taskRecipients:taskRecipients.length,activityRecipients:activityRecipients.length,created};
}

function startDeadlineNotificationScheduler(dependencies,intervalMs=DEFAULT_INTERVAL_MS){let running=false;const execute=async()=>{if(running)return;running=true;try{await runDeadlineNotifications(dependencies)}catch(error){dependencies.logger.error('Deadline notification job failed.',error)}finally{running=false}};setImmediate(execute);const timer=setInterval(execute,intervalMs);timer.unref?.();return()=>clearInterval(timer)}

module.exports={dateInVietnam,runDeadlineNotifications,startDeadlineNotificationScheduler};
