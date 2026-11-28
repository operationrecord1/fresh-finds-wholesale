import {expect,it,vi} from 'vitest';
import {fireEvent,render,screen} from '@testing-library/react';
import {CallUsButton} from '@/components/store/CallUsButton';
it('opens centered call options without starting a call automatically',()=>{
 HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
 HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 render(<CallUsButton/>);fireEvent.click(screen.getByRole('button',{name:/CALL US TODAY/}));
 expect(screen.getByRole('dialog',{name:'Call Artisan Mart'})).toHaveAttribute('open');
 expect(screen.getByRole('link',{name:'Call now'})).toHaveAttribute('href','tel:+17272255768');
 fireEvent.click(screen.getByRole('button',{name:'Close call options'}));expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
