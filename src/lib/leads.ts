import { createHash, randomUUID } from "node:crypto";
export const LEAD_LIMITS={name:120,email:254,organization:160,value_leak_description:3000,source_page:300,referral_data:500,utm:300} as const;
export type LeadInput={name?:unknown;email?:unknown;organization?:unknown;value_leak_description?:unknown;source_page?:unknown;referral_data?:unknown;utm?:unknown;consent?:unknown;company_website?:unknown;form_started_at?:unknown;csrf_token?:unknown};
const clean=(v:unknown,n:number)=>typeof v==="string"?v.trim().replace(/<[^>]*>/g,"").replace(/\r\n?/g,"\n").slice(0,n):"";
export function validateLead(input:LeadInput,now=Date.now()){
 const value={name:clean(input.name,120),email:clean(input.email,254).toLowerCase(),organization:clean(input.organization,160),value_leak_description:clean(input.value_leak_description,3000),source_page:clean(input.source_page,300)||"/contact",referral_data:clean(input.referral_data,500),utm:clean(input.utm,300),consent:input.consent===true||input.consent==="true"};const errors:Record<string,string>={};
 if(!value.name)errors.name="Enter your name.";if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))errors.email="Enter a valid email address.";if(value.value_leak_description.length<10)errors.value_leak_description="Please provide at least 10 characters.";
 const started=Number(input.form_started_at);const bot=Boolean(clean(input.company_website,200))||!Number.isFinite(started)||now-started<1200||now-started>86_400_000;return {ok:Object.keys(errors).length===0,errors,bot,value};
}
export function createLeadRecord(value:ReturnType<typeof validateLead>["value"],at=new Date()){return {schema_version:"1.0",lead_id:randomUUID(),...value,created_at:at.toISOString(),pipeline_state:"REVIEW_REQUIRED",qualification:{status:"REVIEW_REQUIRED",score:null},notification_status:"PENDING"};}
export function opaqueLeadKey(value:string,salt:string){return createHash("sha256").update(`${salt}:${value}`).digest("hex");}
