# Motor Hacker AI — Conexões VPN (Plano de Implementação Revisto)

Implementação tecnológica avançada diretamente no projeto existente **Conexões VPN**, integrando inteligência artificial autónoma (Gemini 3.8 Flash), motor de descoberta contínua de SNI, diagnóstico de conectividade multi-protocolo (DNS, TCP, TLS, SSH, HTTP CONNECT), módulo de Zero-Rating para UNITEL e AFRICELL, consola cibernética com radar holográfico e integração nativa com o WireGuard Android.

---

## Decisões Confirmadas com o Utilizador

> [!IMPORTANT]
> - **Preservação Total**: Todo o código funcional existente (WireGuard nativo, scanner SNI, dashboard 3D, perfis e configurações) é 100% preservado. Nenhuma funcionalidade anterior será removida.
> - **Visualização e Acesso**: Separador dedicado **Hacker AI** com consola cibernética de alta densidade, radar militar interativo e painel de telemetria.
> - **Nível de Automação**: Modo híbrido (varredura contínua em segundo plano com disparo e re-teste manual imediato sob demanda).
> - **Zero-Rating**: Filtro rigoroso pela operadora selecionada (**UNITEL** ou **AFRICELL**), cruzando serviços oficiais patrocinados (banca, gov, utilitários, self-care) com testes HTTP/TLS reais.

---

## 1. Visão Geral & Módulos Funcionais

### 1.1 Motor Hacker AI (Gemini 3.8 Flash)
- **Análise Inteligente de Logs**: Processamento de telemetria de rede para identificar anomalias como injeção de pacotes `RST` por firewalls/DPI e incompatibilidade de cifras TLS.
- **Otimização de Configurações VPN**: Recomendação automática de MTU ideal (ex.: 1280, 1360, 1420), portas alternativas (443 vs 8443) e parâmetros de PersistentKeepalive para WireGuard.
- **Diagnóstico Técnico em Linguagem Clara**: Explicações didáticas e rigorosas sobre falhas de certificados X.509, cadeias não confiáveis e bloqueios de operadora.

### 1.2 Motor de Descoberta Automática de SNI
- Pesquisa ativa em fontes públicas legítimas:
  - Certificate Transparency logs (crt.sh)
  - Diretórios públicos de resolução (HackerTarget)
  - Web Crawler em portais oficiais de operadoras
  - Enumeração acelerada de subdomínios via DNS
- Eliminação de duplicados, registo de origem (`origin`), carimbo de data/hora e atualização em base viva.

### 1.3 Motor Avançado de Conectividade Multi-Protocolo
- **DNS**: Resolução paralela IPv4 (registos A) e IPv6 (registos AAAA), medindo latência precisa.
- **TCP Multi-Porta**: Testes simultâneos nas portas `80`, `443`, `8080` e `8443`.
- **TLS Handshake**: Teste com Server Name Indication (SNI), validação rigorosa de certificados X.509, extração de Sujeito, Emissor, Cifras negociadas e período de validade.
- **SSH Banner Probe**: Deteção de serviços SSH na porta `22` / `2222`.
- **HTTP CONNECT**: Verificação de tunelamento via proxies e gateways intermediários.

### 1.4 Motor de Zero-Rating (UNITEL & AFRICELL)
- Catálogo de serviços oficialmente elegíveis em Angola:
  - **UNITEL**: Portal Unitel (`portal.unitel.ao`), Recargas (`recargas.unitel.ao`), NetShows, Portais de Educação/Saúde, Banca BAI e BPC.
  - **AFRICELL**: Portal Africell (`africell.ao`), Área do Cliente (`my.africell.ao`), serviços públicos e institucionais.
- Verificação de cabeçalhos HTTP e respostas de redirecionamento (302 para portais cativos ou zero-rated).
- Classificação estrita: `ACESSO PATROCINADO CONFIRMADO` vs `ACESSO NORMAL` vs `BLOQUEIO POSSÍVEL`.

### 1.5 Estados de Apresentação Padronizados (9 Estados)
1. `SNI ENCONTRADO`
2. `DNS FUNCIONAL`
3. `TLS FUNCIONAL`
4. `PORTA DISPONÍVEL`
5. `SERVIDOR COMPATÍVEL`
6. `CONEXÃO VPN FUNCIONAL`
7. `ACESSO PATROCINADO CONFIRMADO`
8. `ACESSO NORMAL`
9. `FALHA NA CONEXÃO`

---

## 2. Experiência do Utilizador & Design Cibernético

- **Separador "Hacker AI"**:
  - **Radar Holográfico**: Visualizador vetorial animado em SVG/Canvas, simulando varredura circular contínua com nós interativos de hosts descobertos.
  - **Consola Cibernética**: Terminal com fonte monospace tabular (`font-mono tabular-nums`), feeds de log coloridos com filtros por nível (`INFO`, `DISCOVERY`, `TLS_PROBE`, `ZERO_RATING`, `AI_ANALYSIS`), cursor ativo e botão de exportação.
  - **Barra de Controle de Operadora**: Alternância instantânea entre UNITEL e AFRICELL com badge de contexto e indicador de sinal.
  - **Grelha de Resultados & Classificação**: Lista com filtros de estado e métricas de latência precisa.
  - **Ação 1-Clique "Injetar no Perfil VPN"**: Transfere o melhor SNI/servidor descoberto diretamente para o perfil ativo do WireGuard.

---

## 3. Mapeamento Exaustivo de Ficheiros

