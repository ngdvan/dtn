const nodemailer = require('nodemailer');
const logger = require('./logger');

const gmailUser = String(process.env.GMAIL_USER || '').trim();
const gmailAppPassword = String(process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
const appBaseUrl = String(process.env.APP_BASE_URL || '').replace(/\/$/, '');
const enabled = Boolean(gmailUser && gmailAppPassword);
const transporter = enabled ? nodemailer.createTransport({
  service: 'gmail',
  auth: { user: gmailUser, pass: gmailAppPassword }
}) : null;

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);
const formatDate = value => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value)) : 'Không xác định';
const priorityLabel = value => ({ low: 'Thấp', medium: 'Trung bình', high: 'Cao', urgent: 'Khẩn cấp' })[value] || value || 'Trung bình';
const activityUrl = activityId => appBaseUrl ? `${appBaseUrl}/#activity/${activityId}` : '';

async function send({ to, subject, heading, paragraphs, facts = [], url, buttonLabel = 'Mở hoạt động' }) {
  if (!enabled) throw Object.assign(new Error('Gmail chưa được cấu hình trên máy chủ.'), { code: 'EMAIL_DISABLED' });
  if (!to) throw Object.assign(new Error('Email người nhận bị thiếu.'), { code: 'EMAIL_RECIPIENT_MISSING' });
  const safeParagraphs = paragraphs.map(text => `<p style="margin:0 0 14px">${escapeHtml(text)}</p>`).join('');
  const safeFacts = facts.length ? `<table style="width:100%;border-collapse:collapse;margin:18px 0">${facts.map(([label, value]) => `<tr><td style="padding:7px;border-bottom:1px solid #e5e7eb;color:#64748b">${escapeHtml(label)}</td><td style="padding:7px;border-bottom:1px solid #e5e7eb;font-weight:600">${escapeHtml(value)}</td></tr>`).join('')}</table>` : '';
  const button = url ? `<p style="margin:22px 0 4px"><a href="${escapeHtml(url)}" style="background:#315c4c;color:#fff;padding:11px 18px;border-radius:7px;text-decoration:none;display:inline-block">${escapeHtml(buttonLabel)}</a></p>` : '';
  return transporter.sendMail({
    from: { name: process.env.MAIL_FROM_NAME || 'SEEE Activity Hub', address: gmailUser },
    to,
    subject,
    text: [heading, ...paragraphs, ...facts.map(([label, value]) => `${label}: ${value}`), url].filter(Boolean).join('\n\n'),
    html: `<div lang="vi" style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#1f2937"><h2 style="color:#315c4c">${escapeHtml(heading)}</h2>${safeParagraphs}${safeFacts}${button}<p style="margin-top:28px;color:#64748b;font-size:12px">Đây là email thông báo tự động từ SEEE Activity Hub.</p></div>`
  });
}

const deliveryDetails = info => ({ messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, response: info.response });
const failureDetails = error => ({ name: error.name, message: error.message, code: error.code, command: error.command, responseCode: error.responseCode, response: error.response });

function queueEmail(description, message) {
  setImmediate(() => send(message)
    .then(info => { if (info) logger.info(`Email notification sent: ${description}.`, deliveryDetails(info)); })
    .catch(error => logger.error(`Email notification failed: ${description}.`, failureDetails(error))));
}

function notifyTaskAssigned(user, task, assignedBy) {
  queueEmail(`task ${task.id} to user ${user.id}`, {
    to: user.email,
    subject: `[SEEE - Activity Hub] Công việc mới: ${task.title}`,
    heading: 'Bạn được giao một công việc mới',
    paragraphs: [`Xin chào ${user.name},`, `${assignedBy || 'Quản trị viên'} vừa giao cho bạn một công việc trong hoạt động “${task.activity_title}”.`],
    facts: [['Người giao việc', assignedBy || 'Quản trị viên'], ['Công việc', task.title], ['Hạn hoàn thành', formatDate(task.deadline)], ['Mức ưu tiên', priorityLabel(task.priority)], ['Sản phẩm cần bàn giao', task.deliverable || 'Không xác định']],
    url: activityUrl(task.activity_id)
  });
}

function notifyActivityRegistration(user, activity, responsibility, addedBy) {
  const responsibilityLabel = !responsibility || responsibility === 'Activity participant' ? 'Người tham gia hoạt động' : responsibility;
  queueEmail(`activity ${activity.id} to user ${user.id}`, {
    to: user.email,
    subject: `[SEEE - Activity Hub] Bạn được thêm vào hoạt động: ${activity.title}`,
    heading: 'Bạn đã được thêm vào một hoạt động',
    paragraphs: [`Xin chào ${user.name},`, `${addedBy || 'Quản trị viên'} vừa thêm bạn vào hoạt động “${activity.title}”.`],
    facts: [['Người thêm', addedBy || 'Quản trị viên'], ['Hạn hoạt động', formatDate(activity.deadline)], ['Vai trò/Nhiệm vụ', responsibilityLabel]],
    url: activityUrl(activity.id)
  });
}

function notifyActivityProposed(admin, activity, proposedBy) {
  queueEmail(`activity proposal ${activity.id} to admin ${admin.id}`, {
    to: admin.email,
    subject: `[SEEE - Activity Hub] Hoạt động mới chờ duyệt: ${activity.title}`,
    heading: 'Có một đề xuất hoạt động mới',
    paragraphs: [`Xin chào ${admin.name},`, `${proposedBy || 'Một người dùng'} vừa tạo đề xuất hoạt động “${activity.title}”.`],
    facts: [['Người đề xuất', proposedBy || 'Không xác định'], ['Loại hoạt động', activity.type === 'event' ? 'Sự kiện' : 'Công việc được giao'], ['Ngày bắt đầu', formatDate(activity.start_date)], ['Hạn hoạt động', formatDate(activity.deadline)], ['Mức ưu tiên', priorityLabel(activity.priority)]],
    url: activityUrl(activity.id),
    buttonLabel: 'Xem và duyệt hoạt động'
  });
}

async function sendTestEmail(requestedBy) {
  const description = 'admin test to van.nguyendinh@hust.edu.vn';
  try {
    const info = await send({
      to: 'van.nguyendinh@hust.edu.vn',
      subject: '[SEEE - Activity Hub] Kiểm tra thông báo email',
      heading: 'Email thông báo đang hoạt động',
      paragraphs: ['Xin chào Nguyễn Đình Vân,', `${requestedBy || 'Quản trị viên'} vừa thực hiện kiểm tra gửi email từ SEEE Activity Hub.`, 'Nếu bạn nhận được email này, cấu hình Gmail của máy chủ đang hoạt động bình thường.'],
      facts: [['Người thực hiện kiểm tra', requestedBy || 'Quản trị viên'], ['Thời gian kiểm tra', new Intl.DateTimeFormat('vi-VN', { dateStyle: 'full', timeStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())]],
      url: appBaseUrl || '',
      buttonLabel: 'Mở SEEE Activity Hub'
    });
    logger.info(`Email notification sent: ${description}.`, deliveryDetails(info));
    return deliveryDetails(info);
  } catch (error) {
    logger.error(`Email notification failed: ${description}.`, failureDetails(error));
    throw error;
  }
}

module.exports = { enabled, notifyTaskAssigned, notifyActivityRegistration, notifyActivityProposed, sendTestEmail };
