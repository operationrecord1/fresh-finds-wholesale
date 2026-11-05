import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./HeroCarousel.css";
const slides = [
 {eyebrow:"BUSINESS STARTS WITH A CONVERSATION",title:"Good connections.\nBetter possibilities.",description:"Thoughtful sourcing. Personal support. Wholesale built around your business.",alt:"Two business professionals discussing merchandise in a wholesale showroom",theme:"conversation"},
 {eyebrow:"MANY CATEGORIES. ONE CONNECTION.",title:"Everyday essentials.\nExtraordinary potential.",description:"Explore a world of merchandise for the way your customers live.",alt:"Home, stationery and technology merchandise on mint and ivory display platforms",theme:"assortment"},
 {eyebrow:"FRESH PERSPECTIVES ON WHOLESALE",title:"A little discovery.\nA lot of possibility.",description:"Build your next assortment with a broader point of view.",alt:"Tools, stationery, pet accessories and household merchandise on lavender platforms",theme:"discovery"}
];
export function HeroCarousel(){
 const [index,setIndex]=useState(0);const start=useRef<{x:number;y:number}|null>(null);const slide=slides[index]!;
 const move=(step:number)=>setIndex(i=>(i+step+slides.length)%slides.length);
 return <section className={`merch-hero merch-${slide.theme}`} aria-label="Featured wholesale collections" aria-roledescription="carousel"
 onTouchStart={e=>{const t=e.touches[0];if(t)start.current={x:t.clientX,y:t.clientY}}}
 onTouchEnd={e=>{const t=e.changedTouches[0],s=start.current;if(t&&s&&Math.abs(t.clientX-s.x)>50&&Math.abs(t.clientX-s.x)>Math.abs(t.clientY-s.y))move(t.clientX<s.x?1:-1);start.current=null}}>
 <div className="merch-composition" aria-live="polite" aria-atomic="true">
 <div className="merch-copy"><span className="merch-eyebrow">{slide.eyebrow}</span><h2>{slide.title.split('\n').map((line,i)=><span key={line} className={i===1?'merch-accent':''}>{line}</span>)}</h2><p>{slide.description}</p><span className="merch-signature">Artisan Mart<span aria-hidden="true"> / </span>Wholesale, thoughtfully.</span></div>
 <img key={index} className="merch-hero-image" src={`${import.meta.env.BASE_URL}images/brand-story-${index+1}.webp`} alt={slide.alt} width="1536" height="1024" fetchPriority={index===0?'high':'auto'}/>
 </div>
 <button className="merch-arrow merch-prev" aria-label="Previous banner" onClick={()=>move(-1)}><ChevronLeft/></button><button className="merch-arrow merch-next" aria-label="Next banner" onClick={()=>move(1)}><ChevronRight/></button>
 <div className="merch-dots" aria-label="Choose banner">{slides.map((s,i)=><button key={s.theme} aria-label={`Banner ${i+1}: ${s.title.replace('\n',' ')}`} aria-pressed={index===i} onClick={()=>setIndex(i)}><span/></button>)}</div>
 </section>
}
