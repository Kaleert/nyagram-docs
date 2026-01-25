# 🎹 Кнопки и Callbacks: Не заставляй их печатать

Давай честно: пользователи ленивые. Если можно нажать кнопку вместо того, чтобы писать `/order pizza pepperoni`, они выберут кнопку.

В Nyagram работа с клавиатурами (Keyboards) и нажатиями (Callbacks) доведена до абсолюта. Забудь про ручное создание JSON-массивов.

## Типы клавиатур

В Telegram их два вида.

### 1. Reply Keyboard (Нижняя клавиатура)
Она заменяет стандартную клавиатуру телефона. Кнопки отправляют текст, как будто юзер сам его написал.

**Идеально для:** Главного меню, навигации, постоянных действий.

```java
// Внутри любой команды
public void showMenu(CommandContext ctx) {
    
    // Строитель (Builder) делает код читаемым
    var keyboard = ReplyKeyboardBuilder.create()
            .button("🍕 Заказать")
            .button("🛒 Корзина")
            .row() // Перенос на новую строку
            .button("ℹ️ О нас")
            .resize() // Сделать кнопки компактными (обязательно!)
            .build();

    ctx.reply("Добро пожаловать в меню!", "HTML", null, keyboard);
}
```

Чтобы обработать нажатие на "🍕 Заказать", тебе не нужен особый обработчик. Просто создай команду или алиас:

```java
@CommandHandler(aliases = {"🍕 Заказать"})
public void startOrder(CommandContext ctx) {
    ctx.reply("Что будем заказывать?");
}
```

### 2. Inline Keyboard (Кнопки под сообщением)
Самые мощные кнопки. Они привязаны к конкретному сообщению. При нажатии они отправляют скрытый сигнал (**Callback Data**) боту, а не пишут текст в чат.

**Идеально для:** Списков товаров, действий с конкретным объектом (купить, удалить, лайкнуть).

```java
public void showItem(CommandContext ctx) {
    var keyboard = InlineKeyboardBuilder.create()
            .button("🔥 Купить", "buy:item:123") // Текст кнопки, Data
            .url("🌐 Наш сайт", "https://myshop.com")
            .row()
            .button("❌ Закрыть", "close_menu")
            .build();

    ctx.reply("Товар: Меч Тысячи Истин", "HTML", null, keyboard);
}
```

## 🎯 Обработка нажатий (Callbacks)

Вот где Nyagram сияет. В других библиотеках тебе пришлось бы писать огромный `switch` и вручную парсить строку `buy:item:123`, разбивая её по двоеточиям.

В Nyagram мы используем аннотацию `@Callback` и умные переменные.

### Простой пример

```java
@Callback("close_menu")
public void onClose(CommandContext ctx) {
    // Удаляем сообщение, на котором была нажата кнопка
    ctx.deleteMessage(ctx.getMessage().getMessageId());
}
```

### 🧠 Умные переменные (Pattern Matching)

Допустим, у тебя кнопка с данными `buy:pizza:pepperoni:500` (купить пепперони за 500).
Как это обработать красиво?

Используй фигурные скобки `{}` в шаблоне:

```java
@Callback("buy:pizza:{name}:{price}")
public void onBuy(
    CommandContext ctx, 
    // Nyagram сама вытащит значения!
    @CallbackVar("name") String pizzaName, 
    @CallbackVar("price") Integer price
) {
    ctx.reply("Вы выбрали пиццу: " + pizzaName + " за " + price + " рублей.");
    
    // Важно: Ответить на callback, чтобы у юзера перестали крутиться "часики"
    // Nyagram делает это автоматически, если метод ничего не возвращает,
    // или возвращает CommandResult.
}
```

### Всплывающие уведомления (Alerts)

Иногда не нужно писать сообщение в чат, а нужно показать всплывашку (Alert) прямо поверх экрана.

Просто верни строку из метода!

```java
@Callback("secret_button")
public String onSecretClick() {
    // Это покажется как всплывающее уведомление
    return "⛔ Доступ запрещен! Это кнопка для админов."; 
}
```

Если хочешь вернуть уведомление, но без громкого Alert (просто текст вверху экрана), верни `CommandResult`:

```java
@Callback("like")
public CommandResult onLike() {
    // false = не показывать Alert (просто тост уведомление)
    // Но для этого нужно использовать AnswerCallbackQuery вручную, 
    // Nyagram по умолчанию для строк делает Alert = false (notification).
    
    // Уточнение: Если метод возвращает String -> это Notification (тост).
    // Чтобы сделать Alert (окошко с ОК), нужно использовать клиент напрямую:
    
    /* 
    ctx.getClient().execute(AnswerCallbackQuery.builder()
        .callbackQueryId(...)
        .text("АХТУНГ!")
        .showAlert(true)
        .build()); 
    */
    
    return CommandResult.success("Лайк поставлен!"); 
}
```

## Итог

*   **Reply Keyboard** — для навигации (текстовые команды).
*   **Inline Keyboard** — для действий (скрытые данные).
*   **InlineKeyboardBuilder** — строй кнопки красиво.
*   **`@Callback("action:{id}")`** — забудь про ручной парсинг строк.

Теперь твой бот не только умный, но и удобный. Пользователи будут в восторге.