/** Official original asset paths; manifest is the audited source. Not a claim of deployed binary availability. */
import manifest from "@/data/contracts/vila/vila-asset-import.v0.2.0.json";
export const vilaAssets = Object.fromEntries(manifest.assets.map(a => [a.id,a.publicPath])) as Record<string,string>;
