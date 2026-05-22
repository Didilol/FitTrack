# FitTrack Local

App de registo de treinos, medidas corporais e progressão — **100% local**, sem servidores nem contas. Os teus dados ficam no telemóvel (SQLite) e só saem se exportares.

> **Estado:** v0.2.0 — **beta de testes**.
> Reporta bugs e sugestões: **diogenes.edc@gmail.com**

---

## Funcionalidades

- **Rotinas de treino** com séries-alvo, reps-alvo, alternativas e notas por exercício.
- **Treino ativo** com cronómetro global, sugestão de carga/reps com base na última sessão, temporizador de descanso flutuante (+15 / −15 / cancelar) e haptics.
- **Banner global "Treino em andamento"** visível em todas as tabs enquanto há sessão ativa — toca para retomar onde estavas.
- **Resolução por exercício**: cada exercício pode ser concluído (todas as séries com check) ou pulado. O botão *Finalizar* só liberta quando tudo está resolvido.
- **Séries só nesta sessão**: adiciona ou remove séries durante o treino sem alterar o template da rotina. Travas de segurança: mínimo 1 série, bloqueia remover série já com check.
- **Histórico** persistente com duração, séries por exercício e datas.
- **Progressão por exercício**: gráficos de carga máxima, reps máximas e volume ao longo do tempo.
- **Medidas corporais** (peso, cintura, quadril, braços, pernas) + galeria de fotos de progresso (frente, lado, costas) com comparador lado a lado.
- **Backup completo em JSON** (exportar / importar / partilhar). Os ficheiros físicos das fotos ficam no aparelho; o JSON guarda referências.
- **Importador de treino em texto** — colas a rotina escrita em texto livre e o parser tenta extrair exercícios, séries e reps.
- **Tema escuro** nativo, optimizado para Android (Samsung S25 FE testado).

## Stack

- **Expo SDK 54** com [expo-router](https://docs.expo.dev/router/introduction/) (file-based routing)
- **React Native 0.81 / React 19** (New Architecture habilitada)
- **TypeScript** estrito
- **NativeWind 4** (Tailwind CSS para React Native)
- **Zustand** para estado global (treino ativo, definições)
- **expo-sqlite** com migrações versionadas (esquema atual: v2)
- **react-native-draggable-flatlist** para reordenar rotinas
- **react-native-svg** para gráficos de progressão custom

## Setup

Requisitos: Node 20+, npm, conta Expo (opcional), Android Studio ou Xcode para builds nativos.

```bash
git clone https://github.com/Didilol/FitTrack.git
cd FitTrack
npm install
npm start                 # abre o Expo Dev Tools
npm run android           # corre em emulador / device Android
npm run ios               # corre em simulador / device iOS
npm run typecheck         # verifica tipos
```

### Build de produção (APK / IPA via EAS)

O projeto tem `eas.json` configurado.

```bash
npx eas build --profile preview --platform android   # APK instalável
npx eas build --profile production --platform android
```

## Estrutura

```
app/                        rotas (expo-router file-based)
  (tabs)/                   tab bar: Início, Rotinas, Histórico, Medidas, Definições
  rotina/[id].tsx           detalhe da rotina + iniciar/retomar treino
  treino/ativo.tsx          ecrã da sessão ativa
  historico/[id].tsx        detalhe de um treino passado
  exercicio/[id].tsx        progressão por exercício (gráficos)
  galeria/                  fotos de progresso + comparador
  medidas/nova.tsx          nova medida corporal

src/
  components/
    ui/                     Button, Card, Input — primitivos com NativeWind
    workout/                ExerciseBlock, SetRow, RestTimerFloating,
                            ActiveWorkoutBanner
    charts/                 LineChart em SVG puro
  database/
    schema.ts               DDL versionado
    database.ts             init + migrations
    repositories/           queries por domínio (rotinas, histórico, medidas, fotos, exercicios)
    seeds/rotinaPadrao.ts   rotina inicial criada na primeira corrida
  stores/                   activeWorkoutStore, settingsStore (Zustand)
  services/                 treino (montar exercícios ativos), parser (texto → rotina),
                            backup (JSON export/import), photos
  theme/                    tokens de cor + Tailwind config
  utils/format.ts           formatadores de data / duração / peso
  hooks/useInterval.ts      setInterval declarativo

assets/                     ícones e splash
app.json                    config Expo (incl. permissões Android)
tailwind.config.js          tokens NativeWind
```

## Modelo de dados

SQLite local, esquema versionado (`SCHEMA_VERSION` em [src/database/schema.ts](src/database/schema.ts)):

- `rotinas_treino` — templates de rotinas
- `exercicios` — biblioteca de exercícios (nome único, grupo, tipo: reps / tempo)
- `rotinas_exercicios` — junção rotina ↔ exercício com séries/reps-alvo
- `historico_treinos` — sessões concluídas (duração, data início/fim)
- `historico_series` — séries gravadas (`status` ∈ {`completed`, `skipped`})
- `medidas_corporais` — peso, cintura, quadril, braços, pernas
- `fotos_progresso` — URI local, ângulo, observações

Migrações são aplicadas em [src/database/database.ts](src/database/database.ts) (`applyMigrations`) com base em `_schema_version`.

## Backup

Em **Definições → Backup de dados**:

- **Exportar** — gera JSON com rotinas, exercícios, histórico, medidas e referências de fotos. Pode ser partilhado por qualquer app (Drive, e-mail, WhatsApp).
- **Importar** — substitui TUDO pelo conteúdo do JSON (destrutivo; pede confirmação).

As fotos físicas (ficheiros `.jpg`) **não** vão no JSON — só os caminhos. Se restaurares num device diferente, as referências apontam para ficheiros inexistentes.

## Roadmap / em aberto

- Histórico filtrável por rotina e período
- Notificações para fim de descanso (background)
- PWA / Web build
- Exportar histórico para CSV
- Suporte multi-utilizador no mesmo aparelho

## Feedback

Como esta é uma versão beta de testes, qualquer comportamento estranho ajuda muito:

- E-mail (botões dentro do app em **Definições → Sobre**):
  **diogenes.edc@gmail.com**
- Issues: https://github.com/Didilol/FitTrack/issues

## Licença

Projeto privado. Todos os direitos reservados.
