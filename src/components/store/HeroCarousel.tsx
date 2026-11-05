import { Link } from "@tanstack/react-router";
import { PRODUCTS } from "@/data/catalog";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./HeroCarousel.css";
const slides = [
 {eyebrow:"BUSINESS STARTS WITH A CONVERSATION",title:"Good connections.\nBetter possibilities.",description:"Thoughtful sourcing. Personal support. Wholesale built around your business.",alt:"Two business professionals discussing merchandise in a wholesale showroom",theme:"conversation"},
 {eyebrow:"ARTISAN MART • WHOLESALE COLLECTION",title:"PET SUPPLIES",description:"Everyday essentials for their favorite companions.",alt:"Pet supplies from the Artisan Mart catalog",theme:"pet",skus:["AL981","DI613","DA865","OL601"]},
 {eyebrow:"ARTISAN MART • EVERYDAY DISCOVERIES",title:"HOME ESSENTIALS",description:"Practical finds. Fresh possibilities for your shelves.",alt:"Home essentials from the Artisan Mart catalog",theme:"home",skus:["OL512","DA591","DA592","DA855"]}
];
export function HeroCarousel(){
 const [index,setIndex]=useState(0);const start=useRef<{x:number;y:number}|null>(null);const slide=slides[index]!;
 const move=(step:number)=>setIndex(i=>(i+step+slides.length)%slides.length);
 return <section className={`merch-hero merch-${slide.theme}`} aria-label="Featured wholesale collections" aria-roledescription="carousel"
 onTouchStart={e=>{const t=e.touches[0];if(t)start.current={x:t.clientX,y:t.clientY}}}
 onTouchEnd={e=>{const t=e.changedTouches[0],s=start.current;if(t&&s&&Math.abs(t.clientX-s.x)>50&&Math.abs(t.clientX-s.x)>Math.abs(t.clientY-s.y))move(t.clientX<s.x?1:-1);start.current=null}}>
 {index > 0 ? <div className="campaign-banner" style={{backgroundImage:`url(${import.meta.env.BASE_URL}images/campaign-${slide.theme}.webp)`}} aria-live="polite" aria-atomic="true">
 <div className="campaign-products campaign-left">{slide.skus?.slice(0,2).map(sku=>{const p=PRODUCTS.find(p=>p.sku===sku);return p?<img key={sku} src={`${import.meta.env.BASE_URL}${p.images[0]}`} alt={p.title}/>:null})}</div>
 <div className="campaign-copy"><span>{slide.eyebrow}</span><h2>{slide.title}</h2><p>{slide.description}</p><Link to="/collection/$slug" params={{slug:"best-sellers"}} className="campaign-shop">SHOP NOW <span aria-hidden="true">→</span></Link></div>
 <div className="campaign-products campaign-right">{slide.skus?.slice(2).map(sku=>{const p=PRODUCTS.find(p=>p.sku===sku);return p?<img key={sku} src={`${import.meta.env.BASE_URL}${p.images[0]}`} alt={p.title}/>:null})}</div>
 </div> : <div className="merch-composition" aria-live="polite" aria-atomic="true">
 <div className="merch-copy"><span className="merch-eyebrow">{slide.eyebrow}</span><h2>{slide.title.split('\n').map((line,i)=><span key={line} className={i===1?'merch-accent':''}>{line}</span>)}</h2><p>{slide.description}</p><span className="merch-signature">Artisan Mart<span aria-hidden="true"> / </span>Wholesale, thoughtfully.</span></div>
 <img key={index} className="merch-hero-image" src={`${import.meta.env.BASE_URL}images/brand-story-${index+1}.webp`} alt={slide.alt} width="1536" height="1024" fetchPriority={index===0?'high':'auto'}/>
 </div>}
 <button className="merch-arrow merch-prev" aria-label="Previous banner" onClick={()=>move(-1)}><ChevronLeft/></button><button className="merch-arrow merch-next" aria-label="Next banner" onClick={()=>move(1)}><ChevronRight/></button>
 <div className="merch-dots" aria-label="Choose banner">{slides.map((s,i)=><button key={s.theme} aria-label={`Banner ${i+1}: ${s.title.replace('\n',' ')}`} aria-pressed={index===i} onClick={()=>setIndex(i)}><span/></button>)}</div>
 </section>
}
