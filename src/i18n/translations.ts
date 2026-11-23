import { LocaleCode, TemplateId } from '../types/workflow';

export interface SampleScenario {
  title: string;
  companyOrClient: string;
  sourceContext: string;
  rawInput: string;
}

export interface TranslationBundle {
  brandName: string;
  common: {
    loading: string;
    save: string;
    saving: string;
    saved: string;
    cancel: string;
    delete: string;
    copy: string;
    copied: string;
    close: string;
    retry: string;
    search: string;
    all: string;
    completed: string;
    failed: string;
    signOut: string;
    language: string;
    msUnit: string;
    attemptsUnit: string;
  };
  auth: {
    headline: string;
    subheadline: string;
    googleButton: string;
    orDivider: string;
    signInTab: string;
    signUpTab: string;
    emailLabel: string;
    passwordLabel: string;
    displayNameLabel: string;
    signInSubmit: string;
    signUpSubmit: string;
    emailProviderHintTitle: string;
    emailProviderHintBody: string;
    verifyTitle: string;
    verifyBody: string;
    verifyResend: string;
    verifyCheckAgain: string;
    verifySentNotice: string;
    featureBullet1: string;
    featureBullet2: string;
    featureBullet3: string;
  };
  nav: {
    workspace: string;
    history: string;
    settings: string;
    adminDrawer: string;
    deploymentGuide: string;
    workspaceLabel: string;
  };
  workspace: {
    breadcrumb: string;
    pageTitle: string;
    pageSubtitle: string;
    selectTemplate: string;
    loadSample: string;
    clearForm: string;
    titleLabel: string;
    titlePlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    contextLabel: string;
    contextPlaceholder: string;
    payloadLabel: string;
    payloadPlaceholder: string;
    runButton: string;
    runningButton: string;
    runningNotice: string;
    outputHeader: string;
    emptyOutputTitle: string;
    emptyOutputBody: string;
    classification: string;
    priority: string;
    confidence: string;
    estimatedValue: string;
    summary: string;
    riskFlags: string;
    noRiskFlags: string;
    recommendedActions: string;
    rawJsonToggle: string;
    structuredViewToggle: string;
    executionSaved: string;
    executionFallbackWarning: string;
  };
  templates: Record<
    TemplateId,
    {
      name: string;
      shortLabel: string;
      description: string;
      sample: SampleScenario;
    }
  >;
  history: {
    breadcrumb: string;
    pageTitle: string;
    pageSubtitle: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    colWorkflow: string;
    colTemplate: string;
    colClassification: string;
    colStatus: string;
    colLatency: string;
    colTimestamp: string;
    inspectTitle: string;
    inputSnapshot: string;
    outputSnapshot: string;
    deleteConfirm: string;
  };
  settings: {
    breadcrumb: string;
    pageTitle: string;
    pageSubtitle: string;
    workspaceNameLabel: string;
    agentNameLabel: string;
    defaultTemplateLabel: string;
    accentColorLabel: string;
    accentColorHint: string;
    systemInstructionLabel: string;
    systemInstructionHint: string;
    businessRulesLabel: string;
    businessRulesHint: string;
    saveButton: string;
    resetDefaults: string;
    saveSuccess: string;
  };
  adminDrawer: {
    title: string;
    subtitle: string;
    totalRuns: string;
    successRate: string;
    avgLatency: string;
    openErrors: string;
    errorLogsHeading: string;
    emptyErrorsTitle: string;
    emptyErrorsBody: string;
    markResolved: string;
    resolvedLabel: string;
    unresolvedLabel: string;
    loadIntoWorkspace: string;
  };
  deployGuide: {
    title: string;
    subtitle: string;
    tabMainPy: string;
    tabRequirements: string;
    tabCloudRun: string;
    copySnippet: string;
  };
}

