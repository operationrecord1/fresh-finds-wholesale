import {useRef} from 'react';
import {Phone,X} from 'lucide-react';
import {BUSINESS_PHONE,BUSINESS_PHONE_HREF} from '@/lib/business';
import './CallUsButton.css';

export function CallUsButton(){
 const dialog=useRef<HTMLDialogElement>(null);
 return <><button type="button" className="store-call-button" aria-haspopup="dialog" onClick={()=>dialog.current?.showModal()}><Phone size={20} aria-hidden="true"/><span><small>CALL US TODAY</small><strong>{BUSINESS_PHONE}</strong></span></button>
 <dialog ref={dialog} className="store-call-dialog" aria-labelledby="store-call-title" onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}>
 <div className="store-call-dialog-content"><button type="button" className="store-call-close" aria-label="Close call options" onClick={()=>dialog.current?.close()}><X size={20}/></button><Phone size={28} aria-hidden="true"/><h2 id="store-call-title">Call Artisan Mart</h2><p>{BUSINESS_PHONE}</p><a href={BUSINESS_PHONE_HREF}>Call now</a></div>
 </dialog></>;
}
