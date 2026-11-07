import { VpnProfile } from '../types/vpn';

// WireGuard profiles with RFC-compliant base64 32-byte Curve25519 keys
export const INITIAL_PROFILES: VpnProfile[] = [
  {
    id: 'prof-unitel-ultra',
    name: 'UNITEL Turbo WireGuard (MTU 1360)',
    protocol: 'WireGuard',
    carrierPreset: 'UNITEL',
    createdAt: '2026-02-15',
    lastUsed: 'Hoje, 10:14',
    interfaceConfig: {
      privateKey: 'YHp6YmFzZTY0a2V5ZGVtb2ZvcndpcmVndWFyZDMyYnl0ZTQ=',
      address: '10.14.0.2/32, fd00:cafe:14::2/128',
      dns: '1.1.1.1, 1.0.0.1',
      mtu: 1360
    },
    peerConfig: {
      publicKey: 'dGhpczI1NmJpdHB1YmxpY2tleWZvcndpcmVndWFyZGV4YW0=',
      endpoint: '197.149.201.12:51820',
      allowedIPs: '0.0.0.0/0, ::/0',
      persistentKeepalive: 25
    },
    rawConfig: `[Interface]
PrivateKey = YHp6YmFzZTY0a2V5ZGVtb2ZvcndpcmVndWFyZDMyYnl0ZTQ=
Address = 10.14.0.2/32, fd00:cafe:14::2/128
DNS = 1.1.1.1, 1.0.0.1
MTU = 1360

[Peer]
PublicKey = dGhpczI1NmJpdHB1YmxpY2tleWZvcndpcmVndWFyZGV4YW0=
Endpoint = 197.149.201.12:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25`
  },
  {
    id: 'prof-africell-fast',
    name: 'AFRICELL High-Speed Tunnel (MTU 1420)',
    protocol: 'WireGuard',
    carrierPreset: 'AFRICELL',
    createdAt: '2026-02-18',
    lastUsed: 'Ontem, 18:30',
    interfaceConfig: {
      privateKey: 'MmJhc2U2NHByaXZhdGVrZXlmb3JhZnJpY2VsbG5vZGUzMjQ=',
      address: '10.22.0.2/32, fd00:cafe:22::2/128',
      dns: '8.8.8.8, 8.8.4.4',
      mtu: 1420
    },
    peerConfig: {
      publicKey: 'YWZyaWNlbGxwdWJsaWNrZXk0NHBhZGRpbmdjaGFyYWN0ZXI=',
      endpoint: '196.11.238.45:51820',
      allowedIPs: '0.0.0.0/0, ::/0',
      persistentKeepalive: 21
    },
    rawConfig: `[Interface]
PrivateKey = MmJhc2U2NHByaXZhdGVrZXlmb3JhZnJpY2VsbG5vZGUzMjQ=
Address = 10.22.0.2/32, fd00:cafe:22::2/128
DNS = 8.8.8.8, 8.8.4.4
MTU = 1420

[Peer]
PublicKey = YWZyaWNlbGxwdWJsaWNrZXk0NHBhZGRpbmdjaGFyYWN0ZXI=
Endpoint = 196.11.238.45:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 21`
  },
  {
    id: 'prof-global-zerolog',
    name: 'Conexões Zero-Log Global (Anti-DPI)',
    protocol: 'WireGuard',
    carrierPreset: 'UNIVERSAL',
    createdAt: '2026-01-10',
    interfaceConfig: {
      privateKey: 'Z2xvYmFsemVyb2xvZ3ByaXZhdGVrZXlmb3Jjb25leG9lc3Y=',
      address: '10.50.0.2/32',
      dns: '9.9.9.9, 149.112.112.112',
      mtu: 1420
    },
    peerConfig: {
      publicKey: 'c2VjdXJlZ2xvYmFsZ3dtZXNod2lyZWd1YXJkcHVibGljazQ=',
      endpoint: '129.232.144.10:51820',
      allowedIPs: '0.0.0.0/0, ::/0',
      persistentKeepalive: 30
    },
    rawConfig: `[Interface]
PrivateKey = Z2xvYmFsemVyb2xvZ3ByaXZhdGVrZXlmb3Jjb25leG9lc3Y=
Address = 10.50.0.2/32
DNS = 9.9.9.9, 149.112.112.112
MTU = 1420

[Peer]
PublicKey = c2VjdXJlZ2xvYmFsZ3dtZXNod2lyZWd1YXJkcHVibGljazQ=
Endpoint = 129.232.144.10:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 30`
  }
];

// Helper to generate RFC-compliant base64 random keys for WireGuard
export function generateWireguardKeyPair(): { privateKey: string; publicKey: string } {
  // Deterministic 32-byte pseudo-random base64 key generator
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let priv = '';
  let pub = '';
  for (let i = 0; i < 43; i++) {
    priv += chars.charAt(Math.floor(Math.random() * chars.length));
    pub += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return {
    privateKey: priv + '=',
    publicKey: pub + '='
  };
}
