# 🚨 Обработка ошибок: Спасательный круг

В идеальном мире пользователи всегда вводят правильные данные, а серверы никогда не падают. В реальности пользователи пишут буквы вместо цифр, а интернет пропадает.

Если ты не обработаешь ошибку, бот просто промолчит (или вывалит стектрейс в лог), а пользователь подумает, что бот сломался.

В Nyagram не нужно оборачивать каждый метод в `try-catch`. Используй глобальные обработчики!

## Глобальный перехватчик `@BotControllerAdvice`

Создай отдельный класс (например, `GlobalErrorHandler`). Пометь его аннотацией `@BotControllerAdvice`. Внутри ты можешь определить методы для разных типов ошибок.

```java
import com.kaleert.nyagram.exception.BotControllerAdvice;
import com.kaleert.nyagram.exception.BotExceptionHandler;
import com.kaleert.nyagram.command.CommandContext;
import com.kaleert.nyagram.exception.ArgumentParseException;

@BotControllerAdvice // 1. Объявляем класс-советник
public class GlobalErrorHandler {

    // 2. Ловим ошибки ввода аргументов (например, ждали число, пришла строка)
    @BotExceptionHandler(ArgumentParseException.class)
    public void handleArgumentError(ArgumentParseException e, CommandContext ctx) {
        // Красиво отвечаем пользователю
        ctx.reply("⚠️ <b>Ошибка ввода:</b> " + e.getMessage() + 
                  "\nПожалуйста, проверьте формат команды.");
    }

    // 3. Ловим отсутствие прав
    @BotExceptionHandler(com.kaleert.nyagram.exception.NoPermissionException.class)
    public void handleNoPermission(Exception e, CommandContext ctx) {
        ctx.reply("⛔ <b>Доступ запрещен!</b> У вас недостаточно прав.");
    }

    // 4. Ловим всё остальное (Critical Errors)
    @BotExceptionHandler(Exception.class)
    public void handleGenericError(Exception e, CommandContext ctx) {
        // Логируем для админа
        e.printStackTrace(); 
        
        // Отвечаем юзеру, чтобы он не ждал
        ctx.reply("🔥 Произошла внутренняя ошибка. Мы уже чиним!");
    }
}
```

### Как это работает?

1.  Когда в любом `@CommandHandler` или `@Callback` вылетает исключение, Nyagram перехватывает его.
2.  Она ищет подходящий метод `@BotExceptionHandler`.
3.  Если находит — выполняет его, передавая само исключение и контекст.

## Полезные исключения

Nyagram сама выбрасывает некоторые исключения, которые полезно ловить:

| Исключение | Когда возникает? |
| :--- | :--- |
| `ArgumentParseException` | Когда валидация аргумента (`@Validation`) не прошла или тип данных не совпадает (строка вместо числа). |
| `NoPermissionException` | Когда у пользователя нет нужного пермишена (`@RequiresPermission`). |
| `CommandExecutionException` | Общая ошибка выполнения команды. |

Теперь твой бот никогда не упадет молча!