import { useState } from "react";
import { vilaAssets } from "@/lib/vila-assets";
export function VilaAsset({assetId,alt,fallback,className}:{assetId:string;alt:string;fallback:string;className?:string}) {
 const [failed,setFailed]=useState(false);
 const src=vilaAssets[assetId];
 if (!src || failed) return <span className="vila-asset-fallback" role="img" aria-label={alt}>{fallback}</span>;
 return <img className={className??"vila-asset"} src={src} alt={alt} loading={assetId==="hero.scene"?"eager":"lazy"} decoding="async" onError={()=>setFailed(true)} />;
}
