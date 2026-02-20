# 📦 Установка и Настройка

Прежде чем мы начнем творить магию, нужно подготовить наш "алтарь" — среду разработки. Не бойся, жертвы приносить не придется (разве что немного оперативной памяти для IntelliJ IDEA).

## 🛠 Что нам понадобится?

Убедись, что у тебя есть этот джентльменский набор:

1.  **Java 21**. Да, именно 21. Nyagram — современная библиотека и использует все фишки свежей Java (Virtual Threads, Records, Pattern Matching). Если у тебя старая версия — [обновись](https://adoptium.net/).
2.  **IntelliJ IDEA**. Можно [Community Edition](https://www.jetbrains.com/idea/download/) (бесплатно и круто).
3.  **Telegram Аккаунт**. Ну, тут всё понятно.

## Шаг 1. Создаем проект

Самый простой способ начать — использовать **Spring Initializr**. Это такой конструктор, который соберет для тебя пустой проект.

1.  Заходи на [start.spring.io](https://start.spring.io/).
2.  Выбирай настройки как настоящие профи:
    *   **Project:** Gradle - Groovy (или Maven, если ты старовер).
    *   **Language:** Java.
    *   **Spring Boot:** 3.2.x (или новее).
    *   **Packaging:** Jar.
    *   **Java:** 21.
3.  В разделе **Dependencies** (справа) добавь:
    *   `Lombok` (чтобы не писать геттеры и сеттеры вручную).
    *   `Spring Web` (нужен для работы вебхуков и самого контекста).
4.  Жми **GENERATE**, качай архив, распаковывай и открывай в IDEA.

## Шаг 2. Добавляем Nyagram

Теперь самое главное — внедрить **Nyagram** в твой проект.

Открой файл `build.gradle` (или `pom.xml`, если выбрал Maven) и добавь библиотеку в зависимости.

### Для Gradle (build.gradle)

```groovy
repositories {
    mavenCentral()
}

dependencies {
    // Базовая зависимость Spring Boot
    implementation 'org.springframework.boot:spring-boot-starter-web'
    
    // Магия Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    implementation 'io.github.kaleert:nyagram:1.1.2'
}
```

### Для Maven (pom.xml)

Если ты выбрал Maven, добавь это в блок `<dependencies>`:

```xml
<dependency>
    <groupId>io.github.kaleert</groupId>
    <artifactId>nyagram</artifactId>
    <version>1.1.2</version>
</dependency>
```

> 💡 **Совет:** Не забудь нажать кнопку **Load Gradle Changes** (слоник в IDEA), чтобы библиотека скачалась.

## Шаг 3. Получаем "Паспорт" бота

Чтобы твой код мог управлять ботом, ему нужен Токен. Его выдает **BotFather** — главный бот в Telegram.

1.  Открой Telegram и найди [@BotFather](https://t.me/BotFather).
2.  Напиши ему `/newbot`.
3.  Придумай имя (например, `Nyagram Test Bot`).
4.  Придумай юзернейм (должен оканчиваться на `bot`, например `MySuperNyagramBot`).
5.  В ответ он пришлет тебе **Токен** (длинная строка с цифрами и буквами). **Береги его!** Это ключ от твоего бота.

## Шаг 4. Конфигурация

Nyagram любит порядок. Давай расскажем библиотеке, кто наш бот.

Найди файл `src/main/resources/application.yml` (если там `application.properties`, лучше переименуй в `.yml` — это стильнее и удобнее).

Вставь туда эти настройки:

```yaml
server:
  port: 8080 # Порт, на котором будет висеть приложение

nyagram:
  # Токен, который дал BotFather
  bot-token: "123456789:ABCDefGhIjkLmnOpQrStUvWxYz" 
  
  # Юзернейм бота (без @)
  bot-username: "MySuperNyagramBot"
  
  # Режим работы:
  # POLLING - бот сам ходит на сервера Telegram и спрашивает "есть чё?" (Идеально для старта)
  # WEBHOOK - Telegram сам стучится к тебе (Нужен белый IP или домен)
  mode: POLLING 
  
  # Настройки производительности (можно оставить по умолчанию)
  worker-thread-count: 10
```

## 🎉 Всё готово!

Ты великолепен! Ты подготовил фундамент. Теперь у тебя есть Spring-приложение, которое знает о существовании Nyagram.

Если ты сейчас запустишь проект (зеленый треугольник в IDEA), то... ничего не произойдет, кроме логов в консоли. И это хорошо! Ошибок нет — значит, мы готовы писать код.

В следующей главе мы оживим нашего Франкенштейна и научим его здороваться.

[👉 Пишем первого бота](/docs/first-bot)