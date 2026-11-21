import {createHash} from "node:crypto";
export function gitBlobSha(bytes) {
 if(!Buffer.isBuffer(bytes))throw TypeError("Expected raw Buffer");
 return createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
}
export function matchesPinnedTextBlob(bytes,pinnedSha){
 if(!/^[0-9a-f]{40}$/.test(pinnedSha??""))return false;
 if(gitBlobSha(bytes)===pinnedSha)return true;
 if(!bytes.includes(13))return false;
 const text=bytes.toString("utf8");
 if(text.includes("\ufffd"))return false;
 const normalized=Buffer.from(text.replace(/\r\n/g,"\n"),"utf8");
 if(normalized.equals(bytes))return false;
 return gitBlobSha(normalized)===pinnedSha;
}