export const TRANSLATIONS: Record<LocaleCode, TranslationBundle> = {
  en: {
    brandName: 'PulseFlow AI',
    common: {
      loading: 'Loading...',
      save: 'Save Changes',
      saving: 'Saving...',
      saved: 'Saved',
      cancel: 'Cancel',
      delete: 'Delete',
      copy: 'Copy',
      copied: 'Copied',
      close: 'Close',
      retry: 'Retry',
      search: 'Search',
      all: 'All',
      completed: 'Completed',
      failed: 'Failed',
      signOut: 'Sign Out',
      language: 'Language',
      msUnit: 'ms',
      attemptsUnit: 'attempts',
    },
    auth: {
      headline: 'Automate B2B workflows with structured Gemini intelligence',
      subheadline:
        'Isolated multi-tenant workspaces, enforced JSON schemas, live Firestore audit trails, and resilient retry pipelines.',
      googleButton: 'Continue with Google',
      orDivider: 'or use email credentials',
      signInTab: 'Sign In',
      signUpTab: 'Create Account',
      emailLabel: 'Work Email',
      passwordLabel: 'Password',
      displayNameLabel: 'Full Name',
      signInSubmit: 'Sign In to Workspace',
      signUpSubmit: 'Create Workspace Account',
      emailProviderHintTitle: 'Email/Password Provider Notice',
      emailProviderHintBody:
        'Google Sign-In works immediately. To use Email/Password accounts, enable the Email/Password sign-in method inside your Firebase Console under Authentication > Sign-in method.',
      verifyTitle: 'Verify your email address',
      verifyBody:
        'A verification link was sent to your inbox. Workspace security rules require a verified email before writing Firestore records.',
      verifyResend: 'Resend Verification Email',
      verifyCheckAgain: 'I Verified My Email',
      verifySentNotice: 'Verification email sent. Check your inbox and click I Verified My Email.',
      featureBullet1: 'Strict JSON schema enforcement powered by Gemini 2.5 Flash',
      featureBullet2: 'Multi-tenant Firestore isolation with real-time execution audit',
      featureBullet3: 'Exponential backoff retries and dead-letter error tracking',
    },
    nav: {
      workspace: 'AI Workspace',
      history: 'Execution History',
      settings: 'Agent Settings',
      adminDrawer: 'Error Logs & Metrics',
      deploymentGuide: 'Python & Cloud Guide',
      workspaceLabel: 'Workspace',
    },
    workspace: {
      breadcrumb: 'Console / AI Workspace',
      pageTitle: 'Execute Automation Workflow',
      pageSubtitle:
        'Submit unstructured B2B data to generate validated classifications, action plans, and commercial estimates.',
      selectTemplate: 'Workflow Template',
      loadSample: 'Load Sample Scenario',
      clearForm: 'Clear',
      titleLabel: 'Submission Title',
      titlePlaceholder: 'e.g., Enterprise ERP Expansion Inquiry — North America',
      companyLabel: 'Client / Organization',
      companyPlaceholder: 'e.g., Meridian Logistics Corp.',
      contextLabel: 'Source / Channel Context',
      contextPlaceholder: 'e.g., Inbound Web Form · Enterprise Tier',
      payloadLabel: 'Unstructured Business Data / Inquiry',
      payloadPlaceholder:
        'Paste lead email, customer escalation thread, or contract terms for structured Gemini analysis...',
      runButton: 'Run AI Workflow',
      runningButton: 'Executing Workflow...',
      runningNotice: 'Invoking Gemini schema pipeline with automated retry protection...',
      outputHeader: 'Structured AI Output',
      emptyOutputTitle: 'No execution selected yet',
      emptyOutputBody:
        'Select a workflow template and submit business data—or load a sample scenario—to generate an auditable JSON response.',
      classification: 'Classification',
      priority: 'Priority',
      confidence: 'Confidence',
      estimatedValue: 'Estimated Value / SLA',
      summary: 'Executive Summary',
      riskFlags: 'Risk Flags & Missing Context',
      noRiskFlags: 'No blocking risk flags detected.',
      recommendedActions: 'Recommended Action Plan',
      rawJsonToggle: 'Raw JSON',
      structuredViewToggle: 'Structured View',
      executionSaved: 'Workflow run persisted to Firestore',
      executionFallbackWarning: 'Execution failed after retries and was logged to dead-letter error_logs.',
    },
    templates: {
      lead_qualification: {
        name: 'Lead Qualification & Quote',
        shortLabel: 'Lead Qualification',
        description: 'Scores B2B deal fit, estimates commercial quote range, and drafts sales next steps.',
        sample: {
          title: 'Global Supply Chain Automation RFQ — 450 Seats',
          companyOrClient: 'Meridian Logistics Group',
          sourceContext: 'Inbound Enterprise Form · Annual Budget Approved',
          rawInput:
            'Hi team, we are evaluating an AI workflow orchestration platform across 12 regional distribution hubs (450 operations managers). Currently spending 600+ hrs/month manually triaging carrier disputes and customs exceptions. Target go-live is Q1 next year with an approved IT automation budget of $120k–$180k annually. Need SOC2 Type II documentation, SSO, and Portuguese/Spanish team localization.',
        },
      },
      support_triage: {
        name: 'Support Triage & Action Plan',
        shortLabel: 'Support Triage',
        description: 'Classifies customer escalations, assigns SLA priority, and builds remediation steps.',
        sample: {
          title: 'Webhook Timeout Spike on EU-West Billing Sync',
          companyOrClient: 'Vantage FinTech Systems',
          sourceContext: 'Zendesk Priority Escalation · Enterprise Plan ($96k ARR)',
          rawInput:
            'Our automated invoice reconciliation webhook started returning HTTP 504 timeouts for ~18% of batch payloads since 06:30 UTC today. Finance close is in 14 hours and 420 European merchant settlements are queued. We already rotated our signing secret and confirmed outbound firewall rules did not change.',
        },
      },
      contract_analysis: {
        name: 'Contract & Intake Analysis',
        shortLabel: 'Contract Analysis',
        description: 'Extracts commercial obligations, renewal/liability risks, and procurement actions.',
        sample: {
          title: 'Master Services Agreement Redlines — Cloud Telemetry',
          companyOrClient: 'Aether Industrial Robotics',
          sourceContext: 'Procurement Portal · 36-Month Term',
          rawInput:
            'Vendor proposes a 36-month fixed commitment at $8,400/month with automatic 12-month renewal unless written notice is delivered 90 days prior. Section 9.2 caps vendor liability at 3 months of fees while requiring uncapped customer indemnification for third-party telemetry datasets. Data residency is specified as US-only without EU SCC addendum.',
        },
      },
    },
    history: {
      breadcrumb: 'Console / Execution History',
      pageTitle: 'Workflow Execution History',
      pageSubtitle: 'Live Firestore audit log synced in real time for your isolated workspace.',
      searchPlaceholder: 'Filter by title, client, or classification...',
      emptyTitle: 'No workflow executions recorded',
      emptyBody: 'Once you run a workflow in the AI Workspace, full inputs, structured outputs, and latency metrics will stream here.',
      emptyCta: 'Go to AI Workspace',
      colWorkflow: 'Submission',
      colTemplate: 'Template',
      colClassification: 'Classification',
      colStatus: 'Status',
      colLatency: 'Latency',
      colTimestamp: 'Executed',
      inspectTitle: 'Execution Audit Detail',
      inputSnapshot: 'Input Payload',
      outputSnapshot: 'AI JSON Output',
      deleteConfirm: 'Remove this execution record from history?',
    },
    settings: {
      breadcrumb: 'Console / Agent Settings',
      pageTitle: 'White-Label & Agent Settings',
      pageSubtitle: 'Customize your workspace brand accent, system instructions, and operational business rules.',
      workspaceNameLabel: 'Workspace Name',
      agentNameLabel: 'AI Agent Display Name',
      defaultTemplateLabel: 'Default Workflow Template',
      accentColorLabel: 'Brand Accent Color',
      accentColorHint: 'Applied live across primary actions, active states, and focus rings.',
      systemInstructionLabel: 'AI System Instruction',
      systemInstructionHint: 'Defines the persona, analytical rigor, and tone enforced on every Gemini execution.',
      businessRulesLabel: 'Workspace Business Rules',
      businessRulesHint: 'Pricing thresholds, SLA tiers, or legal guardrails injected into every prompt.',
      saveButton: 'Save Workspace Configuration',
      resetDefaults: 'Restore Recommended Rules',
      saveSuccess: 'Workspace configuration updated in Firestore.',
    },
    adminDrawer: {
      title: 'Admin Metrics & Error Logs',
      subtitle: 'Live operational telemetry and dead-letter failures captured by the retry pipeline.',
      totalRuns: 'Total Runs',
      successRate: 'Success Rate',
      avgLatency: 'Avg Latency',
      openErrors: 'Open Errors',
      errorLogsHeading: 'Dead-Letter Error Queue',
      emptyErrorsTitle: 'Zero dead-letter errors',
      emptyErrorsBody: 'All workflow runs completed cleanly or existing failures have been resolved.',
      markResolved: 'Mark Resolved',
      resolvedLabel: 'Resolved',
      unresolvedLabel: 'Open',
      loadIntoWorkspace: 'Load Payload',
    },
    deployGuide: {
      title: 'Python FastAPI & Cloud Deployment',
      subtitle: 'Exportable FastAPI webhook codebase and production Cloud Run / Vercel commands.',
      tabMainPy: 'backend/main.py',
      tabRequirements: 'requirements.txt',
      tabCloudRun: 'Cloud Run & Vercel',
      copySnippet: 'Copy Snippet',
    },
  },
  pt: {
    brandName: 'PulseFlow AI',
    common: {
      loading: 'Carregando...',
      save: 'Salvar Alterações',
      saving: 'Salvando...',
      saved: 'Salvo',
      cancel: 'Cancelar',
      delete: 'Excluir',
      copy: 'Copiar',
      copied: 'Copiado',
      close: 'Fechar',
      retry: 'Tentar novamente',
      search: 'Buscar',
      all: 'Todos',
      completed: 'Concluído',
      failed: 'Falhou',
      signOut: 'Sair',
      language: 'Idioma',
      msUnit: 'ms',
      attemptsUnit: 'tentativas',
    },
    auth: {
      headline: 'Automatize fluxos B2B com inteligência estruturada Gemini',
      subheadline:
        'Workspaces multi-tenant isolados, schemas JSON obrigatórios, auditoria em tempo real no Firestore e retentativas resilientes.',
      googleButton: 'Continuar com Google',
      orDivider: 'ou entre com e-mail e senha',
      signInTab: 'Entrar',
      signUpTab: 'Criar Conta',
      emailLabel: 'E-mail Corporativo',
      passwordLabel: 'Senha',
      displayNameLabel: 'Nome Completo',
      signInSubmit: 'Entrar no Workspace',
      signUpSubmit: 'Criar Conta do Workspace',
      emailProviderHintTitle: 'Aviso sobre Provedor E-mail/Senha',
      emailProviderHintBody:
        'O login com Google funciona imediatamente. Para contas com E-mail/Senha, ative o provedor E-mail/Senha no Console do Firebase em Authentication > Sign-in method.',
      verifyTitle: 'Verifique seu endereço de e-mail',
      verifyBody:
        'Um link de verificação foi enviado para sua caixa de entrada. As regras do Firestore exigem um e-mail verificado antes de gravar registros.',
      verifyResend: 'Reenviar E-mail de Verificação',
      verifyCheckAgain: 'Já Verifiquei Meu E-mail',
      verifySentNotice: 'E-mail enviado. Confira sua caixa de entrada e clique em Já Verifiquei Meu E-mail.',
      featureBullet1: 'Schema JSON rigoroso com Gemini 2.5 Flash',
      featureBullet2: 'Isolamento multi-tenant no Firestore com histórico ao vivo',
      featureBullet3: 'Backoff exponencial e registro dead-letter de erros',
    },
    nav: {
      workspace: 'Workspace IA',
      history: 'Histórico de Execuções',
      settings: 'Configurações do Agente',
      adminDrawer: 'Logs de Erro e Métricas',
      deploymentGuide: 'Guia Python e Cloud',
      workspaceLabel: 'Workspace',
    },
    workspace: {
      breadcrumb: 'Console / Workspace IA',
      pageTitle: 'Executar Fluxo de Automação',
      pageSubtitle:
        'Envie dados B2B não estruturados para gerar classificações validadas, planos de ação e estimativas comerciais.',
      selectTemplate: 'Template de Fluxo',
      loadSample: 'Carregar Exemplo',
      clearForm: 'Limpar',
      titleLabel: 'Título da Solicitação',
      titlePlaceholder: 'ex.: Cotação ERP Enterprise — América Latina',
      companyLabel: 'Cliente / Organização',
      companyPlaceholder: 'ex.: Logística Atlântico S.A.',
      contextLabel: 'Contexto / Origem',
      contextPlaceholder: 'ex.: Formulário Web · Plano Enterprise',
      payloadLabel: 'Dados de Negócio / Solicitação Não Estruturada',
      payloadPlaceholder:
        'Cole o e-mail do lead, chamado de suporte ou cláusulas contratuais para análise estruturada...',
      runButton: 'Executar Fluxo IA',
      runningButton: 'Executando Fluxo...',
      runningNotice: 'Acionando pipeline Gemini com proteção automática de retentativas...',
      outputHeader: 'Saída Estruturada da IA',
      emptyOutputTitle: 'Nenhuma execução selecionada',
      emptyOutputBody:
        'Escolha um template e envie dados de negócio — ou carregue um exemplo — para gerar uma resposta JSON auditável.',
      classification: 'Classificação',
      priority: 'Prioridade',
      confidence: 'Confiança',
      estimatedValue: 'Valor Estimado / SLA',
      summary: 'Resumo Executivo',
      riskFlags: 'Alertas de Risco e Lacunas',
      noRiskFlags: 'Nenhum risco bloqueante identificado.',
      recommendedActions: 'Plano de Ação Recomendado',
      rawJsonToggle: 'JSON Bruto',
      structuredViewToggle: 'Visão Estruturada',
      executionSaved: 'Execução gravada no Firestore',
      executionFallbackWarning: 'A execução falhou após retentativas e foi registrada em error_logs.',
    },
    templates: {
      lead_qualification: {
        name: 'Qualificação de Lead e Cotação',
        shortLabel: 'Qualificação de Lead',
        description: 'Avalia aderência B2B, estima faixa de orçamento e define próximos passos comerciais.',
        sample: {
          title: 'RFQ Automação Logística Global — 450 Usuários',
          companyOrClient: 'Grupo Logístico Meridiano',
          sourceContext: 'Formulário Enterprise · Orçamento Anual Aprovado',
          rawInput:
            'Olá equipe, estamos avaliando uma plataforma de orquestração com IA para 12 centros de distribuição (450 gestores). Hoje gastamos mais de 600h/mês tratando disputas de frete manualmente. Previsão de entrada em produção no 1º trimestre com orçamento anual aprovado entre US$ 120 mil e US$ 180 mil. Precisamos de SOC2 Type II, SSO e interface em português e espanhol.',
        },
      },
      support_triage: {
        name: 'Triagem de Suporte e Ação',
        shortLabel: 'Triagem de Suporte',
        description: 'Classifica escalonamentos, define SLA e recomenda etapas técnicas de mitigação.',
        sample: {
          title: 'Pico de Timeouts 504 na Sincronização de Faturamento',
          companyOrClient: 'Vantage FinTech Brasil',
          sourceContext: 'Escalonamento Prioritário · Plano Enterprise',
          rawInput:
            'Nosso webhook de conciliação de faturas passou a retornar HTTP 504 em 18% dos lotes desde 06:30 UTC. O fechamento financeiro ocorre em 14 horas e há 420 liquidações em fila. Já rotacionamos a chave de assinatura e confirmamos que não houve mudança de firewall.',
        },
      },
      contract_analysis: {
        name: 'Análise Contratual e Riscos',
        shortLabel: 'Análise Contratual',
        description: 'Extrai obrigações comerciais, riscos de renovação/responsabilidade e ações jurídicas.',
        sample: {
          title: 'Revisão de Contrato MSA — Telemetria Industrial',
          companyOrClient: 'Aether Robótica Industrial',
          sourceContext: 'Portal de Compras · Vigência 36 Meses',
          rawInput:
            'O fornecedor propõe compromisso fixo de 36 meses a US$ 8.400/mês com renovação automática de 12 meses salvo aviso prévio de 90 dias. A cláusula 9.2 limita responsabilidade do fornecedor a 3 mensalidades, mas exige indenização ilimitada do cliente sobre dados de terceiros.',
        },
      },
    },
    history: {
      breadcrumb: 'Console / Histórico',
      pageTitle: 'Histórico de Execuções',
      pageSubtitle: 'Auditoria ao vivo sincronizada do Firestore para o seu workspace isolado.',
      searchPlaceholder: 'Filtrar por título, cliente ou classificação...',
      emptyTitle: 'Nenhuma execução registrada',
      emptyBody: 'Ao executar um fluxo no Workspace IA, entradas, saídas JSON e latência aparecerão aqui em tempo real.',
      emptyCta: 'Ir para Workspace IA',
      colWorkflow: 'Solicitação',
      colTemplate: 'Template',
      colClassification: 'Classificação',
      colStatus: 'Status',
      colLatency: 'Latência',
      colTimestamp: 'Executado em',
      inspectTitle: 'Detalhes da Auditoria',
      inputSnapshot: 'Payload de Entrada',
      outputSnapshot: 'Saída JSON da IA',
      deleteConfirm: 'Remover este registro do histórico?',
    },
    settings: {
      breadcrumb: 'Console / Configurações',
      pageTitle: 'White-Label e Configurações do Agente',
      pageSubtitle: 'Personalize a cor de destaque do workspace, instruções de sistema e regras de negócio.',
      workspaceNameLabel: 'Nome do Workspace',
      agentNameLabel: 'Nome de Exibição do Agente IA',
      defaultTemplateLabel: 'Template Padrão',
      accentColorLabel: 'Cor de Destaque da Marca',
      accentColorHint: 'Aplicada em tempo real aos botões principais e estados ativos.',
      systemInstructionLabel: 'Instrução de Sistema da IA',
      systemInstructionHint: 'Define a persona, rigor analítico e formato aplicado em cada execução Gemini.',
      businessRulesLabel: 'Regras de Negócio do Workspace',
      businessRulesHint: 'Faixas de preço, metas de SLA ou diretrizes jurídicas injetadas em cada prompt.',
      saveButton: 'Salvar Configuração',
      resetDefaults: 'Restaurar Regras Padrão',
      saveSuccess: 'Configuração do workspace atualizada no Firestore.',
    },
    adminDrawer: {
      title: 'Métricas Admin e Logs de Erro',
      subtitle: 'Telemetria operacional ao vivo e falhas dead-letter capturadas pelo motor de retentativas.',
      totalRuns: 'Total de Execuções',
      successRate: 'Taxa de Sucesso',
      avgLatency: 'Latência Média',
      openErrors: 'Erros Abertos',
      errorLogsHeading: 'Fila de Erros Dead-Letter',
      emptyErrorsTitle: 'Nenhum erro pendente',
      emptyErrorsBody: 'Todas as execuções foram concluídas ou os alertas anteriores já foram resolvidos.',
      markResolved: 'Marcar Resolvido',
      resolvedLabel: 'Resolvido',
      unresolvedLabel: 'Aberto',
      loadIntoWorkspace: 'Carregar Dados',
    },
    deployGuide: {
      title: 'Python FastAPI e Deploy em Nuvem',
      subtitle: 'Código FastAPI exportável e comandos de deploy para Cloud Run e Vercel.',
      tabMainPy: 'backend/main.py',
      tabRequirements: 'requirements.txt',
      tabCloudRun: 'Cloud Run e Vercel',
      copySnippet: 'Copiar Código',
    },
  },
  es: {
    brandName: 'PulseFlow AI',
    common: {
      loading: 'Cargando...',
      save: 'Guardar Cambios',
      saving: 'Guardando...',
      saved: 'Guardado',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      copy: 'Copiar',
      copied: 'Copiado',
      close: 'Cerrar',
      retry: 'Reintentar',
      search: 'Buscar',
      all: 'Todos',
      completed: 'Completado',
      failed: 'Fallido',
      signOut: 'Cerrar Sesión',
      language: 'Idioma',
      msUnit: 'ms',
      attemptsUnit: 'intentos',
    },
    auth: {
      headline: 'Automatiza flujos B2B con inteligencia estructurada Gemini',
      subheadline:
        'Workspaces multi-tenant aislados, esquemas JSON estrictos, auditoría en tiempo real en Firestore y reintentos resilientes.',
      googleButton: 'Continuar con Google',
      orDivider: 'o accede con correo y contraseña',
      signInTab: 'Iniciar Sesión',
      signUpTab: 'Crear Cuenta',
      emailLabel: 'Correo Corporativo',
      passwordLabel: 'Contraseña',
      displayNameLabel: 'Nombre Completo',
      signInSubmit: 'Entrar al Workspace',
      signUpSubmit: 'Crear Cuenta del Workspace',
      emailProviderHintTitle: 'Aviso del Proveedor Correo/Contraseña',
      emailProviderHintBody:
        'El acceso con Google funciona de inmediato. Para cuentas de Correo/Contraseña, habilita el proveedor en Firebase Console > Authentication > Sign-in method.',
      verifyTitle: 'Verifica tu dirección de correo',
      verifyBody:
        'Se envió un enlace de verificación a tu bandeja. Las reglas de Firestore requieren correo verificado antes de guardar registros.',
      verifyResend: 'Reenviar Correo de Verificación',
      verifyCheckAgain: 'Ya Verifiqué Mi Correo',
      verifySentNotice: 'Correo enviado. Revisa tu bandeja y pulsa Ya Verifiqué Mi Correo.',
      featureBullet1: 'Validación estricta de esquema JSON con Gemini 2.5 Flash',
      featureBullet2: 'Aislamiento multi-tenant en Firestore con historial en vivo',
      featureBullet3: 'Backoff exponencial y registro dead-letter de errores',
    },
    nav: {
      workspace: 'Workspace IA',
      history: 'Historial de Ejecuciones',
      settings: 'Ajustes del Agente',
      adminDrawer: 'Logs de Error y Métricas',
      deploymentGuide: 'Guía Python y Cloud',
      workspaceLabel: 'Workspace',
    },
    workspace: {
      breadcrumb: 'Consola / Workspace IA',
      pageTitle: 'Ejecutar Flujo de Automatización',
      pageSubtitle:
        'Envía datos B2B no estructurados para generar clasificaciones validadas, planes de acción y estimaciones comerciales.',
      selectTemplate: 'Plantilla de Flujo',
      loadSample: 'Cargar Ejemplo',
      clearForm: 'Limpiar',
      titleLabel: 'Título de la Solicitud',
      titlePlaceholder: 'ej., Cotización ERP Enterprise — Latinoamérica',
      companyLabel: 'Cliente / Organización',
      companyPlaceholder: 'ej., Meridian Logística Corp.',
      contextLabel: 'Contexto / Origen',
      contextPlaceholder: 'ej., Formulario Web · Nivel Enterprise',
      payloadLabel: 'Datos de Negocio / Consulta No Estructurada',
      payloadPlaceholder:
        'Pega el correo del lead, ticket de soporte o cláusulas de contrato para su análisis estructurado...',
      runButton: 'Ejecutar Flujo IA',
      runningButton: 'Ejecutando Flujo...',
      runningNotice: 'Invocando canal Gemini con protección automática de reintentos...',
      outputHeader: 'Salida Estructurada de IA',
      emptyOutputTitle: 'Aún no hay ejecución seleccionada',
      emptyOutputBody:
        'Selecciona una plantilla y envía datos comerciales —o carga un ejemplo— para generar una respuesta JSON auditable.',
      classification: 'Clasificación',
      priority: 'Prioridad',
      confidence: 'Confianza',
      estimatedValue: 'Valor Estimado / SLA',
      summary: 'Resumen Ejecutivo',
      riskFlags: 'Riesgos y Contexto Faltante',
      noRiskFlags: 'No se detectaron riesgos bloqueantes.',
      recommendedActions: 'Plan de Acción Recomendado',
      rawJsonToggle: 'JSON Sin Formato',
      structuredViewToggle: 'Vista Estructurada',
      executionSaved: 'Ejecución guardada en Firestore',
      executionFallbackWarning: 'La ejecución falló tras reintentos y se registró en error_logs.',
    },
    templates: {
      lead_qualification: {
        name: 'Calificación de Lead y Cotización',
        shortLabel: 'Calificación de Lead',
        description: 'Evalúa encaje B2B, estima rango de presupuesto y define próximos pasos de venta.',
        sample: {
          title: 'RFQ Automatización Cadena de Suministro — 450 Usuarios',
          companyOrClient: 'Meridian Logistics Group',
          sourceContext: 'Formulario Enterprise · Presupuesto Anual Aprobado',
          rawInput:
            'Hola equipo, evaluamos una plataforma de orquestación con IA para 12 centros de distribución (450 responsables). Actualmente invertimos más de 600 h/mes gestionando incidencias manualmente. Objetivo de salida Q1 con presupuesto anual aprobado de $120k–$180k. Requerimos SOC2 Type II, SSO y localización en español y portugués.',
        },
      },
      support_triage: {
        name: 'Triaje de Soporte y Acción',
        shortLabel: 'Triaje de Soporte',
        description: 'Clasifica escalamientos, asigna prioridad SLA y propone pasos técnicos de solución.',
        sample: {
          title: 'Pico de Timeouts 504 en Sincronización de Facturación',
          companyOrClient: 'Vantage FinTech Systems',
          sourceContext: 'Escalamiento Prioritario · Plan Enterprise',
          rawInput:
            'Nuestro webhook de conciliación comenzó a devolver HTTP 504 en el 18% de los lotes desde las 06:30 UTC. El cierre financiero es en 14 horas y hay 420 liquidaciones en cola. Ya rotamos la clave de firma y confirmamos que el firewall no cambió.',
        },
      },
      contract_analysis: {
        name: 'Análisis Contractual y Riesgos',
        shortLabel: 'Análisis Contractual',
        description: 'Extrae obligaciones comerciales, riesgos de renovación/responsabilidad y acciones legales.',
        sample: {
          title: 'Revisión de Contrato MSA — Telemetría Industrial',
          companyOrClient: 'Aether Robótica Industrial',
          sourceContext: 'Portal de Compras · Plazo 36 Meses',
          rawInput:
            'El proveedor propone un compromiso fijo de 36 meses a $8,400/mes con renovación automática de 12 meses salvo aviso con 90 días de antelación. La sección 9.2 limita su responsabilidad a 3 meses de cuotas exigiendo indemnización ilimitada del cliente.',
        },
      },
    },
    history: {
      breadcrumb: 'Consola / Historial',
      pageTitle: 'Historial de Ejecuciones',
      pageSubtitle: 'Registro de auditoría en vivo sincronizado desde Firestore para tu workspace aislado.',
      searchPlaceholder: 'Filtrar por título, cliente o clasificación...',
      emptyTitle: 'No hay ejecuciones registradas',
      emptyBody: 'Al ejecutar un flujo en el Workspace IA, las entradas, salidas JSON y latencia aparecerán aquí en tiempo real.',
      emptyCta: 'Ir al Workspace IA',
      colWorkflow: 'Solicitud',
      colTemplate: 'Plantilla',
      colClassification: 'Clasificación',
      colStatus: 'Estado',
      colLatency: 'Latencia',
      colTimestamp: 'Ejecutado',
      inspectTitle: 'Detalle de Auditoría',
      inputSnapshot: 'Payload de Entrada',
      outputSnapshot: 'Salida JSON de IA',
      deleteConfirm: '¿Eliminar este registro del historial?',
    },
    settings: {
      breadcrumb: 'Consola / Ajustes',
      pageTitle: 'White-Label y Ajustes del Agente',
      pageSubtitle: 'Personaliza el color de marca del workspace, instrucciones del sistema y reglas de negocio.',
      workspaceNameLabel: 'Nombre del Workspace',
      agentNameLabel: 'Nombre del Agente IA',
      defaultTemplateLabel: 'Plantilla Predeterminada',
      accentColorLabel: 'Color de Acento de Marca',
      accentColorHint: 'Aplicado en vivo a botones principales y estados activos.',
      systemInstructionLabel: 'Instrucción de Sistema de IA',
      systemInstructionHint: 'Define la personalidad, rigor analítico y formato aplicado en cada ejecución Gemini.',
      businessRulesLabel: 'Reglas de Negocio del Workspace',
      businessRulesHint: 'Umbrales de precios, niveles SLA o directrices legales inyectadas en cada prompt.',
      saveButton: 'Guardar Configuración',
      resetDefaults: 'Restaurar Reglas Base',
      saveSuccess: 'Configuración del workspace actualizada en Firestore.',
    },
    adminDrawer: {
      title: 'Métricas Admin y Logs de Error',
      subtitle: 'Telemetría operativa en vivo y fallos dead-letter capturados por el motor de reintentos.',
      totalRuns: 'Ejecuciones Totales',
      successRate: 'Tasa de Éxito',
      avgLatency: 'Latencia Media',
      openErrors: 'Errores Abiertos',
      errorLogsHeading: 'Cola de Errores Dead-Letter',
      emptyErrorsTitle: 'Cero errores pendientes',
      emptyErrorsBody: 'Todos los flujos finalizaron correctamente o los fallos anteriores ya fueron resueltos.',
      markResolved: 'Marcar Resuelto',
      resolvedLabel: 'Resuelto',
      unresolvedLabel: 'Abierto',
      loadIntoWorkspace: 'Cargar Datos',
    },
    deployGuide: {
      title: 'Python FastAPI y Despliegue Cloud',
      subtitle: 'Código FastAPI exportable y comandos de despliegue para Cloud Run y Vercel.',
      tabMainPy: 'backend/main.py',
      tabRequirements: 'requirements.txt',
      tabCloudRun: 'Cloud Run y Vercel',
      copySnippet: 'Copiar Código',
    },
  },
};
