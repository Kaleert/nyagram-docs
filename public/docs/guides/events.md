# 🔔 Система Событий: Бот видит всё

Nyagram позволяет реагировать на любые изменения, которые присылает Telegram, даже если в них нет текста команды.

Используй аннотацию `@NyagramEventHandler`.

## 1. Бот добавлен в группу (`MY_CHAT_MEMBER`)

Хочешь поздороваться, когда тебя добавляют в чат?

```java
import com.kaleert.nyagram.event.NyagramEventHandler;
import com.kaleert.nyagram.event.EventType;
import com.kaleert.nyagram.api.objects.Update;
import com.kaleert.nyagram.api.methods.send.SendMessage;
import com.kaleert.nyagram.client.NyagramClient;
import org.springframework.stereotype.Component;

@Component
public class GroupEvents {

    private final NyagramClient client;

    public GroupEvents(NyagramClient client) {
        this.client = client;
    }

    @NyagramEventHandler(EventType.MY_CHAT_MEMBER)
    public void onBotAdded(Update update) {
        var myMember = update.getMyChatMember();
        var newStatus = myMember.getNewChatMember().getStatus();

        // Если статус стал "member" или "administrator" -> нас добавили
        if ("member".equals(newStatus) || "administrator".equals(newStatus)) {
            String chatId = myMember.getChat().getId().toString();
            
            client.execute(SendMessage.builder()
                    .chatId(chatId)
                    .text("Всем ку! Я бот Nyagram. Пишите /help.")
                    .build());
        }
    }
}
```

## 2. Реакции на сообщения (`MESSAGE_REACTION`)

Кто-то поставил лайк твоему сообщению? Запиши это!

```java
@NyagramEventHandler(EventType.MESSAGE_REACTION)
public void onReaction(Update update) {
    var reaction = update.getMessageReaction();
    System.out.println("Юзер " + reaction.getUser().getId() + 
                       " отреагировал на сообщение " + reaction.getMessageId());
}
```

## 3. Опросы (`POLL_ANSWER`)

Обработка ответов в викторинах.

```java
@NyagramEventHandler(EventType.POLL_ANSWER)
public void onPollVote(Update update) {
    var answer = update.getPollAnswer();
    System.out.println("Юзер " + answer.getUser().getFirstName() + 
                       " выбрал вариант: " + answer.getOptionIds());
}
```

## Поддерживаемые события

В `EventType` есть всё, что дает Telegram API:
*   `MESSAGE` (Любое сообщение, даже без команд)
*   `EDITED_MESSAGE` (Кто-то изменил текст)
*   `CALLBACK_QUERY` (Сырые нажатия кнопок)
*   `INLINE_QUERY` (Ввод через @botname)
*   `PRE_CHECKOUT_QUERY` (Платежи)
*   и многое другое...