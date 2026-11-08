import {verifyAgent,check,file} from './_agent.mjs';
const manifest=JSON.parse(file('vercel.json'));
const headers=manifest.headers?.flatMap(x=>x.headers||[])||[];
const get=k=>headers.find(x=>x.key.toLowerCase()===k.toLowerCase())?.value||'';
const html=file('index.html'), ui=file('src/ui.js'),audit=file('src/audit.js'),pkg=JSON.parse(file('package.json'));
verifyAgent('security',[ 
 check('SEC-001',get('Content-Security-Policy').includes("connect-src 'none'")&&!get('Content-Security-Policy').includes('unsafe-inline'),'CSP blocks network egress and inline code'),
 check('SEC-002',!/<script[^>]*>(?!\s*<\/script>)[\s\S]+?<\/script>/i.test(html)&&!/<script[^>]*src=["']https?:\/\//i.test(html),'No inline or externally hosted JavaScript'),
 check('SEC-003',!/\s(?:style|onerror|onclick|onload)\s*=/i.test(html),'No inline script/style/event attributes blocked by CSP'),
 check('SEC-004',!/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|navigator\.sendBeacon/i.test(ui+audit),'No network calls in browser application'),
 check('SEC-005',!/supabase|service_role|secret[_-]?key/i.test(ui+audit),'Browser source has no Supabase secret usage'),
 check('SEC-006',get('X-Content-Type-Options')==='nosniff'&&get('Referrer-Policy')==='no-referrer','Hardened response headers'),
 check('SEC-007',Object.keys(pkg.dependencies||{}).length===0,'No runtime third-party dependencies'),
 check('SEC-008',/DOCTYPE\|ENTITY/.test(audit)&&/MAX_XML_BYTES/.test(audit)&&/MAX_EFD_BYTES/.test(audit),'XML DTD guard and file size limits exist'),
]);
