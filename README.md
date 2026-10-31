# Portfolio — Rakotonanahary Nasandratra

Site portfolio personnel présentant mon profil de développeur web full-stack (6 ans d'expérience), mes expériences, compétences et formation.

🔗 **Démo en ligne** : https://nasandratra-portfolio.vercel.app/

## Stack

- HTML5 / CSS3 / JavaScript vanilla (aucun framework, aucune dépendance de build)
- [Devicon](https://devicon.dev/) pour les icônes de technologies

## Structure

```
.
├── index.html      # Contenu et structure de la page
├── style.css       # Styles (thème clair/sombre, animations, responsive)
├── script.js       # Curseur personnalisé, parallaxe, thème, menu mobile, animations au scroll
├── favicon.svg     # Favicon du site
└── profile.webp    # Photo de profil
```

## Fonctionnalités

- Bascule thème clair / sombre
- Navigation responsive avec menu burger sur mobile
- Curseur personnalisé sur desktop
- Animations d'apparition au défilement
- Optimisé SEO (balises meta, Open Graph, Twitter Card)

## Lancer le projet en local

Aucune dépendance ni build n'est nécessaire : il suffit d'ouvrir `index.html` dans un navigateur, ou de servir le dossier avec un petit serveur statique :

```bash
make start
```

Le site est alors disponible sur http://localhost:3000. Pour changer de port : `make start PORT=8080`.

## Déploiement

Le site est déployé sur [Vercel](https://vercel.com/). Pour publier la version locale en production :

```bash
make deploy
```

Cela lance `vercel --prod` (le [CLI Vercel](https://vercel.com/docs/cli) doit être installé et connecté avec `vercel login`).
