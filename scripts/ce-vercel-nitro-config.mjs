#!/usr/bin/env node
/**
 * Fail-closed, read-only detection of TanStack Start/Nitro on Vercel.
 * Does NOT deploy, read environment variable values, or touch project settings.
 * V6-A06 / Issue #96. See docs: https://tanstack.com/start/latest/docs/framework/react/guide/hosting
 */
import {readFileSync} from "node:fs";
import {pathToFileURL} from "node:url";
const root=new URL("../",import.meta.url);
const read=p=>readFileSync(new URL(p,root),"utf8");
const deny=(pass,why)=>{if(!pass)throw Error("CE_VERCEL_PRESET_HOLD:"+why)};
export function validateVercelNitroConfig(config,viteSource,pkg){
 deny(config&&typeof config==="object"&&!Array.isArray(config),"missing vercel config");
 deny(config.framework==="tanstack-start","static or incompatible Vercel framework");
 deny(config["$schema"]==="https://openapi.vercel.sh/vercel.json","unrecognized schema");
 deny(!Object.hasOwn(config,"outputDirectory"),"output directory override suppresses Nitro Build Output API");
 deny(!Object.hasOwn(config,"buildCommand")&&!Object.hasOwn(config,"installCommand"),
   "custom Vercel build/install command can bypass framework auto detection");
 deny(!Object.hasOwn(config,"builds")&&!Object.hasOwn(config,"routes"),"legacy deployment routing override");
 deny(typeof viteSource==="string"&&/from ["']@tanstack\/react-start\/plugin\/vite["']/.test(viteSource)&&
   /from ["']nitro\/vite["']/.test(viteSource)&&
   /\btanstackStart\s*\(/.test(viteSource)&&
   /\bnitro\s*\(\s*\{[\s\S]*?preset:\s*["']vercel["']/.test(viteSource),
   "Nitro Vercel preset or TanStack plugin unavailable");
 deny(pkg?.scripts?.build?.includes("vite build")&&
   typeof pkg?.dependencies?.nitro==="string"&&
   typeof pkg?.dependencies?.["@tanstack/react-start"]==="string",
   "Vite/Nitro dependencies or build missing");
 return {protocol:"CE.VERCEL.TANSTACK_NITRO_PRESET.v1",
  state:"PASS_CONFIG_ONLY_NO_DEPLOY",
  framework:config.framework,output_detection:"framework_native",
  build_output_expected:".vercel/output",deploy_verified:false,
  production_release_authorized:false,remote_db_write:false};
}
export function verifyVercelNitroConfig(){
 return validateVercelNitroConfig(JSON.parse(read("vercel.json")),read("vite.config.ts"),JSON.parse(read("package.json")));
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 try{console.log(JSON.stringify(verifyVercelNitroConfig()));}
 catch(e){console.error(String(e?.message||e));process.exitCode=2;}
}
