import {verifyAgent,check,file} from './_agent.mjs';
const manifest=JSON.parse(file('vercel.json'));
const headers=manifest.headers?.flatMap(x=>x.headers||[])||[];
const get=k=>headers.find(x=>x.key.toLowerCase()===k.toLowerCase())?.value||'';
const html=file('index.html'),ui=file('src/ui.js'),audit=file('src/audit.js'),pkg=JSON.parse(file('package.json'));
const api=file('api/demo-casefiles.js'),v041=file('db/wutrib_demo_v041_hardening.sql');
const v042=file('db/wutrib_demo_v042_org_auth.sql');
verifyAgent('security',[
 check('SEC-001',get('Content-Security-Policy').includes("connect-src 'none'")&&!get('Content-Security-Policy').includes('unsafe-inline'),'CSP blocks browser network egress and inline code'),
 check('SEC-002',!/<script[^>]*>(?!\s*<\/script>)[\s\S]+?<\/script>/i.test(html)&&!/<script[^>]*src=["']https?:\/\//i.test(html),'No inline or external JavaScript'),
 check('SEC-003',!/\s(?:style|onerror|onclick|onload)\s*=/i.test(html),'No inline handlers or styles'),
 check('SEC-004',!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|navigator\.sendBeacon/i.test(ui+audit),'Browser is disconnected'),
 check('SEC-005',!/supabase|service_role|secret[_-]?key/i.test(ui+audit),'No credentials in browser application'),
 check('SEC-006',get('X-Content-Type-Options')==='nosniff'&&get('Referrer-Policy')==='no-referrer','Secure response headers'),
 check('SEC-007',Object.keys(pkg.dependencies||{}).length===0,'Zero third-party runtime dependencies'),
 check('SEC-008',/DOCTYPE\|ENTITY/.test(audit)&&/MAX_XML_BYTES/.test(audit)&&/MAX_EFD_BYTES/.test(audit),'XML DTD and size guards'),
 check('SEC-009',api.includes("url+'/auth/v1/user'")&&api.includes('WUTRIB_SUPABASE_PUBLISHABLE_KEY')&&!api.includes('WUTRIB_OPERATOR_TOKEN'),'Fresh Supabase Auth user verification replaces shared secret'),
 check('SEC-010',api.includes("WUTRIB_DEMO_AUTH_ENABLED!=='true'")&&api.includes('DEMO_PERSISTENCE_DISABLED'),'Explicit fail-closed feature flag'),
 check('SEC-011',api.includes('wutrib_demo_org_authorize_v1')&&api.includes('wutrib_demo_org_casefile_save_v1')&&api.includes('wutrib_demo_org_casefile_get_v1'),'RBAC and tenant-scoped RPCs only'),
 check('SEC-012',api.includes('wutrib_demo_request_gate_v1')&&api.includes('429')&&api.includes('Retry-After'),'Authenticated identity quota'),
 check('SEC-013',v041.includes('revoke execute on function public.wutrib_demo_casefile_save_v1')&&v042.includes('revoke execute on function public.wutrib_demo_casefile_save_v2'),'Legacy unscoped service-role writers retired'),
 check('SEC-014',v042.includes('revoke execute on function public.wutrib_demo_casefile_get_v1')&&v042.includes('enable row level security'),'Legacy unscoped get retired and private RLS enforced'),
 check('SEC-015',!api.includes('Access-Control-Allow-Origin')&&!html.includes('WUTRIB_SUPABASE_SERVICE_ROLE_KEY'),'CORS not opened and no browser secret')
]);
