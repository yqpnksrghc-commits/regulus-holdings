import Link from "next/link";

export function Breadcrumbs({items}:{items:{name:string;path:string}[]}) {
  return <nav aria-label="Breadcrumb" className="container-lab py-5 text-sm text-dim">
    <ol className="flex flex-wrap gap-2">{items.map((item,index)=><li key={item.path}>
      {index>0 && <span aria-hidden className="mr-2">/</span>}
      {index===items.length-1?<span aria-current="page">{item.name}</span>:<Link className="hover:text-ink" href={item.path}>{item.name}</Link>}
    </li>)}</ol>
  </nav>;
}
