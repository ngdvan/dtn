const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const config = require('./config/environment');
const { createDatabase } = require('./config/database');
const { createSessionMiddleware } = require('./config/session');
const { warnAboutConfiguration } = require('./config/validate');
const { auth, admin, manager, isLeadership } = require('./middleware/auth');
const { createErrorHandler } = require('./middleware/errors');
const { taskUpload, descriptionUpload, yearbookUpload, attachmentKinds, allowedExtensions } = require('./middleware/uploads');
const { createAccessPolicies } = require('./policies/access');
const { asyncRoute, validHttpUrl, one, ids } = require('./routes/utils');
const { registerRoutes } = require('./routes');
const logger = require('./logger');
const mailer = require('./mailer');
const push = require('./push');

function createApplication(options = {}) {
  const runtimeConfig = options.config || config;
  const db = options.db || createDatabase(runtimeConfig.db);
  const app = express();
  const attachmentRoot = path.join(__dirname, '..', 'storage', 'task-attachments');
  const yearbookRoot = path.join(__dirname, '..', 'storage', 'yearbook-portraits');
  fs.mkdirSync(attachmentRoot, { recursive: true });
  fs.mkdirSync(yearbookRoot, { recursive: true });

  warnAboutConfiguration(runtimeConfig, { mailer, push });
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(createSessionMiddleware(runtimeConfig));
  app.get('/ky-yeu',(_req,res)=>res.sendFile(path.join(__dirname,'..','public','ky-yeu.html')));
  app.get('/ky-yeu-mau',(_req,res)=>res.sendFile(path.join(__dirname,'..','public','ky-yeu-mau.html')));
  app.get('/admin/ky-yeu',(req,res)=>req.session.user?.role==='admin'&&/@(?:[a-z0-9-]+\.)?hust\.edu\.vn$/i.test(req.session.user.email)?res.sendFile(path.join(__dirname,'..','views','ky-yeu-admin.html')):res.redirect('/'));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const policies = createAccessPolicies(db, isLeadership);
  const context = {
    db, auth, admin, manager, isLeadership, asyncRoute, validHttpUrl, one, ids,
    ...policies,
    bcrypt, ExcelJS, packageInfo: runtimeConfig.packageInfo, microsoftSso: runtimeConfig.microsoftSso, logger, mailer, push,
    taskUpload, descriptionUpload, yearbookUpload, attachmentKinds, allowedExtensions, attachmentRoot, yearbookRoot, path, fs, crypto
  };
  registerRoutes(app, context);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
  app.use(createErrorHandler(logger));

  return { app, db, config: runtimeConfig };
}

module.exports = { createApplication };
