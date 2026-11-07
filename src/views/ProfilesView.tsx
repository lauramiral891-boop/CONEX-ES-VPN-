import React, { useState } from 'react';
import { VpnProfile, OperatorType } from '../types/vpn';
import { generateWireguardKeyPair } from '../data/profiles';
import { 
  Layers, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Check, 
  Key, 
  ShieldCheck, 
  Copy, 
  AlertCircle,
  FileCode,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface ProfilesViewProps {
  profiles: VpnProfile[];
  currentProfileId: string;
  onSelectProfile: (profile: VpnProfile) => void;
  onAddProfile: (profile: VpnProfile) => void;
  onDeleteProfile: (id: string) => void;
  operator: OperatorType;
}

export const ProfilesView: React.FC<ProfilesViewProps> = ({
  profiles,
  currentProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
  operator
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // New Profile Form State
  const [newProfileName, setNewProfileName] = useState('');
  const [newCarrier, setNewCarrier] = useState<OperatorType | 'UNIVERSAL'>('UNIVERSAL');
  const [newAddress, setNewAddress] = useState('10.14.0.2/32');
  const [newDns, setNewDns] = useState('1.1.1.1, 1.0.0.1');
  const [newMtu, setNewMtu] = useState('1360');
  const [newEndpoint, setNewEndpoint] = useState('197.149.201.12:51820');
  const [newAllowedIPs, setNewAllowedIPs] = useState('0.0.0.0/0, ::/0');
  const [newKeepalive, setNewKeepalive] = useState('25');
  const [keys, setKeys] = useState<{ privateKey: string; publicKey: string }>(generateWireguardKeyPair());

  // Import Form State
  const [importText, setImportText] = useState('');
  const [importName, setImportName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Generate new keys
  const handleRegenerateKeys = () => {
    sounds.playClick();
    setKeys(generateWireguardKeyPair());
  };

  // Submit new profile
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    sounds.playSuccess();

    const rawConfig = `[Interface]
PrivateKey = ${keys.privateKey}
Address = ${newAddress}
DNS = ${newDns}
MTU = ${newMtu}

[Peer]
PublicKey = ${keys.publicKey}
Endpoint = ${newEndpoint}
AllowedIPs = ${newAllowedIPs}
PersistentKeepalive = ${newKeepalive}`;

    const created: VpnProfile = {
      id: `prof-${Date.now()}`,
      name: newProfileName.trim(),
      protocol: 'WireGuard',
      carrierPreset: newCarrier,
      createdAt: 'Hoje',
      interfaceConfig: {
        privateKey: keys.privateKey,
        address: newAddress,
        dns: newDns,
        mtu: Number(newMtu) || 1420
      },
      peerConfig: {
        publicKey: keys.publicKey,
        endpoint: newEndpoint,
        allowedIPs: newAllowedIPs,
        persistentKeepalive: Number(newKeepalive) || 25
      },
      rawConfig,
      isCustom: true
    };

    onAddProfile(created);
    setShowCreateModal(false);
    setNewProfileName('');
    setKeys(generateWireguardKeyPair());
  };

  // Validate & Import Profile
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) {
      setImportError('Insira o conteúdo do ficheiro .conf');
      return;
    }

    setIsValidating(true);
    setImportError(null);

    try {
      const res = await fetch('/api/vpn/validate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: importText })
      });
      const data = await res.json();

      if (!data.valid) {
        setImportError(data.errors ? data.errors.join(' ') : 'Configuração WireGuard inválida');
        sounds.playDisconnect();
        setIsValidating(false);
        return;
      }

      // Profile is valid, parse fields
      const lines = importText.split('\n');
      let priv = '';
      let addr = '10.8.0.2/32';
      let dns = '1.1.1.1';
      let mtu = 1420;
      let pub = '';
      let ep = '';
      let allowed = '0.0.0.0/0';
      let keep = 25;

      for (const line of lines) {
        const [k, ...v] = line.split('=');
        if (!k || v.length === 0) continue;
        const key = k.trim().toLowerCase();
        const val = v.join('=').trim();
        if (key === 'privatekey') priv = val;
        if (key === 'address') addr = val;
        if (key === 'dns') dns = val;
        if (key === 'mtu') mtu = Number(val) || 1420;
        if (key === 'publickey') pub = val;
        if (key === 'endpoint') ep = val;
        if (key === 'allowedips') allowed = val;
        if (key === 'persistentkeepalive') keep = Number(val) || 25;
      }

      const imported: VpnProfile = {
        id: `prof-import-${Date.now()}`,
        name: importName.trim() || `WireGuard Importado (${new Date().toLocaleTimeString()})`,
        protocol: 'WireGuard',
        carrierPreset: 'UNIVERSAL',
        createdAt: 'Hoje',
        interfaceConfig: {
          privateKey: priv,
          address: addr,
          dns,
          mtu
        },
        peerConfig: {
          publicKey: pub,
          endpoint: ep,
          allowedIPs: allowed,
          persistentKeepalive: keep
        },
        rawConfig: importText,
        isCustom: true
      };

      sounds.playSuccess();
      onAddProfile(imported);
      setShowImportModal(false);
      setImportText('');
      setImportName('');
    } catch {
      setImportError('Erro ao comunicar com o validador de perfis');
    } finally {
      setIsValidating(false);
    }
  };

  // Download profile file
  const handleDownloadProfile = (profile: VpnProfile) => {
    sounds.playClick();
    const configToExport = profile.rawConfig || `[Interface]
PrivateKey = ${profile.interfaceConfig.privateKey}
Address = ${profile.interfaceConfig.address}
DNS = ${profile.interfaceConfig.dns}
MTU = ${profile.interfaceConfig.mtu}

[Peer]
PublicKey = ${profile.peerConfig.publicKey}
Endpoint = ${profile.peerConfig.endpoint}
AllowedIPs = ${profile.peerConfig.allowedIPs}
PersistentKeepalive = ${profile.peerConfig.persistentKeepalive}`;

    const blob = new Blob([configToExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.conf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Gestão de Perfis VPN</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Perfis criptográficos WireGuard (.conf) compatíveis com Android VpnService
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setShowImportModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Importar .conf</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer glow-cyan"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Novo Perfil</span>
          </button>
        </div>
      </div>

      {/* Profile List */}
      <div className="space-y-3">
        {profiles.map((profile) => {
          const isSelected = profile.id === currentProfileId;
          const isCurrentOperatorProfile = profile.carrierPreset === operator;

          return (
            <div
              key={profile.id}
              onClick={() => {
                sounds.playClick();
                onSelectProfile(profile);
              }}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-md active:scale-99 ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-950/40 via-[#0d1627] to-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.25)]'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    <FileCode className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{profile.name}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-mono font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          ATIVO
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-3">
                      <span>MTU: <strong className="text-slate-200">{profile.interfaceConfig.mtu}</strong></span>
                      <span>•</span>
                      <span>Endpoint: <strong className="text-slate-200">{profile.peerConfig.endpoint}</strong></span>
                      <span>•</span>
                      <span>DNS: <strong className="text-slate-200">{profile.interfaceConfig.dns}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {profile.carrierPreset && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                      profile.carrierPreset === 'UNITEL'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : profile.carrierPreset === 'AFRICELL'
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {profile.carrierPreset}
                    </span>
                  )}

                  <button
                    type="button"
                    title="Baixar ficheiro .conf"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadProfile(profile);
                    }}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {profile.isCustom && (
                    <button
                      type="button"
                      title="Excluir perfil"
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playClick();
                        onDeleteProfile(profile.id);
                      }}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CRIAR NOVO PERFIL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b1020] border border-cyan-500/30 w-full max-w-xl rounded-2xl p-5 max-h-[90vh] overflow-y-auto space-y-4 glow-cyan-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-lg text-white">Criar Perfil WireGuard Oficial</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Nome do Perfil</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Luanda Gaming Pro (Unitel)"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Otimização de Operadora</label>
                  <select
                    value={newCarrier}
                    onChange={(e) => setNewCarrier(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="UNIVERSAL">Universal</option>
                    <option value="UNITEL">UNITEL (MTU 1360)</option>
                    <option value="AFRICELL">AFRICELL (MTU 1420)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">MTU do Túnel</label>
                  <input
                    type="number"
                    value={newMtu}
                    onChange={(e) => setNewMtu(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Curve25519 Keys generator */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Chaves Curve25519 (Base64)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerateKeys}
                    className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
                  >
                    Regerar Par de Chaves
                  </button>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono">PrivateKey ([Interface]):</span>
                  <div className="text-xs font-mono text-slate-300 truncate bg-slate-900 px-2 py-1 rounded">
                    {keys.privateKey}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono">PublicKey ([Peer]):</span>
                  <div className="text-xs font-mono text-slate-300 truncate bg-slate-900 px-2 py-1 rounded">
                    {keys.publicKey}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Endpoint do Servidor</label>
                  <input
                    type="text"
                    required
                    value={newEndpoint}
                    onChange={(e) => setNewEndpoint(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">Endereço IP Local</label>
                  <input
                    type="text"
                    required
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/30"
                >
                  Salvar Perfil WireGuard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORTAR PERFIL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b1020] border border-cyan-500/30 w-full max-w-xl rounded-2xl p-5 max-h-[90vh] overflow-y-auto space-y-4 glow-cyan-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-lg text-white">Importar Configuração .conf</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Nome de Identificação (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Servidor Luanda WireGuard"
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  Cole o arquivo .conf WireGuard completo
                </label>
                <textarea
                  rows={8}
                  placeholder={`[Interface]
PrivateKey = aaaaa...
Address = 10.8.0.2/32
DNS = 1.1.1.1

[Peer]
PublicKey = bbbbb...
Endpoint = 197.149.201.12:51820
AllowedIPs = 0.0.0.0/0`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isValidating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold text-xs font-mono shadow-lg shadow-cyan-500/30"
                >
                  {isValidating ? 'Validando Sintaxe...' : 'Validar e Importar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
