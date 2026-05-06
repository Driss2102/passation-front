# Passation Frontend

Interface React pour la gestion des passations de poste.

## Stack technique

- React 19
- Vite 8
- React Router 7
- Recharts (graphiques)
- Axios (HTTP)
- CSS Variables (design system)

## Prérequis

- Node.js 18+
- npm 9+
- Backend passation-backend démarré sur http://localhost:9090

## Installation & démarrage

```bash
npm install
npm run dev
```

L'application démarre sur **http://localhost:5173**

## Build production

```bash
npm run build
npm run preview
```

## Comptes de démo

| Email | Password | Rôle | Vue |
|-------|----------|------|-----|
| alice.martin@example.com | password123 | EMPLOYE | Ses passations |
| bob.dupont@example.com | password123 | MANAGER_RH | Dashboard complet + analytics |
| claire.leclerc@example.com | password123 | REMPLACANT | Ce qu'il reprend |
| admin@example.com | password123 | ADMIN | Accès total |

## Pages disponibles

| URL | Accès | Description |
|-----|-------|-------------|
| `/login` | Public | Connexion JWT |
| `/dashboard` | Tous | KPIs adaptés au rôle |
| `/passations` | Tous | Liste + recherche + filtres |
| `/passations/:id` | Tous | Détail + projets + PDF export |
| `/alertes` | Tous | Alertes avec sévérité |
| `/analytics` | MANAGER_RH, ADMIN | Graphiques Recharts |
| `/admin/users` | ADMIN | Gestion utilisateurs CRUD |
| `/admin/checklists` | ADMIN | Gestion templates checklist |

## Architecture

```
src/
  context/
    AuthContext.jsx       # JWT state global (useAuth hook)
  services/
    api.js                # Axios instance + intercepteurs JWT
    authService.js
    passationService.js
    userService.js
    alerteService.js
    projetService.js
    checklistService.js
    timelineService.js
    commentaireService.js
    pdfService.js
  components/
    Navbar.jsx            # Logo + user + cloche alertes
    Sidebar.jsx           # Navigation par rôle
    ProtectedRoute.jsx    # Guard JWT + rôle
    Button / Card / Badge / ProgressBar / Modal
  pages/
    Login.jsx
    Dashboard.jsx         # KPIs role-based
    PassationList.jsx     # Tableau + filtres avancés
    PassationDetail.jsx   # Détail + onglets + export PDF
    ChecklistPage.jsx     # Checklist interactive
    TimelinePage.jsx      # Timeline verticale
    AlertesPage.jsx       # Alertes filtrées
    AdminUsers.jsx        # CRUD utilisateurs
    AdminChecklists.jsx   # Templates checklist
    AnalyticsPage.jsx     # 4 graphiques Recharts
  styles/
    variables.css         # Design tokens
    global.css            # Layout + responsive
    components.css        # Classes utilitaires
```

## Fonctionnalités clés

- **Auth JWT** : login → token stocké en localStorage → headers auto via intercepteur Axios
- **Routes protégées** : redirect /login si non connecté, redirect si rôle insuffisant
- **Dashboard adapté** : chaque rôle voit une vue personnalisée
- **Score de risque** : badge coloré FAIBLE/MODERE/CRITIQUE sur chaque passation
- **Export PDF** : téléchargement direct depuis la page détail passation
- **Responsive** : menu hamburger sur mobile, cartes empilées, tableaux scrollables
