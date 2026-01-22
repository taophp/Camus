# Backlog (Backlog.md) — intégration & corrections

Ce répertoire contient les tickets Backlog.md pour le projet Camus. J'ai corrigé l'intégration pour que l'outil `backlog` reconnaisse et affiche correctement les tickets. Ci‑dessous : ce qui a été fait, où trouver les fichiers, et comment vérifier / créer / dépanner.

## Ce que j'ai fait
- Création / renommage des tickets en respectant la convention Backlog.md :
  - fichiers dans `backlog/tasks/` nommés `task-<id> - <titre>.md` (ex. `task-1 - Initialize the backlog and define milestones.md`).
  - 14 tâches initiales créées : `task-1` → `task-14`.
- Archivage des anciennes tâches numérotées (`000-...`) dans `backlog/archive/tasks/` pour garder l'historique sans gêner l'indexation.
- Mise à jour de `backlog/config.yml` pour y ajouter la liste initiale de `milestones` (ex. `Language specifications`, `Tools (kiss)`, ...).
- Ajout de champs `parent` dans le front matter de certaines tâches pour exprimer la hiérarchie (sous‑tâches).

## Où sont les fichiers
- Tâches actives : `backlog/tasks/`
- Anciennes tâches (archivées) : `backlog/archive/tasks/`
- Configuration Backlog : `backlog/config.yml`

## Vérifier localement (commandes utiles)
- Installer l'outil (si nécessaire) :
```/dev/null/install.md#L1-1
npm i -g backlog.md
```

- Lister les tâches :
```/dev/null/backlog-commands.md#L1-1
backlog task list
```

- Voir une tâche en détail (ex. id 1) :
```/dev/null/backlog-commands.md#L2-2
backlog task 1
```

- Voir le tableau Kanban TUI :
```/dev/null/backlog-commands.md#L3-3
backlog board
```

- Lancer l'interface web (port par défaut 6420) :
```/dev/null/backlog-commands.md#L4-4
backlog browser
```

- Réinitialiser / configurer le projet Backlog si besoin :
```/dev/null/backlog-init.md#L1-2
backlog init
backlog config
```

## Conventions pour créer/modifier une tâche
- Nom de fichier (obligatoire pour que Backlog détecte la tâche) :
```/dev/null/naming.md#L1-1
task-<id> - Short title.md
```

- Exemple minimal de front matter (YAML) :
```/dev/null/task-frontmatter.md#L1-8
---
title: "Short title"
status: "To Do"
labels: ["spec","doc"]
assignee: ""
milestone: "Language specifications"
parent: "task-1"  # facultatif
---
```

- Créer une tâche via le CLI (recommandé, car le CLI remplit les defaults) :
```/dev/null/backlog-create.md#L1-1
backlog task create "Add feature X" -d "Description..." -l feature -s "To Do"
```

- Pour créer manuellement, respectez la convention de nommage et le front matter ci‑dessus, puis `backlog task list` doit la détecter.

## Dépannage (si `backlog task list` affiche `No tasks found.`)
- Vérifiez que vous êtes dans la racine du dépôt et que les fichiers sont bien sous `backlog/tasks/`.
- Vérifiez les noms : ils doivent commencer par `task-<id> - ` (sinon Backlog peut ne pas les reconnaître).
- Vérifiez `backlog/config.yml` (les `milestones` peuvent être utiles mais ne sont pas strictement requis pour lister les tâches).
- Réinitialisez si nécessaire :
```/dev/null/backlog-debug.md#L1-3
backlog config get remoteOperations
backlog config set remoteOperations false
backlog init
```
- Si vous utilisez des branches et que l'outil est configuré pour vérifier les branches actives, assurez‑vous d'utiliser la branche où les fichiers existent, ou ajustez `checkActiveBranches` dans la config.

## Bonnes pratiques & notes
- Règle du projet : "ticket avant code" — créez d'abord un ticket Backlog avant d'implémenter une fonctionnalité.
- Préférez `backlog task create` au copier/créer manuel : le CLI ajoute des DoD et formate correctement la tâche.
- Les fichiers originaux numérotés (`000-...`) ont été déplacés dans `backlog/archive/tasks/`. Si vous avez besoin de restaurer l'un d'eux, copiez‑le depuis l'archive et adaptez son nom/FrontMatter au format `task-...`.

## Si tu veux que je fasse la suite
- Je peux : ajouter des tickets placeholders pour les milestones, convertir d'autres fichiers, ajouter des exemples de CI pour valider la présence des tâches, ou créer des scripts d'automatisation pour normaliser automatiquement les tâches restantes.
- Dis‑moi ce que tu préfères que je priorise.

---

Si tu veux, je peux aussi exécuter ou vérifier en ligne de commande (sur ta machine) les étapes ci‑dessous et confirmer la visibilité des tâches — dis‑moi ce que tu veux que je fasse ensuite.