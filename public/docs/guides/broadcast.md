# 📢 Массовые рассылки (Broadcast)

Хочешь рассказать всем пользователям о новой фиче? Или поздравить с Новым Годом?
Просто "пробежаться циклом" — плохая идея.
1.  Telegram имеет лимиты (около 30 сообщений в секунду).
2.  Пользователи могут заблокировать бота (ошибка 403), и твой цикл упадет.
3.  Это долго.

Nyagram берет это на себя.

## 1. Откуда брать людей? (`BroadcastTargetProvider`)

Бот не хранит список всех пользователей (если ты не настроил БД). Ты должен сказать боту, кому писать.

Реализуй интерфейс `BroadcastTargetProvider`.

```java
import pro.kaleert.nyagram.feature.broadcast.spi.BroadcastTargetProvider;
import org.springframework.stereotype.Component;
import java.util.stream.Stream;

@Component
public class MyUserProvider implements BroadcastTargetProvider {

    private final UserRepository userRepository; // Твой репозиторий JPA

    @Override
    public Stream<Long> getTargetChatIds() {
        // Важно: возвращаем Stream, а не List, чтобы не грузить миллион ID в память сразу
        return userRepository.streamAllChatIds(); 
    }
}
```

## 2. Запуск рассылки

Теперь в любой админской команде ты можешь вызвать `BroadcastManager`.

```java
import pro.kaleert.nyagram.feature.broadcast.BroadcastManager;

@BotCommand("/admin")
@RequiredArgsConstructor
public class AdminPanel {

    private final BroadcastManager broadcastManager;

    @CommandHandler("broadcast")
    public void sendNews(CommandContext ctx, @CommandArgument("text") String text) {
        ctx.reply("🚀 Начинаю рассылку...");
        
        // Запуск в фоновом режиме
        // 1-й аргумент: текст (поддерживает HTML)
        // 2-й аргумент: ID админа (для логов)
        broadcastManager.broadcast(text, ctx.getUserId().intValue());
    }
}
```

## 3. События рассылки (Events)

Как узнать, когда рассылка закончилась? Или сколько людей заблокировали бота?
Слушай события Spring!

```java
import pro.kaleert.nyagram.feature.broadcast.event.BroadcastEvents;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class BroadcastListener {

    @EventListener
    public void onComplete(BroadcastEvents.BroadcastCompleteEvent event) {
        System.out.println("✅ Рассылка завершена!");
        System.out.println("Всего: " + event.getTotal());
        System.out.println("Успешно: " + event.getSuccessful());
        System.out.println("Ошибок: " + event.getFailed());
        System.out.println("Время: " + event.getDurationMs() + "мс");
    }

    @EventListener
    public void onUserBlocked(BroadcastEvents.UserBlockedEvent event) {
        // Юзер заблокировал бота. Можно пометить его в базе как "мертвого"
        System.out.println("💀 Юзер " + event.getUserId() + " заблокировал бота.");
        // userRepository.markAsDeleted(event.getUserId());
    }
}
```

Теперь ты можешь вещать на огромную аудиторию безопасно и эффективно. Nyagram сама будет контролировать скорость (throttling) и обрабатывать ошибки.