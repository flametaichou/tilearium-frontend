type TileariumWindow = (Window & typeof globalThis) & { 
    configs: { [key: string]: string };
}

export default function getEnv(name: string): string {
    return (window as TileariumWindow)?.configs?.[name] || process.env[name];
}
