import * as Dialog from '@radix-ui/react-dialog';
import {X} from 'lucide-react';
import {type ReactNode} from 'react';
import '@/styles/admin-readonly-dialog.css';

type Props={
 open:boolean;
 onOpenChange:(open:boolean)=>void;
 title:string;
 description:string;
 children:ReactNode;
};
/** Accessible details only: no approval, mutation, or server-side authority. */
export function AdminReadOnlyDialog({open,onOpenChange,title,description,children}:Props){
 return <Dialog.Root open={open} onOpenChange={onOpenChange}>
  <Dialog.Portal>
   <Dialog.Overlay className="ce-admin-detail-overlay"/>
   <Dialog.Content className="ce-admin-detail-dialog">
    <div className="ce-admin-detail-heading">
     <div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description></div>
     <Dialog.Close className="ce-admin-detail-close" aria-label="Fechar detalhes" type="button"><X size={19} aria-hidden="true"/></Dialog.Close>
    </div>
    <div className="ce-admin-detail-body">{children}</div>
   </Dialog.Content>
  </Dialog.Portal>
 </Dialog.Root>;
}
