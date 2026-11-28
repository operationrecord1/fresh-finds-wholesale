import {expect,it} from 'vitest';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';

it('applies approved templates while preserving working SMTP and auth settings',async()=>{
 const calls:Array<{method:string;body?:Record<string,unknown>}> = [];
 const stored:Record<string,unknown>={smtp_host:'smtp-relay.brevo.com',smtp_admin_email:'finance@artisanmart.site',smtp_sender_name:'Artisan Mart',mailer_autoconfirm:false,site_url:'https://artisanmart.site',uri_allow_list:'https://artisanmart.site/login,https://artisanmart.site/reset-password'};
 const source=fs.readFileSync('scripts/artisan-auth-management-config.cjs','utf8').replace(/main\(\)\.catch[\s\S]*$/, 'globalThis.result=main();');
 const context=vm.createContext({__dirname:path.resolve('scripts'),process:{env:{AUTH_CONFIG_MODE:'apply',SUPABASE_MANAGEMENT_TOKEN:'test-placeholder'}},console:{log:()=>{}},fetch:async(_url:string,init:{method:string;body?:string})=>{const body=init.body?JSON.parse(init.body):undefined;calls.push({method:init.method,body});if(body)Object.assign(stored,body);return{ok:true,json:async()=>({...stored})};},require:(name:string)=>name==='node:fs'?{...fs,mkdirSync:()=>{},writeFileSync:()=>{}}:name==='node:path'?path:crypto});
 vm.runInContext(source,context);await context['result'];
 const patch=calls.find(c=>c.method==='PATCH')!.body!;
 expect(patch['mailer_templates_confirmation_content']).toContain('https://artisanmart.site/email/artisan-mart-logo.png');
 expect(patch['mailer_templates_recovery_content']).toContain('{{ .ConfirmationURL }}');
 expect(patch['mailer_templates_email_change_content']).toContain('{{ .ConfirmationURL }}');
 expect(patch['mailer_notifications_password_changed_enabled']).toBe(true);
 expect(patch).not.toHaveProperty('smtp_pass');expect(patch).not.toHaveProperty('mailer_autoconfirm');expect(patch).not.toHaveProperty('site_url');
});
