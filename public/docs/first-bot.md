# 🤖 Твой первый бот

Настало время магии! Мы настроили проект, получили токен, и теперь заставим твоего бота не просто висеть в онлайне, а **отвечать**.

В Nyagram не нужно писать длинные "портянки" кода. Всё строится на **Командах**.

## Шаг 1. Главный класс (Входная дверь)

У тебя уже должен быть класс с методом `main` (обычно он создается автоматически, например `MyBotApplication.java`). Убедись, что он выглядит примерно так:

```java
package com.example.mybot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyBotApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyBotApplication.class, args);
    }
}
```

Это "сердце" твоего приложения. Когда ты запускаешь этот метод, Spring просыпается, находит Nyagram и запускает бота.

## Шаг 2. Создаем команду /start

В Telegram любой диалог начинается с кнопки **Start**. Давай научим бота реагировать на неё.

Создай новый пакет `commands` (для порядка) и в нем класс `StartCommand.java`.

```java
package com.example.mybot.commands;

import pro.kaleert.nyagram.command.BotCommand;
import pro.kaleert.nyagram.command.CommandContext;
import pro.kaleert.nyagram.command.CommandHandler;

// 1. Объявляем класс как команду
@BotCommand(value = "/start", description = "Приветствие")
public class StartCommand {

    // 2. Указываем метод-обработчик
    @CommandHandler
    public void execute(CommandContext ctx) {
        // 3. Отправляем ответ
        ctx.reply("Привет! Я живой! 😺\nЯ работаю на <b>Nyagram</b>.");
    }
}
```

> P.s.: если вы используете версию ниже 1.2.1, то замените `pro` в начале импортов на `com`, т.е `com.kaleert.nyagram.*`

### Разбор полетов ✈️

Давай посмотрим, что мы тут написали. Всё проще, чем кажется:

1.  **`@BotCommand("/start")`** — Это "вывеска" на двери. Она говорит библиотеке: *"Эй, если юзер напишет `/start`, стучись в этот класс!"*.
2.  **`@CommandHandler`** — Это конкретная инструкция. Когда Nyagram заходит в класс, она ищет метод с этой пометкой и выполняет его.
3.  **`CommandContext ctx`** — Это твой волшебный сундук. В нём лежит всё, что прислал Telegram (кто написал, какой чат, текст сообщения) и инструменты для ответа.
4.  **`ctx.reply(...)`** — Самый простой способ ответить. Бот сам поймет, в какой чат нужно отправить сообщение. По умолчанию поддерживается HTML-разметка!

## Шаг 3. Запуск! 🚀

Настало время истины.

1.  Найди зеленый треугольник ▶️ в IntelliJ IDEA (рядом с классом `MyBotApplication`) и нажми его.
2.  Смотри в консоль (снизу). Если увидишь надпись вроде:
    `INFO ... Starting Nyagram Poller for bot: @MySuperNyagramBot` — **ПОБЕДА!** Бот запущен.

## Шаг 4. Проверка

1.  Открой Telegram.
2.  Найди своего бота (по юзернейму, который ты создавал в BotFather).
3.  Нажми **Запустить** (или напиши `/start`).

Бот должен мгновенно ответить:
> Привет! Я живой! 😺
> Я работаю на **Nyagram**.

## Level Up: Команда с аргументами 🔥

Давай сделаем что-то посложнее. Пусть бот умеет здороваться лично.
Добавь в этот же класс (или создай новый) еще один метод:

```java
import pro.kaleert.nyagram.command.CommandArgument;

// ... внутри класса ...

// Реагирует на команду /hello
@CommandHandler("hello") 
public void sayHello(
    CommandContext ctx, 
    // Nyagram сама вытащит текст после команды!
    @CommandArgument("name") String name 
) {
    ctx.reply("Привет, " + name + "! Рад тебя видеть 👋");
}
```

**Как это работает:**
Если юзер напишет: `/start hello Вася` (или просто `/hello Вася`, если зарегистрировать `/hello` отдельно), бот ответит:
> Привет, Вася! Рад тебя видеть 👋

Nyagram **сама** распарсит сообщение, найдет первое слово после команды и положит его в переменную `name`. Тебе не нужно делить строку пробелами вручную. Круто, да?

## Что дальше?

Ты создал бота, который умеет общаться. Но это только верхушка айсберга.
В следующей главе мы разберем, как правильно настроить бота, чтобы он летал, а не ползал.

[👉 Тонкая настройка и Конфигурация](/docs/config)