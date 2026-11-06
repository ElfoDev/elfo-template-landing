/**
 * ============================================================================
 *  CONFIGURAÇÃO DO SITE: é o único arquivo que você precisa editar.
 * ============================================================================
 *
 * Marca, cores, fontes, número do WhatsApp, textos de cada seção, SEO e
 * analytics ficam aqui. O build valida tudo e, se faltar algo, mostra
 * exatamente qual campo corrigir.
 *
 * Imagens (logo, favicon, OG, fotos) vão na pasta `public/` e são
 * referenciadas aqui com "/" na frente: `public/logo.svg` → "/logo.svg".
 */
import type { SiteConfigInput } from "./lib/config-schema";

export default {
  brand: {
    name: "Aurora Studio",
    logo: { src: "/logo.svg", alt: "Aurora Studio" },
    favicon: "/favicon.svg",
    // Viram tokens do Tailwind: bg-primary, text-accent, bg-background, text-text...
    colors: {
      primary: "#0F766E",
      accent: "#F59E0B",
      background: "#FAFAF9",
      text: "#1C1917",
    },
    // Qualquer família do https://fontsource.org (baixada e servida pelo próprio site).
    fonts: {
      heading: "Manrope",
      body: "Inter",
    },
  },

  whatsapp: {
    // Formato E.164 só com dígitos: DDI + DDD + número.
    number: "5511999999999",
    defaultMessage: "Olá! Vim pelo site e gostaria de saber mais.",
    ctaLabel: "Falar no WhatsApp",
    // Opcional: mensagem diferente por botão (header, hero, finalCta).
    ctaMessages: {
      hero: "Olá! Vim pelo site e quero agendar uma conversa.",
      finalCta: "Olá! Quero começar agora. Como funciona?",
    },
  },

  sections: {
    hero: {
      enabled: true,
      eyebrow: "Atendimento rápido pelo WhatsApp",
      title: "Seu projeto pronto em dias, não em meses",
      subtitle:
        "Planejamento, execução e acompanhamento num só lugar. Fale com a gente e receba uma proposta sob medida hoje mesmo.",
      ctaLabel: "Quero minha proposta",
    },
    benefits: {
      enabled: true,
      title: "Por que escolher a Aurora",
      items: [
        {
          icon: "⚡",
          title: "Resposta em minutos",
          description: "Atendimento humano pelo WhatsApp, sem robô e sem fila.",
        },
        {
          icon: "🎯",
          title: "Sob medida",
          description: "Cada proposta é feita para o seu momento e o seu orçamento.",
        },
        {
          icon: "🤝",
          title: "Acompanhamento de perto",
          description: "Você sabe em que pé está tudo, do começo ao fim.",
        },
      ],
    },
    howItWorks: {
      enabled: true,
      title: "Como funciona",
      steps: [
        { title: "Chame no WhatsApp", description: "Conte rapidamente o que você precisa." },
        { title: "Receba a proposta", description: "Enviamos opções claras, com prazo e valor." },
        { title: "Comece", description: "Aprovou? A gente começa no mesmo dia." },
      ],
    },
    testimonials: {
      enabled: true,
      title: "Quem já fez, recomenda",
      items: [
        {
          quote: "Atendimento impecável do primeiro contato à entrega.",
          name: "Mariana S.",
          role: "Empreendedora",
        },
        {
          quote: "Rápidos, transparentes e muito atenciosos. Super indico!",
          name: "Rafael T.",
          role: "Gerente de projetos",
        },
      ],
    },
    faq: {
      enabled: true,
      title: "Perguntas frequentes",
      items: [
        {
          question: "Quanto tempo leva para receber a proposta?",
          answer: "Normalmente no mesmo dia em que você chama a gente no WhatsApp.",
        },
        {
          question: "Atendem em todo o Brasil?",
          answer: "Sim. Todo o atendimento é online, então atendemos qualquer cidade.",
        },
      ],
    },
    finalCta: {
      enabled: true,
      title: "Pronto para começar?",
      subtitle: "Chame no WhatsApp e receba sua proposta ainda hoje.",
      ctaLabel: "Chamar no WhatsApp",
    },
  },

  seo: {
    title: "Aurora Studio | Proposta sob medida pelo WhatsApp",
    description:
      "Planejamento, execução e acompanhamento num só lugar. Fale com a Aurora Studio pelo WhatsApp e receba sua proposta hoje.",
    siteUrl: "https://example.com",
    ogImage: "/og.png",
    locale: "pt-BR",
  },

  // Desligados por padrão. Descomente e preencha para ativar.
  analytics: {
    // ga4Id: "G-XXXXXXXXXX",
    // metaPixelId: "000000000000000",
  },
} satisfies SiteConfigInput;
