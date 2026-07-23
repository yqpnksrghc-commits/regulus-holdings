import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata=buildMetadata({title:"Industries",path:"/industries",description:"Workflow automation for Toronto and Ontario clinics and professional-service firms, shaped around each organization’s real operating context."});
const items=[
  {href:"/industries/medical-dental-clinics",title:"Medical, dental, and aesthetic clinics",body:"Inquiry response, appointment administration, follow-up, intake, and fragmented operational information."},
  {href:"/industries/professional-services",title:"Professional services",body:"Client intake, document movement, status visibility, follow-up, and knowledge-supported administration."},
];
export default function IndustriesPage(){return <><PageHero eyebrow="Industries" title="Automation shaped around the work as it actually happens." lead="Regulus begins with the operating context, available evidence, and human decision boundaries—not a generic technology prescription."/><Section><div className="grid gap-6 md:grid-cols-2">{items.map(x=><Link key={x.href} href={x.href} className="rounded-3xl border border-line bg-panel p-8 hover:border-accent/50"><h2 className="text-h2">{x.title}</h2><p className="mt-4 text-ink-soft">{x.body}</p><span className="mt-6 inline-block text-sm font-medium">Explore the workflow context →</span></Link>)}</div></Section></>}
