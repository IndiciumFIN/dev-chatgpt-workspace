import { createFileRoute } from "@tanstack/react-router";
import { VilaHub } from "@/components/vila/vila-hub";
export const Route = createFileRoute("/kids/$section")({component:Section,head:()=>({meta:[{title:"Vila do Cuidado | Espaço educativo candidato"},{name:"robots",content:"noindex,nofollow"}]})});
function Section(){const {section}=Route.useParams();return <VilaHub section={section}/>;}
