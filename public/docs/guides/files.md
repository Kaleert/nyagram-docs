# 📁 Работа с файлами и Медиа

Текст — это скучно. Давай научим бота отправлять картинки, видео и документы.

В Nyagram для этого есть универсальный объект `InputFile` и готовые методы в клиенте.

## Отправка медиа

### 1. Отправка по File ID (Самый быстрый способ)
Если файл уже есть на серверах Telegram (ты отправлял его раньше), используй его `file_id`. Это мгновенно и не тратит трафик.

```java
@CommandHandler("cat")
public void sendCat(CommandContext ctx) {
    // ID файла, который мы узнали ранее
    String fileId = "AgACAgIAAxkDAA..."; 
    
    SendPhoto msg = SendPhoto.withFileId(ctx.getChatId(), fileId);
    msg.setCaption("Это кот из кэша Telegram 😺");
    
    ctx.getClient().execute(msg);
}
```

### 2. Отправка файла с диска
Если файл лежит у тебя на сервере.

```java
@CommandHandler("report")
public void sendReport(CommandContext ctx) {
    File file = new File("/var/data/report.pdf");
    
    SendDocument doc = SendDocument.withFile(ctx.getChatId(), file);
    doc.setCaption("Ваш отчет за месяц 📊");
    
    ctx.getClient().execute(doc);
}
```

### 3. Отправка из InputStream (Генерация на лету)
Идеально, если ты генерируешь файл в коде (например, CSV или картинку) и не хочешь сохранять его на диск.

```java
@CommandHandler("csv")
public void generateCsv(CommandContext ctx) {
    String csvData = "Name,Age\nAlice,25\nBob,30";
    // Превращаем строку в поток байтов
    InputStream stream = new ByteArrayInputStream(csvData.getBytes());
    
    SendDocument doc = SendDocument.withStream(
        ctx.getChatId(), 
        stream, 
        "users.csv" // Обязательно укажи имя файла с расширением!
    );
    
    ctx.getClient().execute(doc);
}
```

## Скачивание файлов

А что если пользователь прислал тебе фото или документ?

1.  Получи `file_id` из апдейта.
2.  Используй `FileService` (встроен в Nyagram).

```java
@Component
@RequiredArgsConstructor
public class PhotoHandler {

    private final FileService fileService; // Внедряем сервис

    @NyagramEventHandler(EventType.MESSAGE)
    public void onPhoto(CommandContext ctx) {
        if (!ctx.getMessage().get().hasPhoto()) return;

        // Берем фото в лучшем качестве (последнее в массиве)
        String fileId = ctx.getMessage().get().getBestPhotoId();
        
        // Куда сохранить
        Path destination = Paths.get("downloads", "photo_" + System.currentTimeMillis() + ".jpg");

        // Скачиваем асинхронно
        fileService.downloadFile(fileId, destination)
            .thenAccept(path -> {
                ctx.reply("✅ Фото сохранено: " + path.getFileName());
            })
            .exceptionally(ex -> {
                ctx.reply("❌ Ошибка скачивания: " + ex.getMessage());
                return null;
            });
    }
}
```

## Альбомы (Media Group)

Чтобы отправить несколько фото как один альбом:

```java
@CommandHandler("album")
public void sendAlbum(CommandContext ctx) {
    SendMediaGroup group = SendMediaGroup.builder()
            .chatId(ctx.getChatId().toString())
            // Добавляем фото
            .addPhoto(new InputFile(new File("cat1.jpg")), "Кот 1")
            .addPhoto(new InputFile(new File("cat2.jpg")), "Кот 2")
            // Можно смешивать с видео
            .addVideo(new InputFile(new File("cat_video.mp4")), "Видео с котом")
            .build();

    ctx.getClient().execute(group);
}
```

Теперь твой бот — настоящий медиа-комбайн!