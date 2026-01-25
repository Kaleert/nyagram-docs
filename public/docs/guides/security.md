### 2. Глава: Безопасность (Security)

Это самая важная часть для любого публичного бота. Nyagram предлагает гибкую систему прав (Permissions) и уровней (Levels).

Создаем файл: `nyagram-docs/public/docs/guides/security.md`

# 🛡️ Безопасность: Кто здесь главный?

Ты не хочешь, чтобы случайный прохожий забанил всех пользователей или посмотрел статистику. В Nyagram защита встроена на уровне ядра.

У нас есть два понятия:
1.  **Уровень (Level):** Число (например, 0 - юзер, 100 - админ). Просто и эффективно.
2.  **Права (Permissions):** Строковые ключи (например, `user.ban`, `promo.create`). Гибко и мощно.

## Шаг 1. Настройка Провайдеров

Бот не знает, кто админ, а кто нет. Ты должен ему сказать. Для этого реализуй два интерфейса.

Создай класс `SecurityConfig.java`:

```java
import com.kaleert.nyagram.security.spi.UserLevelProvider;
import com.kaleert.nyagram.security.spi.UserPermissionProvider;
import com.kaleert.nyagram.api.objects.User;
import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class SecurityConfig implements UserLevelProvider, UserPermissionProvider {

    // В реальности ID лучше брать из конфига или БД
    private static final long ADMIN_ID = 123456789L;

    @Override
    public Integer getUserLevel(User user) {
        if (user.getId().equals(ADMIN_ID)) {
            return 100; // Бог
        }
        return 0; // Смертный
    }

    @Override
    public Set<String> getUserPermissions(User user) {
        if (user.getId().equals(ADMIN_ID)) {
            return Set.of("*"); // Доступ ко всему (Wildcard)
        }
        // Для обычных юзеров можно грузить права из БД
        return Set.of("order.create"); 
    }
}
```

## Шаг 2. Защита Команд

Теперь, когда бот знает "кто есть кто", вешаем замки на двери.

### Защита по Уровню (`@LevelRequired`)

Идеально для иерархии: Юзер -> Модератор -> Админ.

```java
@CommandHandler("ban")
// Требуется уровень от 50 до 100
// Если ниже - бот напишет "Доступ запрещен" (NOTIFY)
@LevelRequired(min = 50, deniedAction = AccessDeniedAction.NOTIFY)
public void banUser(CommandContext ctx) {
    // Код выполнится только если level >= 50
    ctx.reply("Молот правосудия опущен!");
}

@CommandHandler("secret")
// Если прав нет - бот промолчит, будто команды не существует (SILENT)
@LevelRequired(min = 100, deniedAction = AccessDeniedAction.SILENT)
public void secretBase(CommandContext ctx) {
    ctx.reply("Добро пожаловать в Зону 51 👽");
}
```

### Защита по Правам (`@RequiresPermission`)

Идеально для ролевой модели (Role-Based Access).

```java
@CommandHandler("promo")
@RequiresPermission("marketing.create_promo")
public void createPromo(CommandContext ctx) {
    ctx.reply("Создаем промокод...");
}
```

Если у пользователя нет права `marketing.create_promo` (и нет права `*`), команда выбросит исключение `NoPermissionException`. Ты можешь перехватить его через `@BotControllerAdvice` (см. гайд по Ошибкам).