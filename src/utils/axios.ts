import axios from "axios";
import { usePeer } from "../store/peer";

const PeerStore = usePeer();
export const http = axios.create({
    timeout: PeerStore.maxOutOfTime,
});

http.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

