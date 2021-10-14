serve:
	cd dev; \
	sh start_server.sh

serve-stop:
	cd dev; sh stop_server.sh

watch:
	yarn watch

reset:
	cd dev; \
	docker compose down --rmi all --remove-orphans --volumes; \
	docker compose build --no-cache; \
	sh start_server.sh

serve-prod:
	docker compose --project-name navigator-prod up --build; \
	docker compose  --project-name navigator-prod rm -f

serve-prod-stop:
	docker compose --project-name navigator-prod stop