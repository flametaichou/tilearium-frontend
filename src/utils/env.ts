type WorldSimWindow = (Window & typeof globalThis) & { 
    configs: { [key: string]: string };
}

export default function getEnv(name: string): string {
    return (window as WorldSimWindow)?.configs?.[name] || process.env[name];
}
