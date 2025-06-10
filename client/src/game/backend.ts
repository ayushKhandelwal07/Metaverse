export const BACKEND_URL = import.meta.env.DEV
    ? "ws://localhost:2567"
    : import.meta.env.VITE_BACKEND_URL || "wss://metaverse.ayushworks.tech";

console.log(`Backend url is  => ${BACKEND_URL}`);    