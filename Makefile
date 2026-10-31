PORT ?= 3000

.PHONY: start deploy

start:
	@echo "Portfolio disponible sur http://localhost:$(PORT)"
	python3 -m http.server $(PORT)

deploy:
	@echo "Déploiement en production sur Vercel..."
	vercel --prod
