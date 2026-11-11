# Portal AGS · Bafômetro & Compliance Operacional

Especificação de requisitos para a POC do Portal de Controle e Aferição Operacional AGS (Bafômetro).

## Categoria: 01. Acesso & Identificação
### Fluxo: Check-in de Operador & Biometria
- RN-01: Validação biométrica facial do colaborador antes de liberar início do turno operacional.
- RN-02: Registro de localização geográfica e verificação de escala de trabalho e descanso regulamentar.

## Categoria: 02. Entrada & Aferição
### Fluxo: Teste do Bafômetro & Telemetria
- RN-03: Integração direta com etilômetro homologado via Bluetooth Low Energy (BLE) com criptografia ponta a ponta.
- RN-04: Bloqueio automático de acesso ao veículo ou máquina caso o índice de alcoolemia seja superior a 0,00 mg/L.

## Categoria: 03. Triagem & Supervisão
### Fluxo: Mesa de Alertas em Tempo Real
- RN-05: Disparo de notificação push imediata para o supervisor de segurança em caso de inconformidade detectada.
- RN-06: Agendamento obrigatório de contraprova em até 15 minutos acompanhada por testemunha presencial.

## Categoria: 04. Gestão & Governança
### Fluxo: Painel de Conformidade Operacional
- RN-07: Relatórios de assiduidade e testes realizados consolidados com números tabulares.
- RN-08: Exportação de dados para órgãos reguladores e arquivo auditável por 5 anos.
