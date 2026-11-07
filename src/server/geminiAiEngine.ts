import { GoogleGenAI } from '@google/genai';
import { FullConnectivityReport, HackerAiAnalysisResult, OperatorType } from '../types/vpn';

export class GeminiAiEngine {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }

  /**
   * Analyze diagnostic telemetry using Gemini 3.8 Flash
   */
  public async analyzeConnectivity(
    report: FullConnectivityReport,
    operator: OperatorType = 'UNITEL'
  ): Promise<HackerAiAnalysisResult> {
    // If Gemini API is available, query gemini-3.8-flash
    if (this.ai && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Você é o Motor de Inteligência Artificial Especializado em Redes do "Conexões VPN" para Angola (Redes UNITEL e AFRICELL).
Analise os seguintes dados técnicos de telemetria coletados de um candidato a SNI / Servidor:

Host: ${report.host}
Operadora: ${operator}
Status Geral: ${report.overallStatus}
DNS: IPv4=[${report.dns.ipv4.join(', ')}], IPv6=[${report.dns.ipv6.join(', ')}], Tempo=${report.dns.timeMs}ms
Portas TCP Testadas:
${report.tcpPorts.map(p => `- Porta ${p.port} (${p.protocol}): ${p.status} (Tempo=${p.timeMs}ms, Aberto=${p.isOpen})`).join('\n')}
TLS: Testado=${report.tls.tested}, Autorizado=${report.tls.authorized}, Versão=${report.tls.version || 'N/D'}, Cifra=${report.tls.cipher || 'N/D'}, Sujeito=${report.tls.certSubject || 'N/D'}, Emissor=${report.tls.certIssuer || 'N/D'}, Erro=${report.tls.error || 'Nenhum'}
SSH Probe: Porta 22 Aberta=${report.ssh.isOpen}, Banner=${report.ssh.banner || 'Nenhum'}
HTTP Proxy: Porta 8080 Aberta=${report.httpProxy.isOpen}, Permite CONNECT=${report.httpProxy.allowsConnect}
Zero-Rating: Patrocinado=${report.zeroRating?.isZeroRated ? 'SIM' : 'NÃO'}, Detalhes=${report.zeroRating?.details || 'N/D'}
Latência Total: ${report.totalLatencyMs}ms

Retorne um JSON com a seguinte estrutura:
{
  "overallAssessment": "EXCELENTE_PARA_TUNEL" | "COMPATIVEL_COM_RESSALVAS" | "BLOQUEIO_OPERADORA" | "INVIAVEL",
  "suggestedMtu": number (geralmente entre 1280 e 1420),
  "suggestedPort": number (443, 8443, 80 ou 51820),
  "suggestedKeepalive": number (geralmente 25),
  "firewallObservation": "Observação técnica sobre DPI, inspeção ou bloqueio detectado na operadora",
  "explanation": "Explicação técnica detalhada em português sobre a viabilidade deste host para tunelamento SNI e VPN",
  "recommendedProfileConfig": "Configuração rápida sugerida para o perfil WireGuard"
}`;

        const response = await this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'Você é um engenheiro sênior de infraestrutura de redes e telecomunicações em Angola. Seja preciso, técnico e focado em WireGuard e SNI.',
            responseMimeType: 'application/json'
          }
        });

        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          return {
            timestamp: new Date().toISOString(),
            targetHost: report.host,
            operator,
            overallAssessment: parsed.overallAssessment || 'COMPATIVEL_COM_RESSALVAS',
            suggestedMtu: Number(parsed.suggestedMtu) || 1360,
            suggestedPort: Number(parsed.suggestedPort) || 443,
            suggestedKeepalive: Number(parsed.suggestedKeepalive) || 25,
            firewallObservation: parsed.firewallObservation || 'Inspeção de pacotes padrão na rede da operadora.',
            explanation: parsed.explanation || 'Análise de compatibilidade concluída pelo motor de IA.',
            recommendedProfileConfig: parsed.recommendedProfileConfig
          };
        }
      } catch (err) {
        console.warn('[Gemini AI Engine] Falha na chamada da API, utilizando análise heurística determinística:', err);
      }
    }

    // Deterministic Heuristic Engine Fallback
    const hasTls = report.tls.tested && report.tls.version;
    const hasOpen443 = report.tcpPorts.some(p => p.port === 443 && p.isOpen);
    const isZeroRated = report.zeroRating?.isZeroRated ?? false;
    const hasReset = report.tcpPorts.some(p => p.status === 'RESET');

    let assessment: HackerAiAnalysisResult['overallAssessment'] = 'INVIAVEL';
    let suggestedMtu = 1420;
    let suggestedPort = 443;
    let firewallObs = '';
    let explanation = '';

    if (hasReset) {
      assessment = 'BLOQUEIO_OPERADORA';
      suggestedMtu = 1280;
      firewallObs = `Injeção de TCP RST detectada. O firewall da operadora ${operator} intercepta tentativas de conexão a este domínio.`;
      explanation = `O tráfego destinado a ${report.host} sofreu encerramento forçado por reset de conexão (RST). Recomenda-se utilizar encapsulamento com MTU reduzido (1280) ou tentar porta alternativa 8443.`;
    } else if (isZeroRated && hasTls) {
      assessment = 'EXCELENTE_PARA_TUNEL';
      suggestedMtu = 1360;
      suggestedPort = 443;
      firewallObs = `Canal livre de tarifação verificado para ${operator}. Tráfego prioritário na infraestrutura móvel.`;
      explanation = `${report.host} é um serviço patrocinado e autenticado com certificado válido. Excelente candidato para cabeçalho SNI e transporte sem consumo de saldo.`;
    } else if (hasOpen443 && hasTls) {
      assessment = 'COMPATIVEL_COM_RESSALVAS';
      suggestedMtu = 1400;
      suggestedPort = 443;
      firewallObs = `Handshake TLS concluído em ${report.tls.timeMs}ms. Sem bloqueios de porta aparentes.`;
      explanation = `Servidor acessível com resposta TLS ativa (${report.tls.version || 'TLS 1.3'}). Pode ser utilizado como ponto de apoio de túnel WireGuard na rede ${operator}.`;
    } else {
      assessment = 'INVIAVEL';
      suggestedMtu = 1420;
      firewallObs = `Portas padrão fechadas ou sem resposta SYN-ACK.`;
      explanation = `O host ${report.host} não respondeu às tentativas de handshake e conexão. Inviável para tunelamento de tráfego.`;
    }

    return {
      timestamp: new Date().toISOString(),
      targetHost: report.host,
      operator,
      overallAssessment: assessment,
      suggestedMtu,
      suggestedPort,
      suggestedKeepalive: 25,
      firewallObservation: firewallObs,
      explanation,
      recommendedProfileConfig: `[Interface]\nAddress = 10.8.0.2/24\nDNS = 1.1.1.1\nMTU = ${suggestedMtu}\n\n[Peer]\nEndpoint = ${report.host}:${suggestedPort}\nAllowedIPs = 0.0.0.0/0\nPersistentKeepalive = 25`
    };
  }
}
