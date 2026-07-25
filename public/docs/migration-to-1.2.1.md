# 🛠 Миграция на Nyagram v1.2.1

Версия **1.2.1** — это крупнейшее архитектурное обновление фреймворка, которое переводит Nyagram в лигу Enterprise-решений. Мы добавили нативную поддержку Multi-Tenant SaaS (создание сеток ботов на одном приложении) и обновили пакеты.

### 1. Переименование пакетов (Breaking Change)
Основной пакет фреймворка изменен с `com.kaleert.nyagram` на `pro.kaleert.nyagram`. 
**Как исправить:**
Сделайте глобальный поиск и замену (Search and Replace) во всем вашем проекте:
*   Найти: `com.kaleert.nyagram`
*   Заменить на: `pro.kaleert.nyagram`

Также переименуйте соответствующие папки в `src/main/java`.

### 2. Новый Multi-Bot Режим (SaaS)
Вам больше не нужны кастомные контроллеры и костыли с `MDC` для запуска нескольких ботов на одном сервере!
Просто реализуйте интерфейс `NyagramBotProvider` в любом вашем `@Component`:

```java
@Component
public class MyBotProvider implements NyagramBotProvider {
    @Override
    public Collection<String> getBotTokens() {
        return List.of("TOKEN_1", "TOKEN_2"); // Возвращайте список токенов из БД
    }
}
```
Nyagram сам установит вебхуки для всех ботов и будет автоматически изолировать контекст при входящих запросах.

### 3. Исправление утечек контекста в `Middleware`
Если вы использовали `MDC` (Mapped Diagnostic Context) или `BotContextHolder`, ранее они могли теряться в асинхронных методах. В версии 1.2.1 цепочка выполнения (`MiddlewareChain`) оптимизирована. Убедитесь, что ваши кастомные Middleware не используют блокирующие операции в основном потоке.