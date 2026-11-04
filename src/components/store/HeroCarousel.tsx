import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./HeroCarousel.css";

const slides = [
  { title: "Real conversations. Better sourcing.", alt: "Artisan Mart. Real conversations. Better sourcing. General merchandise for retailers and resellers.", image: 1 },
  { title: "More categories. One source.", alt: "Artisan Mart. More categories. One source. A broad assortment for your business: home, tech, tools, toys and pet supplies.", image: 2 },
  { title: "Wholesale for every aisle.", alt: "Artisan Mart. Wholesale for every aisle. General merchandise for retailers and resellers.", image: 3 },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const start = useRef<{x:number;y:number}|null>(null);
  const slide = slides[index]!;
  const move = (step:number) => setIndex(i => (i + step + slides.length) % slides.length);
  return <section className="merch-hero" aria-label="Featured wholesale collections" aria-roledescription="carousel"
    onTouchStart={e => { const t=e.touches[0]; if(t) start.current={x:t.clientX,y:t.clientY}; }}
    onTouchEnd={e => { const t=e.changedTouches[0], s=start.current; if(t&&s&&Math.abs(t.clientX-s.x)>50&&Math.abs(t.clientX-s.x)>Math.abs(t.clientY-s.y)) move(t.clientX<s.x?1:-1); start.current=null; }}>
    <div aria-live="polite" aria-atomic="true">
      <img className="merch-hero-image" src={`${import.meta.env.BASE_URL}images/approved-banner-${slide.image === 3 ? "warehouse" : slide.image}.webp`} alt={slide.alt} width="2172" height="724" fetchPriority={index === 0 ? "high" : "auto"} />
    </div>
    <button className="merch-arrow merch-prev" aria-label="Previous banner" onClick={()=>move(-1)}><ChevronLeft/></button>
    <button className="merch-arrow merch-next" aria-label="Next banner" onClick={()=>move(1)}><ChevronRight/></button>
    <div className="merch-dots" aria-label="Choose banner">{slides.map((s,i)=><button key={s.image} aria-label={`Banner ${i+1}: ${s.title}`} aria-pressed={index===i} onClick={()=>setIndex(i)}><span/></button>)}</div>
  </section>;
}
