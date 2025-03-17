import { useToast } from "vuestic-ui";

export function toastErr(message: string) {
    const { notify } = useToast();
    notify({
        message,
        color: "danger",
        position: "bottom-right",
        duration:90000000

    });
}


export function toastTip(message: string) {
    const { notify } = useToast();
    notify({
        message,
        position: "bottom-right",
    });
}
