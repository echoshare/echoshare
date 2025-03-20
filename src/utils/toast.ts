import { useToast } from "vuestic-ui";
import { debug } from "./console";

export function toastErr(message: string) {
    
    const { notify } = useToast();
    notify({
        message,
        color: "danger",
        position: "bottom-right",
        dangerouslyUseHtmlString: true,
    });
}

export function toastBigError(message: string) {
    const { notify } = useToast();
    notify({
        message,
        color: "danger",
        duration: 900000,
        dangerouslyUseHtmlString: true,
    });
}

export function toastSuccess(message: string) {
    const { notify } = useToast();
    notify({
        message,
        color: "success",
        dangerouslyUseHtmlString: true,
    });
}

export function toastTip(message: string) {
    const { notify } = useToast();
    notify({
        message,
        position: "bottom-right",
        dangerouslyUseHtmlString: true,
    });
}
