const multer = require('multer');

const taskUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024, files: 1 } });
const descriptionUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const yearbookUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024, files: 1 } });

module.exports = {
  taskUpload,
  descriptionUpload,
  yearbookUpload,
  attachmentKinds: ['clarification', 'evidence', 'issue', 'deliverable', 'description'],
  allowedExtensions: new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.zip'])
};
