/**
 * ============================================================================
 *  CONFIGURAÇÃO DO SITE: é o único arquivo que você precisa editar.
 * ============================================================================
 *
 * Marca, cores, fontes, número do WhatsApp, textos de cada seção, dados do
 * negócio, SEO e analytics ficam aqui. O build valida tudo e, se faltar
 * algo, mostra exatamente qual campo corrigir.
 *
 * Imagens:
 * - logo, favicon, imagem OG e logos de parceiros vão em `public/` e são
 *   referenciados com "/" na frente: `public/logo.svg` → "/logo.svg";
 * - fotos (hero, avatares) podem ir em `src/assets/` e ser referenciadas com
 *   "~/assets/foto.jpg": o build gera AVIF/WebP em vários tamanhos.
 *
 * Ícones: use o nome de um ícone de `src/lib/icons.ts` (ex.: "users", "clock").
 */
import type { SiteConfigInput } from "./lib/config-schema";

export default {
  brand: {
    name: "Aurora Studio",
    logo: { src: "/logo.svg", alt: "Aurora Studio" },
    // Versão do logo para o tema escuro (texto claro).
    logoDark: "/logo-dark.svg",
    favicon: "/favicon.svg",
    // Viram tokens do Tailwind: bg-primary, text-accent, bg-background, bg-surface, text-text...
    colors: {
      primary: "#0F766E",
      accent: "#F59E0B",
      background: "#FAFAF9",
      text: "#1C1917",
    },
    // Tema escuro: "light" (só claro), "dark" (só escuro) ou "auto" (segue o sistema do visitante).
    colorScheme: "auto",
    darkColors: {
      primary: "#2DD4BF",
      accent: "#FBBF24",
      background: "#0C1312",
      text: "#F2F2F0",
    },
    // Qualquer família do https://fontsource.org (baixada e servida pelo próprio site).
    fonts: {
      heading: "Manrope",
      body: "Inter",
    },
  },

  whatsapp: {
    // Formato E.164 só com dígitos: DDI + DDD + número.
    number: "5511987654321",
    defaultMessage: "Olá! Vim pelo site e gostaria de saber mais.",
    ctaLabel: "Falar no WhatsApp",
    // Opcional: mensagem diferente por botão
    // (header, hero, howItWorks, pricing, faq, finalCta, footer, floating).
    ctaMessages: {
      hero: "Olá! Vim pelo site e quero agendar uma aula experimental.",
      howItWorks: "Olá! Quero agendar minha aula experimental gratuita. Quais horários vocês têm?",
      faq: "Olá! Tenho uma dúvida sobre as aulas.",
      finalCta: "Olá! Quero agendar minha primeira aula. Como funciona?",
    },
  },

  sections: {
    hero: {
      enabled: true,
      eyebrow: "Aula experimental grátis · Vila Madalena, SP",
      // O trecho entre *asteriscos* fica em destaque.
      title: "Menos dor nas costas, *mais leveza* no seu dia a dia",
      subtitle:
        "Pilates com fisioterapeutas, em turmas de até 3 alunos. Agende sua aula experimental gratuita pelo WhatsApp em menos de 1 minuto.",
      ctaLabel: "Agendar aula experimental",
      ctaNote: "Respondemos em até 10 minutos, de segunda a sábado.",
      secondaryCta: { label: "Ver planos e preços", target: "pricing" },
      proof: {
        rating: 4.9,
        highlight: "4,9 no Google",
        text: "mais de 380 alunos atendidos",
        initials: ["AP", "CM", "FL", "+"],
      },
      // Foto no lugar da ilustração: { src: "~/assets/hero.jpg", alt: "Aula de pilates no estúdio" }
      // image: { src: "~/assets/hero.jpg", alt: "..." },
      illustration: true,
      badges: [
        { icon: "star", text: "4,9 · 212 avaliações" },
        { icon: "users", text: "Turmas de até 3 alunos" },
      ],
      chat: {
        status: "online agora",
        reply: "Oi! 😊 Temos amanhã às 7h ou às 18h30. Qual fica melhor pra você?",
        time: "09:41",
      },
    },
    logos: {
      enabled: true,
      title: "Parceiros e benefícios aceitos",
      items: [
        { name: "Vitalis Saúde", icon: "logo-cross" },
        { name: "Clube Movimento", icon: "logo-bars" },
        { name: "Revista Equilíbrio", icon: "logo-person" },
        { name: "Corpo & Café", icon: "logo-drop" },
        { name: "Bairro Ativo", icon: "logo-house" },
      ],
    },
    benefits: {
      enabled: true,
      navLabel: "Benefícios",
      kicker: "Por que a Aurora",
      title: "Cuidado de clínica, clima de estúdio",
      subtitle:
        "Tudo pensado para você evoluir com segurança e ter vontade de voltar na próxima aula.",
      items: [
        {
          icon: "users",
          title: "Turmas de até 3 alunos",
          description:
            "Atenção de verdade em cada exercício, com correção individual do começo ao fim da aula.",
        },
        {
          icon: "award",
          title: "Só fisioterapeutas",
          description:
            "Equipe com CREFITO ativo e formação em pilates clínico. Avaliação postural já na primeira aula.",
        },
        {
          icon: "heart",
          title: "Alívio de dores",
          description:
            "Programas para lombar, cervical, joelho e pós-lesão, acompanhados de perto a cada semana.",
        },
        {
          icon: "clock",
          title: "Das 6h às 21h",
          description:
            "Horários antes e depois do trabalho, e sábado de manhã. Precisa remarcar? É pelo WhatsApp.",
        },
        {
          icon: "unlock",
          title: "Sem fidelidade",
          description: "Planos mensais, sem taxa de matrícula. Cancele quando quiser, sem multa.",
        },
        {
          icon: "train",
          title: "A 4 minutos do metrô",
          description:
            "Pertinho da estação Vila Madalena, com bicicletário e vestiário com chuveiro.",
        },
      ],
    },
    howItWorks: {
      enabled: true,
      navLabel: "Como funciona",
      kicker: "Simples assim",
      title: "Da primeira mensagem à primeira aula em 3 passos",
      steps: [
        {
          title: "Chame no WhatsApp",
          description:
            "Conte seu objetivo e o melhor horário pra você. Quem responde é uma fisioterapeuta da equipe.",
          tag: "Resposta em ~10 min",
          tagIcon: "clock",
        },
        {
          title: "Faça a aula experimental",
          description:
            "50 minutos, com avaliação postural e um plano de exercícios pensado para o seu caso.",
          tag: "Grátis",
          tagIcon: "check",
        },
        {
          title: "Escolha seu plano",
          description:
            "Gostou? Você começa na mesma semana, sem taxa de matrícula e sem fidelidade.",
          tag: "Sem matrícula",
          tagIcon: "unlock",
        },
      ],
      ctaLabel: "Quero agendar minha aula",
      ctaNote: "Grátis e sem compromisso",
    },
    testimonials: {
      enabled: true,
      navLabel: "Depoimentos",
      kicker: "Depoimentos",
      title: "Quem treina aqui sente a diferença",
      rating: { value: 4.9, text: "212 avaliações no Google" },
      items: [
        {
          quote:
            "Tinha dor lombar há anos e já tinha desistido de academia. Em dois meses de Aurora eu durmo melhor e voltei a correr no parque.",
          name: "Ana Paula R.",
          role: "Analista de sistemas · aluna há 1 ano",
          rating: 5,
        },
        {
          quote:
            "Turma pequena faz toda a diferença: a Ju corrige cada detalhe. E remarcar a aula pelo WhatsApp é muito prático.",
          name: "Carlos M.",
          role: "Engenheiro, 56 anos · aluno há 8 meses",
          rating: 5,
        },
        {
          quote:
            "Comecei no pós-parto, com muito receio. Fui acolhida desde a primeira mensagem e sinto a evolução todo dia.",
          name: "Fernanda L.",
          role: "Designer · aluna há 6 meses",
          rating: 5,
        },
      ],
    },
    pricing: {
      enabled: true,
      navLabel: "Planos",
      kicker: "Planos",
      title: "Escolha o ritmo que cabe na sua semana",
      subtitle: "Sem taxa de matrícula e sem fidelidade. A primeira aula é por nossa conta.",
      featuredLabel: "Mais escolhido",
      currency: "R$",
      plans: [
        {
          name: "Essencial",
          description: "1x por semana, para começar sem pressa.",
          price: "280",
          period: "/mês",
          priceNote: "≈ R$ 70 por aula",
          features: [
            "4 aulas por mês",
            "Turmas de até 3 alunos",
            "Avaliação postural inicial",
            "Remarcação pelo WhatsApp",
          ],
          ctaLabel: "Quero o Essencial",
          message:
            "Olá! Tenho interesse no plano Essencial (1x por semana). Quais horários vocês têm?",
        },
        {
          name: "Regular",
          description: "2x por semana, o ritmo ideal para ver resultado.",
          price: "440",
          period: "/mês",
          priceNote: "≈ R$ 55 por aula",
          features: [
            "8 aulas por mês",
            "Turmas de até 3 alunos",
            "Reavaliação a cada 3 meses",
            "Remarcação pelo WhatsApp",
            "Exercícios para fazer em casa",
          ],
          ctaLabel: "Quero o Regular",
          message:
            "Olá! Tenho interesse no plano Regular (2x por semana). Quais horários vocês têm?",
          featured: true,
        },
        {
          name: "Intensivo",
          description: "3x por semana, para reabilitação e metas maiores.",
          price: "590",
          period: "/mês",
          priceNote: "≈ R$ 49 por aula",
          features: [
            "12 aulas por mês",
            "Prioridade na escolha de horários",
            "Reavaliação mensal",
            "Plano de exercícios para casa",
          ],
          ctaLabel: "Quero o Intensivo",
          message:
            "Olá! Tenho interesse no plano Intensivo (3x por semana). Quais horários vocês têm?",
        },
      ],
      footnote:
        "Pagamento mensal no Pix ou cartão. Sessões individuais de fisioterapia sob consulta.",
    },
    faq: {
      enabled: true,
      navLabel: "Dúvidas",
      kicker: "Dúvidas",
      title: "Perguntas frequentes",
      subtitle:
        "Respostas rápidas para o que mais perguntam. Se a sua dúvida não estiver aqui, é só chamar.",
      openFirst: true,
      items: [
        {
          question: "Nunca fiz pilates. Posso começar?",
          answer:
            "Pode, e é o mais comum por aqui. Na aula experimental fazemos uma avaliação postural e adaptamos cada exercício ao seu nível.",
        },
        {
          question: "Tenho hérnia de disco ou dor crônica. O pilates é indicado?",
          answer:
            "Na maioria dos casos, sim. Todas as aulas são dadas por fisioterapeutas, que montam um plano seguro para a sua condição. Se tiver laudo ou exames, traga na primeira aula.",
        },
        {
          question: "A aula experimental é mesmo gratuita?",
          answer:
            "Sim: 50 minutos, sem custo e sem compromisso. Você só escolhe um plano se gostar.",
        },
        {
          question: "Posso remarcar uma aula?",
          answer:
            "Pode. Avise pelo WhatsApp com até 3 horas de antecedência e a gente encaixa você em outro horário da mesma semana.",
        },
        {
          question: "Aceitam plano de saúde?",
          answer:
            "Emitimos recibo para reembolso nos planos que cobrem fisioterapia. Também aceitamos os benefícios Vitalis Saúde e Clube Movimento.",
        },
        {
          question: "O que preciso levar?",
          answer:
            "Roupa confortável e meia antiderrapante (vendemos no estúdio, se precisar). Temos vestiário com chuveiro.",
        },
      ],
      help: {
        title: "Ainda com dúvida?",
        text: "Fale direto com a equipe. Respondemos em poucos minutos.",
        ctaLabel: "Perguntar no WhatsApp",
      },
    },
    finalCta: {
      enabled: true,
      title: "Sua primeira aula é por nossa conta",
      subtitle:
        "Chame no WhatsApp, escolha o melhor horário e venha conhecer o estúdio. Sem compromisso.",
      ctaLabel: "Agendar pelo WhatsApp",
      note: "Seg. a sex., 6h às 21h · Sáb., 8h às 13h",
    },
    footer: {
      enabled: true,
      description: "Pilates e fisioterapia em turmas pequenas, na Vila Madalena desde 2017.",
    },
    floating: {
      enabled: true,
    },
  },

  // Rodapé e dados estruturados (JSON-LD) para o Google.
  business: {
    type: "HealthClub",
    description: "Pilates e fisioterapia em turmas de até 3 alunos, na Vila Madalena (SP).",
    phone: "(11) 3456-7890",
    email: "ola@aurorastudio.com.br",
    address: {
      street: "Rua Harmonia, 412",
      district: "Vila Madalena",
      city: "São Paulo",
      region: "SP",
      postalCode: "05435-000",
      country: "BR",
      mapsUrl: "https://maps.google.com/?q=Rua+Harmonia,+412,+S%C3%A3o+Paulo",
    },
    hours: [
      { days: "Seg. a sex.", time: "6h às 21h", schema: "Mo-Fr 06:00-21:00" },
      { days: "Sábado", time: "8h às 13h", schema: "Sa 08:00-13:00" },
      { days: "Domingo", time: "fechado" },
    ],
    socials: [
      { network: "instagram", url: "https://instagram.com/aurorastudio" },
      { network: "facebook", url: "https://facebook.com/aurorastudio" },
      { network: "youtube", url: "https://youtube.com/@aurorastudio" },
    ],
    legalId: "CNPJ 12.345.678/0001-90",
  },

  seo: {
    title: "Aurora Studio | Pilates e fisioterapia na Vila Madalena",
    description:
      "Pilates com fisioterapeutas em turmas de até 3 alunos, na Vila Madalena (SP). Agende sua aula experimental gratuita pelo WhatsApp.",
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
