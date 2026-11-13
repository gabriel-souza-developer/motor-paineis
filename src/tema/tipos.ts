// Contrato do perfil.json. Toda tela lê a empresa por aqui (useEmpresa), nunca direto do JSON.

export type Fonte = "api" | "fixo";

export interface Indicador {
  rotulo: string;
  valor: string;
  icone: string; // nome do ícone Lucide em kebab-case
  fonte: Fonte;
  endpoint?: string;
}

export interface Chip {
  titulo: string;
  selo?: string;
  texto: string;
  icone?: string;
  fonte: Fonte;
}

export type StatusModulo = "ativo" | "em-breve" | "bloqueado-permissao";

export interface Modulo {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  status: StatusModulo;
  rota?: string;
  nota?: string;
}

export type VisualLogin = "rede" | "grafico" | "imagem" | "abstrato";

export interface Perfil {
  slug: string;
  nome: string;
  produto: string;
  slogan: string;
  eyebrowLogin: string;
  api: Record<"dev" | "homologacao" | "producao", string>;
  logos: { clara: string; escura: string; favicon: string };
  login: {
    selo?: { texto: string; fonte: Fonte };
    titulo: string;
    subtitulo: string;
    formSubtitulo: string;
    visual: VisualLogin;
    imagem?: string;
    chips: Chip[];
    indicadores: Indicador[];
  };
  painel: {
    seloHero: string;
    heroTexto: string;
    /** Ex.: "Bem-vindo de volta, {nome}!" (padrão). {nome} = primeiro nome, destacado. */
    saudacao?: string;
    /** Botão opcional no hero (ex.: "Ver imóveis"). */
    cta?: { texto: string; rota: string; icone?: string };
    /** Faixa opcional de indicadores abaixo do hero. Valores com fonte "api" usam endpoint autenticado. */
    indicadores?: Indicador[];
    /** Rótulo do selo dos módulos ativos (padrão "Disponível"). */
    rotuloAtivo?: string;
  };
  modulos: Modulo[];
  recursos: { loginGoogle: boolean; modoEscuro: boolean; tokenSenhaMin: number; sso?: boolean };
}
