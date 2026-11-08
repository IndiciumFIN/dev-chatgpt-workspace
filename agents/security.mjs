import {verifyAgent,check,file} from './_agent.mjs';
const manifest=JSON.parse(file('vercel.json'));
const headers=manifest.headers?.flatMap(x=>x.headers||[])||[];
const get=k=>headers.find(x=>x.key.toLowerCase()===k.toLowerCase())?.value||'';
const html=file('index.html'),ui=file('src/ui.js'),audit=file('src/audit.js'),pkg=JSON.parse(file('package.json'));
const api=file('api/demo-casefiles.js'),v041=file('db/wutrib_demo_v041_hardening.sql');
verifyAgent('security',[
 check('SEC-001',get('Content-Security-Policy').includes("connect-src 'none'")&&!get('Content-Security-Policy').includes('unsafe-inline'),'CSP blocks network egress and inline code'),
 check('SEC-002',!/<script[^>]*>(?!\s*<\/script>)[\s\S]+?<\/script>/i.test(html)&&!/<script[^>]*src=["']https?:\/\//i.test(html),'No inline or externally hosted JavaScript'),
 check('SEC-003',!/\s(?:style|onerror|onclick|onload)\s*=/i.test(html),'No inline script/style/event attributes blocked by CSP'),
 check('SEC-004',!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|navigator\.sendBeacon/i.test(ui+audit),'No network calls in browser application'),
 check('SEC-005',!/supabase|service_role|secret[_-]?key/i.test(ui+audit),'Browser source has no Supabase secret usage'),
 check('SEC-006',get('X-Content-Type-Options')==='nosniff'&&get('Referrer-Policy')==='no-referrer','Hardened response headers'),
 check('SEC-007',Object.keys(pkg.dependencies||{}).length===0,'No runtime third-party dependencies'),
 check('SEC-008',/DOCTYPE\|ENTITY/.test(audit)&&/MAX_XML_BYTES/.test(audit)&&/MAX_EFD_BYTES/.test(audit),'XML DTD guard and file size limits exist'),
 check('SEC-009',api.includes('timingSafeEqual')&&api.includes('WUTRIB_OPERATOR_TOKEN')&&!api.includes('Access-Control-Allow-Origin'),'Server checks operator credential without opening CORS'),
 check('SEC-010',api.includes('wutrib_demo_request_gate_v1')&&api.includes('429')&&api.includes('Retry-After'),'Authenticated operations fail closed at durable quota'),
 check('SEC-011',v041.includes('revoke execute on function public.wutrib_demo_casefile_save_v1')&&v041.includes('security invoker'),'Old write RPC locked; new functions have no definer bypass'),
]);
