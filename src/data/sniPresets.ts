import { OperatorType } from '../types/vpn';

export interface SniPreset {
  host: string;
  name: string;
  category: 'Operadora' | 'Governo & Institucional' | 'Banca & Finanças' | 'CDNs Globais' | 'Comunicações' | 'Educação';
  operator: OperatorType | 'AMBAS';
  expectedPort: number;
  description: string;
}

export const SNI_PRESETS: SniPreset[] = [
  // 1. Operadoras de Telecomunicações (Unitel / Africell / Nacionais)
  {
    host: 'portal.unitel.ao',
    name: 'Portal Oficial Unitel',
    category: 'Operadora',
    operator: 'UNITEL',
    expectedPort: 443,
    description: 'Portal de serviços e atendimento da Unitel Angola'
  },
  {
    host: 'unitel.ao',
    name: 'Unitel Angola Institucional',
    category: 'Operadora',
    operator: 'UNITEL',
    expectedPort: 443,
    description: 'Domínio institucional principal da Unitel S.A.'
  },
  {
    host: 'recargas.unitel.ao',
    name: 'Unitel Recargas & Saldo',
    category: 'Operadora',
    operator: 'UNITEL',
    expectedPort: 443,
    description: 'Portal seguro de recargas e consulta de saldo'
  },
  {
    host: 'netshows.unitel.ao',
    name: 'Unitel NetShows Multimídia',
    category: 'Operadora',
    operator: 'UNITEL',
    expectedPort: 443,
    description: 'Plataforma oficial de conteúdos multimídia'
  },
  {
    host: 'africell.ao',
    name: 'Africell Angola Portal',
    category: 'Operadora',
    operator: 'AFRICELL',
    expectedPort: 443,
    description: 'Portal principal da operadora Africell Angola'
  },
  {
    host: 'my.africell.ao',
    name: 'Meu Africell Dashboard',
    category: 'Operadora',
    operator: 'AFRICELL',
    expectedPort: 443,
    description: 'Área de autoatendimento e pacotes de dados'
  },
  {
    host: 'afrimoney.ao',
    name: 'Afrimoney Carteira Móvel',
    category: 'Operadora',
    operator: 'AFRICELL',
    expectedPort: 443,
    description: 'Serviço de pagamentos e transferências móveis'
  },
  {
    host: 'shop.africell.ao',
    name: 'Loja Oficial Africell',
    category: 'Operadora',
    operator: 'AFRICELL',
    expectedPort: 443,
    description: 'Catálogo de dispositivos e serviços'
  },
  {
    host: 'movicel.ao',
    name: 'Movicel Telecomunicações',
    category: 'Operadora',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Portal da operadora móvel nacional'
  },
  {
    host: 'angolatelecom.ao',
    name: 'Angola Telecom Backbone',
    category: 'Operadora',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Empresa estatal de telecomunicações de Angola'
  },

  // 2. Governo & Serviços Públicos de Angola
  {
    host: 'governo.gov.ao',
    name: 'Portal do Governo de Angola',
    category: 'Governo & Institucional',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Portal oficial da República de Angola'
  },
  {
    host: 'minfin.gov.ao',
    name: 'Ministério das Finanças',
    category: 'Governo & Institucional',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Portal institucional de finanças públicas'
  },
  {
    host: 'agt.minfin.gov.ao',
    name: 'Administração Geral Tributária (AGT)',
    category: 'Governo & Institucional',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Sistema tributário e aduaneiro de Angola'
  },
  {
    host: 'bna.ao',
    name: 'Banco Nacional de Angola (BNA)',
    category: 'Governo & Institucional',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Banco Central e regulador bancário angolano'
  },
  {
    host: 'inacom.gov.ao',
    name: 'INACOM — Regulador Telecom',
    category: 'Governo & Institucional',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Instituto Angolano das Comunicações'
  },
  {
    host: 'mintel.gov.ao',
    name: 'MINTTICS Telecomunicações',
    category: 'Governo & Institucional',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Ministério das Telecomunicações e Tecnologias'
  },
  {
    host: 'sme.gov.ao',
    name: 'Serviço de Migração e Estrangeiros',
    category: 'Governo & Institucional',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Serviços de passaportes e vistos'
  },

  // 3. Banca & Setor Financeiro de Angola
  {
    host: 'bancabai.ao',
    name: 'Banco BAI Angola',
    category: 'Banca & Finanças',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Internet banking Banco Angolano de Investimentos'
  },
  {
    host: 'bancobpc.ao',
    name: 'Banco de Poupança e Crédito (BPC)',
    category: 'Banca & Finanças',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Portal do banco público de fomento'
  },
  {
    host: 'bancobic.ao',
    name: 'Banco BIC Angola',
    category: 'Banca & Finanças',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Portal bancário institucional e corporativo'
  },
  {
    host: 'bancoatlantico.ao',
    name: 'Banco Millennium Atlântico',
    category: 'Banca & Finanças',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Internet banking e cartões multicaixa'
  },
  {
    host: 'bancobfa.ao',
    name: 'Banco de Fomento Angola (BFA)',
    category: 'Banca & Finanças',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Serviços financeiros e bancários'
  },
  {
    host: 'emis.co.ao',
    name: 'EMIS — Empresa Interbancária',
    category: 'Banca & Finanças',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Rede nacional Multicaixa e pagamentos eletrónicos'
  },

  // 4. Educação & Ensino Superior
  {
    host: 'ucan.edu.ao',
    name: 'Universidade Católica de Angola',
    category: 'Educação',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Portal acadêmico e pesquisa universitária'
  },
  {
    host: 'uan.ao',
    name: 'Universidade Agostinho Neto',
    category: 'Educação',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Principal universidade pública de Angola'
  },

  // 5. CDNs Globais e Infraestrutura
  {
    host: 'cloudflare.com',
    name: 'Cloudflare Global Anycast Edge',
    category: 'CDNs Globais',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Infraestrutura global de distribuição e CDN'
  },
  {
    host: 'google.com',
    name: 'Google Services Edge',
    category: 'CDNs Globais',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Serviços globais Anycast de alta disponibilidade'
  },
  {
    host: 'gstatic.com',
    name: 'Google Static Assets CDN',
    category: 'CDNs Globais',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Rede de entrega estática de baixa latência'
  },
  {
    host: 'microsoft.com',
    name: 'Microsoft Azure Edge Network',
    category: 'CDNs Globais',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Pontos de presença globais Microsoft'
  },
  {
    host: 'fastly.com',
    name: 'Fastly Edge Cloud Platform',
    category: 'CDNs Globais',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Plataforma de borda e cache de alta velocidade'
  },
  {
    host: 'amazon.com',
    name: 'Amazon CloudFront Edge',
    category: 'CDNs Globais',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Rede de distribuição global AWS'
  },

  // 6. Comunicações Seguras
  {
    host: 'whatsapp.net',
    name: 'WhatsApp Media Transit',
    category: 'Comunicações',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Servidores de mídia e comunicação criptografada'
  },
  {
    host: 'telegram.org',
    name: 'Telegram Secure Core',
    category: 'Comunicações',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Protocolo MTProto e infraestrutura segura'
  },
  {
    host: 'wikipedia.org',
    name: 'Wikipédia / Wikimedia',
    category: 'Comunicações',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Enciclopédia livre e repositório de conhecimento'
  },
  {
    host: 'github.com',
    name: 'GitHub Platform Edge',
    category: 'Comunicações',
    operator: 'AMBAS',
    expectedPort: 443,
    description: 'Plataforma global de desenvolvimento de software'
  }
];
