import { Link } from "@tanstack/react-router";
import "./HomeCategories.css";

const CATEGORIES = [
  { name: "Pet Supplies", slug: "pet-supplies", image: "pet" },
  { name: "Personal Care", slug: "personal-care", image: "personal" },
  { name: "School & Office", slug: "school-office-supplies", image: "school" },
  { name: "Household", slug: "household-supplies", image: "household" },
  { name: "Sporting Goods", slug: "sporting-goods", image: "sporting" },
  { name: "Toys", slug: "toys", image: "toys" },
  { name: "Kitchen & Dining", slug: "kitchen-dining", image: "kitchen", extra: true },
  { name: "Apparel", slug: "apparel", image: "apparel", extra: true },
] as const;

export function HomeCategories() {
  return <section className="store-home-categories" aria-labelledby="store-home-categories-title">
    <h2 id="store-home-categories-title">Best Selling Categories</h2>
    <div className="store-home-category-grid">
      {CATEGORIES.map(category => <Link key={category.slug} to="/category/$slug" params={{ slug: category.slug }} className={`store-home-category${"extra" in category ? " is-desktop-extra" : ""}`}>
        <span className="store-home-category-icon" aria-hidden="true">
          {category.image === "kitchen" || category.image === "apparel"
            ? <img className="store-home-category-product" src={`${import.meta.env.BASE_URL}images/products/${category.image === "kitchen" ? "ol512" : "av822"}-1.webp`} alt="" loading="lazy" />
            : <span className={`store-home-category-sprite is-${category.image}`} style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/home-category-sprite.png)` }} />}
        </span>
        <span className="store-home-category-label">{category.name}</span>
      </Link>)}
    </div>
  </section>;
}
