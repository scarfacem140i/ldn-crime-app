import { CrimeReportForm } from "../forms/crime-report-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface CrimeReportDialogProps {
  open?: boolean;
  onClose?: () => void;
}

export default function CrimeReportDialog({
  onClose,
  open,
}: CrimeReportDialogProps) {
  return (
    <Dialog
      open={open ?? false}
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Crime</DialogTitle>
          <DialogDescription>
            Report a crime on the map for others to see.
          </DialogDescription>
        </DialogHeader>
        <CrimeReportForm onSuccess={() => onClose?.()} />
      </DialogContent>
      <DialogClose />
    </Dialog>
  );
}
