---
title: "003 — Mettre à jour les milestones dans `backlog/config.yml`"
status: "To Do"
labels: ["backlog","config","process"]
assignee: ""
milestone: "Initialisation"
---

# Objectif
Ajouter et structurer les *milestones* initiales dans `Camus/backlog/config.yml` afin de pouvoir organiser le travail et classifier les tickets par étape de réalisation. Cette tâche prépare la base organisationnelle du backlog.

# Milestones proposées
- Spécifications du langage
- Syntaxe exploratoire
- Outils (kiss)
- Compilation & auto-hébergement
- Site & documentation
- Exemples & démonstrations
- Sécurité & certification
- Publication & registry
- Maintenance & opérations

> Remarque : noms en français pour cohérence avec la documentation actuelle. Si besoin, on peut ajouter des alias anglais plus tard.

# Pourquoi c'est important
- Les milestones rendent la planification visible et facilitent les revues.
- Elles servent de repères pour prioriser et regrouper les tickets.
- Le backlog devient immédiatement exploitable pour la première milestone : *Spécifications du langage*.

# Critères d'acceptation (DoD)
- [ ] `Camus/backlog/config.yml` contient la clé `milestones` et la liste ci‑dessus (ou une version validée).
- [ ] Un PR est ouvert qui met à jour `config.yml` et documente le rationale des noms choisis.
- [ ] Les tickets créés d'ores et déjà (000, 001, 002, ...) sont mis à jour pour utiliser la milestone appropriée.
- [ ] Au moins une tâche « placeholder » est créée pour chaque milestone (format minimal : titre + description courte + statut `To Do`).
- [ ] Vérification manuelle que l'outil Backlog (interface utilisée) affiche les nouvelles milestones et permet de filtrer/tri par milestone.
- [ ] Le ticket référence explicitement le ticket d'initialisation (`000 — Initialiser le backlog...`) comme parent/context.

# Tâches proposées (sous-tâches)
1. Modifier `Camus/backlog/config.yml` pour insérer la liste de milestones proposée.
2. Créer des tickets « placeholder » pour chaque milestone dans `Camus/backlog/tasks/` (fichiers `.md`) avec statut `To Do`.
3. Mettre à jour les tickets déjà existants (`000`, `001`, `002`) pour qu'ils portent la milestone correcte.
4. Ouvrir une PR décrivant la modification et demandant revue (inclure ici les raisons et le mapping des tickets).
5. Après merge : confirmer via l'interface Backlog que les milestones sont bien visibles et documenter un court guide (1–2 lignes) sur l'usage des milestones dans `60-design.md`.

# Notes / points de vigilance
- Backlog.md est minimaliste : pas d'epics → utiliser milestones et labels pour organiser.
- Garder les noms courts et compréhensibles ; éviter la duplication fonctionnelle entre milestones et labels.
- Si le format ou la clé `milestones` du fichier `config.yml` diffère (par exemple format localisé), ajuster le commit en conséquence et documenter le format exact.
- Ne pas lancer d'implémentations techniques avant que les tickets correspondants soient créés et assignés (rappel de la règle "ticket avant code").

# Estimation & priorité
- Estimation : XS (mise à jour config + création placeholders).
- Priorité : Haute (structure du backlog et traçabilité).

# Références
- Ticket parent : `000 — Initialiser le backlog et définir les milestones`
- Ticket vocabulaire / design : `001`, `002`
- Doc : `Camus/conversation.md` (sections "Backlog" / "Milestones")