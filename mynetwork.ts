// mynetwork.ts - Utility to get the best network IP
const networkInfo = Deno.networkInterfaces();

export function getBestIP(preferIPv6 = false): { ip: string; type: string } {
    let ipv4: string | null = null;
    let ipv6: string | null = null;

    for (const iface of networkInfo) {
        if (iface?.internal || iface.name === "lo" || iface.name === "docker0") {
            continue; // Skip loopback and Docker
        }

        if (iface.family === "IPv4") {
            ipv4 = iface.address; // Store IPv4
        } else if (iface.family === "IPv6" && !iface.address.startsWith("fe80::")) {
            ipv6 = iface.address; // Store global IPv6 (skip link-local)
        }

        // Return based on preference
        if (preferIPv6 && ipv6) return { ip: ipv6, type: "IPv6" };
        if (!preferIPv6 && ipv4) return { ip: ipv4, type: "IPv4" };
    }

    return ipv4 ? { ip: ipv4, type: "IPv4" } : { ip: "::1", type: "IPv6" }; // Fallback
}
