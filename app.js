'use strict';
const {createApplication}=require('./src/workspace/app');
const application=createApplication();
const port=Number(process.env.WORKSPACE_PORT||3000);
const server=application.app.listen(port,'127.0.0.1',()=>console.log(`SEEE Workspace 3.0 — http://localhost:${port}`));
server.on('error',error=>{console.error(error.message);application.close().finally(()=>process.exit(1));});
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>application.close().finally(()=>process.exit(0))));
