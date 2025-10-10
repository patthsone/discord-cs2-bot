# Настройка DNS для кастомного домена

## Инструкции по настройке DNS для starladder-project.ru

### Для GitHub Pages с кастомным доменом:

1. **В настройках GitHub Pages:**
   - Перейдите в Settings → Pages
   - В разделе "Custom domain" введите: `starladder-project.ru`
   - Поставьте галочку "Enforce HTTPS"

2. **Настройка DNS у провайдера домена:**
   
   **Вариант A: CNAME запись (рекомендуется)**
   ```
   Type: CNAME
   Name: starladder-project.ru
   Value: patthsone.github.io
   TTL: 3600
   ```
   
   **Вариант B: A записи**
   ```
   Type: A
   Name: starladder-project.ru
   Value: 185.199.108.153
   
   Type: A
   Name: starladder-project.ru
   Value: 185.199.109.153
   
   Type: A
   Name: starladder-project.ru
   Value: 185.199.110.153
   
   Type: A
   Name: starladder-project.ru
   Value: 185.199.111.153
   ```

3. **Проверка настройки:**
   ```bash
   # Проверка DNS
   nslookup starladder-project.ru
   
   # Проверка доступности
   curl -I https://starladder-project.ru
   ```

4. **Время активации:**
   - DNS изменения могут занять до 24-48 часов
   - GitHub Pages обычно активируется в течение 10-15 минут

### Альтернативные варианты:

**Если нужен поддомен:**
```
Type: CNAME
Name: status.starladder-project.ru
Value: patthsone.github.io
```

**Если нужен другой путь:**
```
Type: CNAME
Name: bot.starladder-project.ru
Value: patthsone.github.io
```

### Troubleshooting:

1. **Домен не работает:**
   - Проверьте DNS записи
   - Убедитесь, что CNAME файл содержит правильный домен
   - Проверьте настройки GitHub Pages

2. **HTTPS не работает:**
   - Включите "Enforce HTTPS" в настройках GitHub Pages
   - Подождите 24 часа для активации SSL сертификата

3. **Статус-страница не обновляется:**
   - Проверьте GitHub Actions
   - Убедитесь, что workflow выполняется успешно
