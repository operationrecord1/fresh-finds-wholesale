import { createFileRoute, Link } from "@tanstack/react-router";
import { meta } from "@/components/store/SimplePage";
import "@/components/store/TermsPage.css";
export const Route = createFileRoute("/terms-of-sale")({head:()=>meta("Terms of Sale","Artisan Mart terms and conditions."),component:Terms});
const conditions = [
 "All shipments are FOB our Carson, California warehouse meaning that all freight is paid by the customer unless expressly detailed.",
 "When offered Free Shipping is only valid within the contiguous 48 states unless expressed otherwise.",
 "Terms are prepaid unless open terms have been approved prior by our credit department.",
 "Visa, Discover, MasterCard, American Express and Paypal are all accepted forms of payment.",
 "Orders processed via credit card are subject to an immediate hold for the full amount of the order including shipping. Once the order is shipped, the hold will the authorized and the charge will be validated. Artisan Mart is not responsible for any overage charges levied by the issuing credit card provider. If the card is declined at time of purchase, customer will be notified immediately.",
 "Wire transfers, money orders and checks are accepted forms of payment for orders completed offline.",
 "Orders worth less than $50 before shipping will be accessed a $5 handling fee at the time of checkout.",
 "Claims of shortages, damages or defective merchandise must be reported within 72 hours of receipt of order. No returns will be accepted without authorization.",
 "Artisan Mart offers shipping options of FedEx (Smart Post & Ground) in addition to several LTL shipping methods.",
 "Artisan Mart does offer on-site pickup for orders placed online. Pickup’s must be organized and timed with the customer’s sales representative to allow our warehouse adequate time to prepare the order.",
 "Artisan Mart offers free shipment of orders of $2,500 or greater in the local area using Artisan Mart’ vehicles. Orders between $1,000 and $2,500 will have a $50 freight option. Valid within 30 miles of Artisan Mart physical location.",
 "Sales tax will be collected on all orders without a valid resale number.",
 "No returned products will be accepted without an authorized RA number. Shipping charges on returned products are the responsibility of the customer. At Artisan Mart discretion, a 20% restocking may be assessed to the returned order. Credits will be given 48 hours from the time of receiving product back or if product is deemed damaged.",
 "No Items will be returned for:",
 "Custom Orders or Configurations: No returns or refunds will be made for items that are special ordered for the customer.",
 "Damaged Shipments: If your shipment arrives damaged: You must notate the damage with the carrier’s delivery record in accordance with the carrier’s policy, save the merchandise in the original box and packing it arrived in and notify Artisan Mart immediately to arrange for a carrier inspection and pick up of damaged merchandise.",
 "Return of Product: Contact Artisan Mart within the 14 days of shipment for a Return Authorization Number before returning to Artisan Mart. No returns of any type will be accepted without an RA number. Please have the following information ready when calling for an RA#: customer name, order number, item number and reason for the return. Once an RA# is provided, customer must return product within 14 days of the time from the RA being provided.",
 "Shipping charges: Original shipping charges are not refundable. Shipping charges of returned product are the responsibility of the customer. Artisan Mart will match the shipping method and pay for shipping charges on replacement or product exchange.",
 "Artisan Mart prides itself in providing a high fill rate with our orders, however, at times orders may be placed with insufficient quantities available for fulfillment. In these situations, a salesperson will immediately contact the customer to offer all available options including short shipping, substitution for similar items and refunding of payment.",
 "Coupons may be used up to the date of expiration. To redeem coupon code, enter the code into the area provided during checkout. Coupons must be redeemed at the time order is submitted.",
];
const exclusions = ["Product returned is incomplete or defaced.","You do not have original order number or receipt.","Returned items have different serial number from what was originally sent.","Items that are opened and not in original packaging.","Warranty cards are filled out."];
function Terms(){return <main className="terms-page"><nav aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Terms of Sale</span></nav><article><h1>Terms &amp; Conditions</h1><ol className="terms-conditions">{conditions.map((text,index)=><li key={index}>{text}{index===13&&<ul>{exclusions.map(item=><li key={item}>{item}</li>)}</ul>}</li>)}</ol></article></main>}
