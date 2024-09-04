import {
  AlertDialog as AlertDialogNative,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Props {
  open: boolean;
  title: string;
  body: string;
  actions: {
    label: string;
    type: "action" | "cancel";
    action?: () => void;
  }[]
}

export function AlertDialog(props: Props) {
  return (
    <AlertDialogNative open={props.open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {props.body}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {
            props.actions.map(action => {
              if (action.type === "action") {
                return <AlertDialogAction onClick={() => {
                  action.action && action.action();
                }} key={action.label}>{action.label}</AlertDialogAction>
              } else {
                return <AlertDialogCancel onClick={() => {
                  action.action && action.action();
                }} key={action.label}>{action.label}</AlertDialogCancel>
              }
            })
          }
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogNative>
  )
}
