import { useToast } from "vuestic-ui";

export function toastErr(message: string) {
    const { notify } = useToast();
    notify({
        message,
        color: "danger",
        position: "bottom-right",
    });
}


export function toastTip(message: string) {
    const { notify } = useToast();
    notify({
        message,
        position: "bottom-right",
    });
}
