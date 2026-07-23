import fs from "node:fs";
import path from "node:path";

const root=path.resolve(".next/server/app"),canonicalOrigin="https://regulusautomation.ca";
if(!fs.existsSync(root)) throw new Error("Production build missing. Run npm run build first.");
const files=[];const walk=d=>fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const p=path.join(d,e.name);e.isDirectory()?walk(p):e.name.endsWith(".html")&&files.push(p)});walk(root);
const routes=new Map(),errors=[],titles=new Map();
const value=(html,re)=>(html.match(re)||[])[1];
for(const file of files){
  let route="/"+path.relative(root,file).replaceAll("\\","/").replace(/index\.html$/,"").replace(/\.html$/,"").replace(/\/$/,"");
  if(route==="/_not-found"||route.includes("[")||route.includes("/invitations"))continue;
  const html=fs.readFileSync(file,"utf8"),title=value(html,/<title>([^<]+)<\/title>/i),description=value(html,/<meta name="description" content="([^"]+)"/i),canonical=value(html,/<link rel="canonical" href="([^"]+)"/i),robots=value(html,/<meta name="robots" content="([^"]+)"/i)||"";
  routes.set(route,{html,file});
  if(!title)errors.push(`${route}: missing title`);else{if(titles.has(title))errors.push(`${route}: duplicate title with ${titles.get(title)}`);titles.set(title,route)}
  if(!description)errors.push(`${route}: missing description`);
  if(!canonical||!canonical.startsWith(canonicalOrigin)||canonical.endsWith("/")&&canonical!==canonicalOrigin)errors.push(`${route}: malformed canonical ${canonical||"missing"}`);
  if(/noindex/i.test(robots))errors.push(`${route}: accidental production noindex`);
  if((html.match(/<h1[\s>]/gi)||[]).length!==1)errors.push(`${route}: expected exactly one h1`);
  for(const match of html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/gi)){try{JSON.parse(match[1])}catch{errors.push(`${route}: invalid JSON-LD`)}}
  if(/PLACEHOLDER_TEXT|lorem ipsum/i.test(html))errors.push(`${route}: unsupported placeholder text`);
}
const known=new Set(routes.keys());
for(const [route,{html}] of routes){
  for(const m of html.matchAll(/href="(\/[^"#?]*)/g)){const href=m[1].replace(/\/$/,"")||"/";if(href.startsWith("/_next")||/\.(png|svg|xml|txt|webmanifest|ico)$/.test(href))continue;if(!known.has(href))errors.push(`${route}: broken internal link ${href}`)}
  for(const m of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:png|jpg|jpeg|webp|avif|svg|ico))"/gi)){const asset=path.resolve("public",m[1].slice(1));if(!fs.existsSync(asset)&&!m[1].startsWith("/_next/"))errors.push(`${route}: missing local image ${m[1]}`)}
}
const sitemap=fs.readFileSync(path.join(root,"sitemap.xml.body"),"utf8"),robots=fs.readFileSync(path.join(root,"robots.txt.body"),"utf8");
const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
if(!sitemap.startsWith("<?xml")||!sitemap.includes("<urlset"))errors.push("sitemap: invalid XML shape");
if(new Set(locs).size!==locs.length)errors.push("sitemap: duplicate URL");
for(const loc of locs){if(!loc.startsWith(canonicalOrigin))errors.push(`sitemap: noncanonical ${loc}`);const route=loc.slice(canonicalOrigin.length)||"/";if(!known.has(route))errors.push(`sitemap: route not in production build ${route}`)}
if(!robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`))errors.push("robots: production sitemap missing");
if(/Disallow:\s*\/_next|Disallow:\s*\/public/.test(robots))errors.push("robots: required assets blocked");
console.log(`SEO routes: ${routes.size}; sitemap URLs: ${locs.length}; unique titles: ${titles.size}`);
if(errors.length){errors.forEach(e=>console.error(`FAIL ${e}`));process.exit(1)}
console.log("SEO validation PASS");
