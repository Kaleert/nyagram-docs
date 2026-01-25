# 🔗 Middleware: Твой личный конвейер

Представь, что выполнение команды — это конвейер на заводе.
1.  Приехала заготовка (Контекст).
2.  Рабочий 1 проверил качество.
3.  Рабочий 2 покрасил деталь.
4.  Рабочий 3 (твой `@CommandHandler`) собрал устройство.

**Middleware** — это те самые рабочие, которые стоят до (и после) основного метода.

## Зачем это нужно?

*   **Логирование:** Записать, кто и какую команду вызвал.
*   **MDC:** Прокинуть ID запроса в логи (чтобы грепать логи было удобно).
*   **Обогащение контекста:** Достать юзера из базы данных и положить в контекст, чтобы не делать это в каждой команде.
*   **Транзакции:** Открыть транзакцию до команды и закрыть после.

## Создаем свой Middleware

Допустим, мы хотим замерять, сколько времени выполняется каждая команда, и писать это в лог.

Создай класс `PerformanceMiddleware.java`:

```java
import com.kaleert.nyagram.middleware.Middleware;
import com.kaleert.nyagram.middleware.MiddlewareChain;
import com.kaleert.nyagram.middleware.MiddlewareResult;
import com.kaleert.nyagram.command.CommandContext;
import com.kaleert.nyagram.meta.CommandMeta;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@Order(1) // Порядок выполнения (чем меньше, тем раньше)
public class PerformanceMiddleware implements Middleware {

    @Override
    public CompletableFuture<MiddlewareResult> handle(
            CommandContext context, 
            CommandMeta meta, 
            MiddlewareChain next
    ) {
        long startTime = System.currentTimeMillis();
        String commandName = meta.getFullCommandPath();

        // Передаем управление дальше по цепочке
        return next.proceed().thenApply(result -> {
            
            // Этот код выполнится ПОСЛЕ того, как отработает команда
            long duration = System.currentTimeMillis() - startTime;
            
            if (duration > 1000) {
                log.warn("🐢 Команда {} выполнялась слишком долго: {}ms", commandName, duration);
            } else {
                log.info("🚀 Команда {} выполнена за {}ms", commandName, duration);
            }
            
            return result; // Возвращаем результат дальше
        });
    }
}
```

## Прерывание цепочки 🛑

Middleware может решить **не пускать** запрос дальше. Например, если у нас технические работы.

```java
@Component
@Order(0)
public class MaintenanceMiddleware implements Middleware {

    private boolean isMaintenanceMode = false; // В реальности берем из конфига

    @Override
    public CompletableFuture<MiddlewareResult> handle(
            CommandContext context, 
            CommandMeta meta, 
            MiddlewareChain next
    ) {
        if (isMaintenanceMode && !isAdmin(context.getUserId())) {
            // Останавливаем обработку! Команда НЕ будет вызвана.
            return CompletableFuture.completedFuture(
                MiddlewareResult.stopResult("🛠 Бот на техобслуживании. Заходите позже.")
            );
        }

        return next.proceed();
    }
}
```

Теперь у тебя полный контроль над потоком выполнения. Ты можешь делать с запросами всё что угодно, не загрязняя код самих команд.