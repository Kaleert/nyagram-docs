# ⚡ Анатомия апдейта: Как бот думает?

Представь, что твой бот — это элитный сортировочный центр почты. Каждое действие пользователя (сообщение, нажатие кнопки, лайк) — это посылка, которую Telegram называет **Update**.

Когда `Update` попадает в Nyagram, он проходит через строгий конвейер. Давай разберем этот путь, чтобы ты знал, куда можно "вклиниться".

## 🛤 Путь сообщения (The Pipeline)

Вот что происходит за доли секунды, когда кто-то пишет `/start`:

1.  **Прием (Receiver):** `NyagramPoller` или `WebhookController` ловят JSON от Telegram.
2.  **Первичная проверка (Interceptors Pre-Handle):** Охрана на входе. Здесь можно отсеять забаненных или залогировать запрос.
3.  **Сортировка (Routing):** Библиотека смотрит на содержимое:
    *   Это команда? (`/start`) -> **CommandDispatcher**
    *   Это кнопка? -> **CallbackDispatcher**
    *   Это просто текст/фото/событие? -> **EventDispatcher**
4.  **Обработка (Execution):** Вызывается ТВОЙ метод (тот самый, с аннотацией `@CommandHandler` или `@Callback`).
5.  **Завершение (Interceptors Post-Handle):** Уборка за собой. Логирование результата или ошибок.

## 🛑 Перехватчики (Interceptors)

Хочешь сделать "черный список" пользователей или логировать каждое сообщение в свою базу данных? Тебе нужны **Интерсепторы**.

Это как фильтры. Ты создаешь класс, и Nyagram прогоняет через него **каждый** апдейт.

### Пример: Логгер всех сообщений

```java
import com.kaleert.nyagram.api.objects.Update;
import com.kaleert.nyagram.core.spi.UpdateInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component // Обязательно, чтобы Spring увидел этот класс!
public class LoggingInterceptor implements UpdateInterceptor {

    @Override
    public boolean preHandle(Update update) {
        // Этот метод вызывается ДО того, как бот начнет обрабатывать команду
        
        Long userId = update.getFromId();
        String text = update.getPayload(); // Удобный метод получить текст/данные
        
        log.info("📩 Получено сообщение от {}: {}", userId, text);
        
        // Если вернуть false, обработка остановится! Бот проигнорирует сообщение.
        return true; 
    }

    @Override
    public void postHandle(Update update, boolean handled, Throwable ex) {
        // Вызывается ПОСЛЕ обработки (даже если была ошибка)
        if (ex != null) {
            log.error("❌ Ошибка при обработке: ", ex);
        } else {
            log.info("✅ Успешно обработано");
        }
    }
}
```

### Пример: Бан-лист 🚫

```java
@Override
public boolean preHandle(Update update) {
    Long userId = update.getFromId();
    
    if (userId == 1337228) { // ID злодея
        // Можно даже ничего не отвечать, просто игнор
        return false; 
    }
    
    return true;
}
```

## 🏗 Ручной режим (Raw Updates)

Иногда тебе не нужны ни команды, ни кнопки. Ты хочешь получить "сырой" апдейт и сделать с ним что-то безумное.

Для этого реализуй интерфейс `RawUpdateHandler`.

```java
import com.kaleert.nyagram.core.spi.RawUpdateHandler;
import org.springframework.stereotype.Component;

@Component
public class MyCustomLogic implements RawUpdateHandler {

    @Override
    public boolean handle(Update update) {
        // Твоя логика
        if (update.hasMessage() && update.getMessage().getText().equals("Секретный код")) {
            System.out.println("🚀 Запуск ракеты!");
            return true; // true = мы обработали апдейт, дальше его пускать не надо
        }
        
        // false = пусть Nyagram обрабатывает его как обычно (ищет команды и т.д.)
        return false; 
    }
}
```

> **Важно:** `RawUpdateHandler` срабатывает **после** Интерсепторов, но **перед** поиском команд. Это самый мощный инструмент для кастомной логики.

## Итог

Nyagram не скрывает от тебя апдейты.
1.  Хочешь глобальную логику? Используй **Interceptor**.
2.  Хочешь полностью перехватить управление? Используй **RawUpdateHandler**.
3.  Хочешь просто писать команды? Используй `@CommandHandler`.

Теперь, когда мы знаем, как работает система, давай погрузимся в одну из самых мощных фич — **Машину Состояний (FSM)**.

[👉 FSM: Как запомнить диалог?](/docs/fsm/theory)