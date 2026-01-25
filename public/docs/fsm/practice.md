# 🛠 FSM на практике: Пицца-бот 🍕

Теория усвоена? Отлично. Теперь давай напишем код, который можно потрогать.
Мы сделаем бота, который спрашивает у пользователя три вещи:
1.  Какую пиццу он хочет?
2.  Какой размер?
3.  Куда доставить?

И в конце выводит чек. Погнали!

## Шаг 1. Определяем состояния

Сначала нужно придумать имена для наших этапов. Лучше всего создать отдельный класс с константами, чтобы не опечататься.

Создай файл `PizzaState.java`:

```java
public class PizzaState {
    // Ждем, пока юзер напишет название пиццы
    public static final String WAITING_FOR_NAME = "pizza:name";
    
    // Ждем, пока юзер выберет размер
    public static final String WAITING_FOR_SIZE = "pizza:size";
    
    // Ждем адрес доставки
    public static final String WAITING_FOR_ADDRESS = "pizza:address";
}
```

## Шаг 2. Запускаем сессию (/order)

Диалог должен с чего-то начинаться. Пусть это будет команда `/order`.

Создай контроллер `OrderCommand.java`. Нам понадобится `SessionManager` — это главный пульт управления памятью.

```java
@BotCommand("/order")
@RequiredArgsConstructor // Lombok создаст конструктор для SessionManager
public class OrderCommand {

    private final SessionManager sessionManager;

    @CommandHandler
    public void startOrder(CommandContext ctx) {
        Long userId = ctx.getUserId();
        Long chatId = ctx.getChatId();

        // 1. Открываем сессию и ставим первое состояние
        sessionManager.startSession(userId, chatId, PizzaState.WAITING_FOR_NAME);

        ctx.reply("🍕 Привет! Давай закажем пиццу.\nНапиши мне название (например: Пепперони):");
    }
}
```

**Что произошло?**
Как только юзер написал `/order`, бот создал для него "коробку" (Session) и наклеил на неё стикер: *"Жду название пиццы"*.

## Шаг 3. Обработка ответов (StateAction)

Теперь самое интересное. Куда пойдет следующее сообщение пользователя? Оно не является командой (не начинается с `/`).

Оно попадет в **EventDispatcher**, который ищет методы с аннотацией `@StateAction`.

Создай класс `PizzaFlow.java`:

```java
@Component // Важно! Spring должен видеть этот класс
@RequiredArgsConstructor
public class PizzaFlow {

    private final SessionManager sessionManager;

    // ЭТАП 1: Получаем название -> Спрашиваем размер
    @StateAction(PizzaState.WAITING_FOR_NAME)
    public void handlePizzaName(CommandContext ctx, UserSession session) {
        String pizzaName = ctx.getText();

        // Валидация? Легко!
        if (pizzaName.length() < 3) {
            ctx.reply("❌ Какое-то короткое название... Попробуй еще раз:");
            return; // Не меняем состояние, пусть пишет заново
        }

        // 2. Сохраняем данные в "коробку" сессии
        session.putData("pizza_name", pizzaName);

        // 3. Переключаем стрелку на следующий путь
        sessionManager.updateState(ctx.getUserId(), PizzaState.WAITING_FOR_SIZE);

        ctx.reply("Отлично, " + pizzaName + "! 😋\nТеперь напиши размер (S, M, L):");
    }

    // ЭТАП 2: Получаем размер -> Спрашиваем адрес
    @StateAction(PizzaState.WAITING_FOR_SIZE)
    public void handleSize(CommandContext ctx, UserSession session) {
        String size = ctx.getText().toUpperCase();

        if (!Set.of("S", "M", "L").contains(size)) {
            ctx.reply("Я знаю только размеры S, M и L. Повтори ввод:");
            return;
        }

        session.putData("pizza_size", size);
        
        // Двигаемся дальше
        sessionManager.updateState(ctx.getUserId(), PizzaState.WAITING_FOR_ADDRESS);
        
        ctx.reply("Размер " + size + " принят.\nКуда везти? Напиши адрес:");
    }
}
```

## Шаг 4. Финиш и Магия `@SessionData` ✨

Остался последний шаг — получить адрес и оформить заказ.
Но давай я покажу тебе фокус.

Вместо того чтобы писать `session.getData("pizza_name", String.class)`, ты можешь попросить Nyagram **сразу дать тебе нужные данные** в аргументы метода.

Добавляем финал в `PizzaFlow.java`:

```java
    // ЭТАП 3: Финал
    @StateAction(PizzaState.WAITING_FOR_ADDRESS)
    public void finishOrder(
            CommandContext ctx,
            // Магия! Nyagram сама достанет это из сессии
            @SessionData("pizza_name") String name,
            @SessionData("pizza_size") String size
    ) {
        String address = ctx.getText();

        // Формируем чек
        String check = String.format("""
            ✅ <b>Заказ оформлен!</b>
            
            🍕 Пицца: %s
            📏 Размер: %s
            📍 Адрес: %s
            
            Курьер уже выехал! 🚀
            """, name, size, address);

        ctx.reply(check);

        // 4. Убиваем сессию. Бот забывает всё и готов к новому заказу.
        sessionManager.clearSession(ctx.getUserId());
    }
```

## Итог

Посмотри, как чисто выглядит код!
1.  Никаких `if-else` лесенок.
2.  Данные летают между методами сами.
3.  Логика разбита на маленькие, понятные куски.

### Что, если юзер передумал?

Добавь глобальную команду `/cancel`:

```java
@CommandHandler("cancel")
public void cancel(CommandContext ctx) {
    sessionManager.clearSession(ctx.getUserId());
    ctx.reply("🚫 Отмена. Всё забыл.");
}
```

Теперь ты властелин диалогов. Твой бот может провести пользователя через анкету на визу, оформление кредита или просто душевный разговор, не теряя ни байта информации.

**Поздравляю!** Ты прошел базовый курс молодого бойца Nyagram. Теперь иди и создавай шедевры!