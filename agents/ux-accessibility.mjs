import {verifyAgent,check,file} from './_agent.mjs';
const html=file('index.html'),css=file('styles.css'),ui=file('src/ui.js');
const ids=Array.from(html.matchAll(/\sid="([^"]+)"/g),x=>x[1]);
const views=Array.from(html.matchAll(/data-panel="([^"]+)"/g),x=>x[1]);
verifyAgent('ux-accessibility',[ 
 check('UX-001',new Set(ids).size===ids.length,'HTML IDs are unique'),
 check('UX-002',views.length===6&&new Set(views).size===6,'Six unique navigation views'),
 check('UX-003',html.includes('href="#main"')&&html.includes('id="main" tabindex="-1"'),'Skip-to-content works with focusable main'),
 check('UX-004',html.includes('aria-live="polite"')&&html.includes('aria-expanded="false"'),'Status announcements and mobile menu state'),
 check('UX-005',html.includes('id="select-xml-button"')&&html.includes('id="select-efd-button"'),'File selection uses accessible buttons, not non-focusable labels'),
 check('UX-006',ui.includes("open.type='button'")&&ui.includes("open.setAttribute('aria-label'"),'Finding details opened through actual buttons'),
 check('UX-007',css.includes(':focus-visible')&&css.includes(':focus-within'),'Visible keyboard focus'),
 check('UX-008',css.includes('prefers-reduced-motion')&&css.includes('@media(max-width:580px)'),'Reduced motion and mobile layout'),
 check('UX-009',/lang="pt-BR"/.test(html)&&/name="viewport"/.test(html),'Language and responsive viewport'),
 check('UX-010',ui.includes('xmlErrors=[]')&&ui.includes('efdErrors=[]')&&ui.includes('xmlSelectionCount')&&!ui.includes('selectionErrors=[]'),'Separate XML/EFD intake error states; no cross-source reset'),
]);
