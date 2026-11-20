import { createFileRoute } from "@tanstack/react-router";
import { VilaHub } from "@/components/vila/vila-hub";
export const Route = createFileRoute("/kids/")({component:()=> <VilaHub />,head:()=>({meta:[{title:"Vila do Cuidado | Nosso espaço de cuidado para crianças"},{name:"robots",content:"noindex,nofollow"}]})});
