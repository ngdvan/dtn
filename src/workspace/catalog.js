'use strict';

const permissions = {
  'room.book': 'Faculty: view calendar and book rooms (team membership required)',
  'room.manage': 'School office head: manage rooms and appoint room approvers',
  'record.create': 'Create activities, documents and requests',
  'record.edit': 'Edit records owned by this unit',
  'record.publish': 'Submit records and audience changes for publication',
  'record.complete': 'Submit activity completion for approval',
  'task.manage': 'Create and assign tasks within this unit',
  'task.update.assigned': 'Update assigned tasks',
  'comment.create': 'Comment on visible records',
  'attachment.create': 'Upload materials to visible records',
  'team.appoint': 'Appoint Members and Leaders within this unit',
  'workflow.approve': 'Decide assigned workflow approval steps',
  'school.read': 'Read published operational records across SEEE',
  'admin.access': 'Administer roles, units, identities and workflows',
  'admin.history': 'Read audit, sensitive records and export history'
};
const roleSeeds = [
  ['administrator', 'Administrator', 'global', Object.keys(permissions)],
  ['dean', 'Dean / School leadership', 'global', ['school.read']],
  ['leader', 'Team Leader', 'unit', ['record.create', 'record.edit', 'record.publish', 'record.complete', 'task.manage', 'task.update.assigned', 'comment.create', 'attachment.create', 'team.appoint', 'workflow.approve']],
  ['member', 'Team Member', 'unit', ['record.create', 'record.publish', 'record.complete', 'task.update.assigned', 'comment.create', 'attachment.create']],
  ['faculty', 'Faculty', 'unit', ['room.book']],
  ['office_head', 'School office head', 'global', ['room.manage']]
];
const domains = ['hust.edu.vn', 'sis.hust.edu.vn'];
function hustEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+$/.test(email) && domains.includes(email.split('@')[1]) ? email : null;
}
module.exports = { permissions, roleSeeds, hustEmail };