### Ficheiros a Criar
1. **`src/server/connectivityEngine.ts`**:
   - Prober multi-protocolo Node.js com sockets de baixo nível: DNS IPv4/IPv6, TCP multi-porta (80, 443, 8080, 8443), TLS handshake com SNI, SSH banner probe (porta 22) e HTTP CONNECT probe.
2. **`src/server/geminiAiEngine.ts`**:
   - Módulo de inteligência artificial com `@google/genai` (modelo `gemini-3.8-flash`), processando telemetria técnica, identificando padrões de bloqueio e gerando recomendações para perfis WireGuard.
3. **`src/server/zeroRatingCatalog.ts`**:
   - Base de dados técnica de domínios patrocinados de Angola (UNITEL e AFRICELL) com regras de validação de tarifação e cabeçalhos HTTP.
4. **`src/views/HackerAiView.tsx`**:
   - Ecrã principal do Motor Hacker AI, integrando radar, consola de logs, seletor de operadora, lista de resultados técnicos e painel de análise da IA.
5. **`src/components/CyberRadar.tsx`**:
   - Componente de radar interativo com feixe giratório e renderização dos nós de rede.
6. **`src/components/CyberConsole.tsx`**:
   - Componente de terminal com rolagem automática, filtros de log e comando de pesquisa rápida.

### Ficheiros a Modificar
1. **`server.ts`**:
   - Adicionar rotas para:
     - `POST /api/hacker-ai/analyze` (chamada ao motor Gemini)
     - `POST /api/hacker-ai/connectivity-test` (testes multi-protocolo)
     - `GET /api/zero-rating/catalog` (catálogo filtrado por operadora)
     - `POST /api/zero-rating/verify` (verificação de tarifação)
2. **`src/types/vpn.ts`**:
   - Adicionar interfaces para `HackerAiAnalysisResult`, `FullConnectivityReport`, `ZeroRatingDomain` e `SshProbeResult`.
3. **`src/components/Navigation.tsx`**:
   - Adicionar o item de navegação `'hacker-ai'` (desktop e gaveta mobile) com ícone cibernético.
4. **`src/App.tsx`**:
   - Integrar o estado de navegação para renderizar `HackerAiView`, permitindo injeção direta de candidatos validados nos perfis VPN.
5. **`android/app/src/main/java/com/conexoesvpn/app/MainActivity.kt`**:
   - Adicionar métodos `@JavascriptInterface` no `WebAppInterface` para expor testes de conectividade nativos com sockets Android: `testConnectivityFull(...)`.
6. **`android/app/src/main/java/com/conexoesvpn/app/SniScannerEngine.kt`**:
   - Expandir scanner nativo para suportar testes multi-porta (80, 443, 8080, 8443) e deteção de headers HTTP.

---

## 4. Arquitetura de Comunicação e Fluxo de Dados

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INTERFACE CONEXÕES VPN                          │
│                                                                        │
│   [ Início ]  [ Servidores ]  [ Scanner SNI ]  [ HACKER AI ]  [ Mais ] │
│                                                      │                 │
│         ┌────────────────────────────────────────────┴─────────────┐   │
│         │ HackerAiView.tsx                                         │   │
│         │  ├─ CyberRadar (Nós de sinal UNITEL / AFRICELL)          │   │
│         │  ├─ CyberConsole (Logs em tempo real & Terminal)         │   │
│         │  ├─ Zero-Rating Inspector (Filtro rigoroso de operadora) │   │
│         │  ├─ AI Recommendations (Gemini 3.8 Flash)                │   │
│         │  └─ Ação "Injetar no Perfil WireGuard"                  │   │
│         └────────────────────────────┬─────────────────────────────┘   │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │ HTTP /api/hacker-ai/*
┌──────────────────────────────────────▼─────────────────────────────────┐
│                      BACKEND EXPRESS (server.ts)                       │
│                                                                        │
│  ┌─────────────────────────┐    ┌───────────────────────────────────┐  │
│  │ geminiAiEngine.ts       │    │ connectivityEngine.ts             │  │
│  │ (Gemini 3.8 Flash)      │    │ (DNS, TCP 80/443/8080/8443, TLS,  │  │
│  │ - Diagnóstico de falha  │    │  SSH 22, HTTP CONNECT)            │  │
│  │ - Otimização WireGuard  │    └─────────────────┬─────────────────┘  │
│  └────────────┬────────────┘                      │                    │
│               │                 ┌─────────────────┴─────────────────┐  │
│               │                 │ zeroRatingCatalog.ts              │  │
│               │                 │ (Base Unitel / Africell oficial)  │  │
│               │                 └───────────────────────────────────┘  │
└───────────────┼───────────────────────────────────┼────────────────────┘
                │                                   │
┌───────────────▼───────────────────────────────────▼────────────────────┐
│                    CAMADA NATIVA ANDROID / KOTLIN                      │
│                                                                        │
│  - MainActivity.kt (WebAppInterface: startVpn, testConnectivityFull)   │
│  - SniScannerEngine.kt (Sockets nativos, SSLSocket com SNI)            │
│  - ConexoesVpnService.kt (Túnel WireGuard oficial com VpnService)      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Verificação, Compilação e Entrega

1. **Build Web & Sincronização**:
   - `npm run build`
   - Cópia automática dos ficheiros para `android/app/src/main/assets/dist/`
2. **Validação de Sintaxe & Tipos**:
   - `compile_applet` e `lint_applet` para assegurar 0 erros de compilação TypeScript/Node.js.
3. **Compatibilidade Android**:
   - Verificação das interfaces Kotlin (`MainActivity.kt`, `SniScannerEngine.kt`, `ConexoesVpnService.kt`) e dependências Gradle.
