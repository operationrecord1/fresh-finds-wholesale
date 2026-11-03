import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import "./HeroCarousel.css";

const slides = [
  { eyebrow: "THE WHOLESALE EDIT", title: "More variety. More possibilities.", text: "Explore everyday essentials for your next assortment.", link: "Explore imports", slug: "imports", image: 1 },
  { eyebrow: "DISCOVER SOMETHING NEW", title: "Fresh finds for your shelves.", text: "Find your next assortment in our new arrivals collection.", link: "Shop new arrivals", slug: "new-arrivals", image: 2 },
  { eyebrow: "BUILD YOUR ASSORTMENT", title: "Everyday essentials. Wholesale value.", text: "Browse closeouts across home, accessories and more.", link: "Explore closeouts", slug: "closeouts", image: 3 },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const start = useRef<{x:number;y:number}|null>(null);
  const slide = slides[index]!;
  const move = (step:number) => setIndex(i => (i + step + slides.length) % slides.length);
  return <section className="merch-hero" aria-label="Featured wholesale collections" aria-roledescription="carousel"
    onTouchStart={e => { const t=e.touches[0]; if(t) start.current={x:t.clientX,y:t.clientY}; }}
    onTouchEnd={e => { const t=e.changedTouches[0], s=start.current; if(t&&s&&Math.abs(t.clientX-s.x)>50&&Math.abs(t.clientX-s.x)>Math.abs(t.clientY-s.y)) move(t.clientX<s.x?1:-1); start.current=null; }}>
    <img className="merch-hero-image" src={`${import.meta.env.BASE_URL}images/wholesale-banner-${slide.image}.webp`} alt="" width="1536" height="1024" fetchPriority="high" />
    <div className="merch-hero-shade" />
    <div className="merch-hero-copy" aria-live="polite" aria-atomic="true">
      <p className="merch-eyebrow">{slide.eyebrow}</p><h2>{slide.title}</h2><p>{slide.text}</p>
      <Link to="/collection/$slug" params={{slug:slide.slug}}>{slide.link}<ArrowRight size={18}/></Link>
    </div>
    <button className="merch-arrow merch-prev" aria-label="Previous banner" onClick={()=>move(-1)}><ChevronLeft/></button>
    <button className="merch-arrow merch-next" aria-label="Next banner" onClick={()=>move(1)}><ChevronRight/></button>
    <div className="merch-dots" aria-label="Choose banner">{slides.map((s,i)=><button key={s.image} aria-label={`Banner ${i+1}: ${s.eyebrow}`} aria-pressed={index===i} onClick={()=>setIndex(i)}><span/></button>)}</div>
  </section>;
}
