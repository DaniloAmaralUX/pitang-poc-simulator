# Pitang Labs · Portal de Ouvidoria & Atendimento Cidadão

Este documento especifica os requisitos de negócio e fluxos para a POC do Portal de Ouvidoria Institucional do Pitang Labs.

## Categoria: 01. Acesso & Autenticação
### Fluxo: Acesso Seguro & Identificação
- RN-01: Autenticação obrigatória com Gov.br (níveis Prata ou Ouro) ou SSO corporativo SAML 2.0 / OAuth2.
- RN-02: Garantia irrestrita de manifestação anônima com chave de acesso criptográfica de 16 caracteres para consulta posterior.
- RN-03: Bloqueio temporário de 15 minutos após 5 tentativas consecutivas inválidas de login.

## Categoria: 02. Entrada & Registro
### Fluxo: Nova Manifestação & Evidências
- RN-04: Classificação automatizada do tipo de demanda (Denúncia, Reclamação, Elogio, Sugestão) por modelo preditivo de IA.
- RN-05: Upload obrigatório de evidências nos formatos PDF, PNG, JPG, MP3 ou MP4 com limite total de até 15 MB por arquivo.
- RN-06: Termo de consentimento explícito e conformidade estrita com a Lei Geral de Proteção de Dados (LGPD).

## Categoria: 03. Triagem & Operação
### Fluxo: Mesa de Triagem & Fila Operacional
- RN-07: Priorização automática por criticidade de SLA (Crítico < 4 horas, Alto < 24 horas, Normal < 72 horas).
- RN-08: Sugestão assistida de minuta prévia de despacho por modelo de IA com validação e revisão humana obrigatória.
- RN-09: Registro indelével de histórico de despachos com trilha de auditoria e assinatura digital do analista.

## Categoria: 04. Acompanhamento & Protocolo
### Fluxo: Consulta Pública & Linha do Tempo
- RN-10: Consulta pública por número de protocolo único formatado no padrão PIT-2026-XXXXXX.
- RN-11: Linha do tempo visual com datas, despachos públicos homologados e download de certidão digital em PDF.
- RN-12: Canal seguro para envio de complementação de informações solicitadas pelo analista de atendimento.

## Categoria: 05. Gestão, Métricas & Governança
### Fluxo: Dashboard Executivo & Telemetria
- RN-13: Apresentação de indicadores de atendimento e taxa de resolutividade com números tabulares (tabular-nums).
- RN-14: Mapa de calor de demandas por diretoria responsável e detecção de tópicos recorrentes.
- RN-15: Exportação de relatórios gerenciais nos formatos CSV e PDF com assinatura digital de conformidade.
