import { Ref, ref, onMounted, onUnmounted } from "vue";

export function useWindow(): {
    width: Ref<number>;
    height: Ref<number>;
} {
    const width = ref(0);
    const height = ref(0);
    const resizeAction = () => {
        return (() => {
            width.value = document.body.clientWidth;
            height.value = document.body.clientHeight;
        })();
    };

    onMounted(() => {
        width.value = document.body.clientWidth;
        height.value = document.body.clientHeight;
        window.addEventListener("resize", resizeAction);
    });

    onUnmounted(() => {
        window.removeEventListener("resize", resizeAction);
    });

    return { width, height };
}


