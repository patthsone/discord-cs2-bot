#!/bin/bash

# GitHub Actions Status Checker
# Этот скрипт проверяет статус последних запусков GitHub Actions

echo "🔍 Проверка статуса GitHub Actions..."
echo "=================================="

# Получаем информацию о репозитории
REPO_OWNER="patthsone"
REPO_NAME="discord-cs2-bot"

echo "📁 Репозиторий: $REPO_OWNER/$REPO_NAME"
echo ""

# Проверяем последние workflow runs
echo "📊 Последние запуски workflows:"
echo "-------------------------------"

# Используем GitHub CLI если доступен
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI найден"
    gh run list --repo $REPO_OWNER/$REPO_NAME --limit 5
else
    echo "⚠️  GitHub CLI не найден"
    echo "💡 Установите GitHub CLI для автоматической проверки:"
    echo "   https://cli.github.com/"
    echo ""
    echo "🌐 Или проверьте вручную:"
    echo "   https://github.com/$REPO_OWNER/$REPO_NAME/actions"
fi

echo ""
echo "🔗 Прямые ссылки:"
echo "   Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo "   Settings: https://github.com/$REPO_OWNER/$REPO_NAME/settings"
echo "   Secrets: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions"
echo ""

# Проверяем локальные файлы
echo "📋 Локальные файлы workflows:"
echo "----------------------------"
if [ -d ".github/workflows" ]; then
    ls -la .github/workflows/
    echo ""
    echo "✅ Workflow файлы найдены"
else
    echo "❌ Директория .github/workflows не найдена"
fi

echo ""
echo "🎯 Следующие шаги:"
echo "   1. Добавьте секреты в GitHub (см. GITHUB_ACTIONS_SETUP.md)"
echo "   2. Проверьте статус в разделе Actions"
echo "   3. При необходимости исправьте ошибки"
echo ""
echo "✨ Готово!"
