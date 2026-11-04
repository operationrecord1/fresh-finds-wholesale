import * as AlertDialog from "@radix-ui/react-alert-dialog";
import "./CartInteractions.css";

export function CartConfirmation({ action, onCancel, onConfirm }: {
  action: { sku?: string; title?: string } | null;
  onCancel: () => void; onConfirm: () => void;
}) {
  return <AlertDialog.Root open={!!action} onOpenChange={open => { if (!open) onCancel(); }}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="cart-confirm-overlay" />
      <AlertDialog.Content className="cart-confirm">
        <AlertDialog.Title>{action?.sku ? "Remove this item?" : "Remove all items?"}</AlertDialog.Title>
        <AlertDialog.Description>{action?.sku ? action.title : "This will empty your shopping cart."}</AlertDialog.Description>
        <div className="cart-confirm-actions">
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onClick={onConfirm}>OK</AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>;
}
