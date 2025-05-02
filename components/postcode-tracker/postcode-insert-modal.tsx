import { NewPostcodeTrackerForm } from "../forms/new-postcode-tracker-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type PostcodeInsertModal = {
  children: React.ReactNode;
};
export function PostcodeInsertModal({ children }: PostcodeInsertModal) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start tracking a postcode</DialogTitle>
          <DialogDescription>
            Recieve live updates on crime reports in your area.
          </DialogDescription>
        </DialogHeader>
        <NewPostcodeTrackerForm />
      </DialogContent>
    </Dialog>
  );
}
