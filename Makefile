.PHONY: help setup build-prod start-prod test clean

help:
	@echo "Доступные команды:"
	@echo "  make setup    - установка всех зависимостей"
	@echo "  make build-prod - сборка production frontend"
	@echo "  make start-prod - запуск приложения в production режиме"
	@echo "  make test     - запуск тестов"
	@echo "  make clean    - очистка временных файлов"

setup:
	@echo "📦 Установка зависимостей..."
	@cd backend && python3 -m venv venv && . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt
	@cd frontend && npm install
	@echo "✅ Готово"

build-prod:
	@cd frontend && npm run build

start-prod:
	@./start-prod.sh

test:
	@cd backend && pytest -v
	@cd frontend && npm test

clean:
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete
	@rm -rf frontend/node_modules frontend/build
	@echo "✅ Очистка завершена"
