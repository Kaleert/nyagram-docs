# 💰 Платежи: Telegram Stars и не только

С июня 2024 года Telegram ввел **Stars** (Звезды) для оплаты цифровых товаров. Nyagram поддерживает их полностью.

Весь процесс покупки состоит из 3 шагов:
1.  **Счет (Invoice):** Бот отправляет кнопку "Купить".
2.  **Проверка (Pre-Checkout):** Юзер нажал "Оплатить", Telegram спрашивает бота: "Всё в силе?".
3.  **Успех (Successful Payment):** Деньги списаны, бот выдает товар.

## Шаг 1. Отправка Счета (Invoice)

```java
@CommandHandler("buy")
public void sendInvoice(CommandContext ctx) {
    // Формируем цену: 100 Звезд
    List<LabeledPrice> prices = List.of(new LabeledPrice("Супер Меч", 100));

    SendInvoice invoice = SendInvoice.builder()
            .chatId(ctx.getChatId().toString())
            .title("Меч Тысячи Истин")
            .description("Дает +500 к урону и +10 к харизме")
            .payload("order_id_12345") // Скрытые данные для вашей БД
            .currency("XTR")           // XTR = Telegram Stars
            .prices(prices)
            .build();

    ctx.getClient().execute(invoice);
}
```

## Шаг 2. Подтверждение (Pre-Checkout Query)

**ОБЯЗАТЕЛЬНЫЙ ШАГ!** Если вы не ответите на этот запрос за 10 секунд, платеж отменится.

```java
@Component
public class PaymentHandler {

    private final NyagramClient client;

    // Внедряем клиент через конструктор
    public PaymentHandler(NyagramClient client) {
        this.client = client;
    }

    @NyagramEventHandler(EventType.PRE_CHECKOUT_QUERY)
    public void onPreCheckout(Update update) {
        var query = update.getPreCheckoutQuery();
        String id = query.getId();
        
        // Тут можно проверить наличие товара на складе
        boolean isAvailable = true; 

        if (isAvailable) {
            // Одобряем!
            client.execute(AnswerPreCheckoutQuery.approve(id));
        } else {
            // Отклоняем с текстом ошибки
            client.execute(AnswerPreCheckoutQuery.reject(id, "Товар закончился :("));
        }
    }
}
```

## Шаг 3. Выдача товара (Successful Payment)

Деньги у нас. Пора радовать клиента. Это обычное системное сообщение (`MESSAGE`).

```java
@NyagramEventHandler(EventType.MESSAGE)
public void onPaymentSuccess(CommandContext ctx) {
    // Проверяем, есть ли в сообщении информация об успешной оплате
    if (!ctx.getMessage().get().hasSuccessfulPayment()) return;

    var payment = ctx.getMessage().get().getSuccessfulPayment();
    String payload = payment.getInvoicePayload(); // "order_id_12345"
    int amount = payment.getTotalAmount();

    ctx.reply("🎉 <b>Оплата прошла успешно!</b>\n" +
              "Получено: " + amount + " " + payment.getCurrency() + "\n" +
              "Номер заказа: " + payload);
              
    // Тут можно выдать роль, начислить баланс или отправить файл
}
```

Теперь твой бот — это настоящий интернет-магазин.