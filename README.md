# 📚 Nyagram Documentation

![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-purple?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan?style=flat-square&logo=tailwindcss)

Официальный сайт документации для фреймворка **Nyagram**.
> Важно: этот репозиторий является единственным официальным источником документации Nyagram. Копии и зеркала могут быть устаревшими.
Построен как SPA (Single Page Application) с фокусом на производительность, мгновенный поиск и удобную навигацию по API.

---

## ✨ Особенности

*   **🔍 Smart Search (MiniSearch):**
    *   Поиск по синонимам (чат = chat, айди = id).
    *   Поддержка 7 языков (RU, EN, CN, HI, ES, PT, UK).
    *   Fuzzy-поиск (исправление опечаток).
    *   Индексация контента статей и API методов.
*   **⚡ Мгновенная загрузка:**
    *   Нативный HTML-лоадер (Console Boot style).
    *   Агрессивное кэширование структуры.
*   **📖 API Reference:**
    *   Автоматическая генерация страниц классов из `api.yaml`.
    *   Синтаксическая подсветка кода (Prism).
    *   Кликабельные типы и методы.
*   **📱 Mobile First:**
    *   Адаптивная верстка.
    *   Специальная обработка длинных имен классов (`overflow-wrap`).

---

## 🛠 Запуск локально

Требуется **Node.js 18+**.

1.  **Установка зависимостей:**
    ```bash
    npm install
    ```

2.  **Запуск сервера разработки:**
    ```bash
    npm run dev
    ```
    Сайт будет доступен по адресу `http://localhost:5173`.

3.  **Сборка для продакшена:**
    ```bash
    npm run build
    ```

---

## 📂 Структура проекта

```text
public/
├── config.yaml          # Настройка меню (Sidebar) и метаданных
├── data/
│   └── api.yaml         # Сгенерированные данные API (из Java)
└── docs/                # Markdown файлы с гайдами
    ├── intro.md
    └── ...
src/
├── components/          # UI компоненты (Navbar, Search, Sidebar...)
├── pages/               # Страницы (ApiPage, DocsPage, LandingPage)
├── context/             # React Context (Settings, Theme)
├── utils/
│   └── synonyms.js      # Словарь синонимов для поиска
└── App.jsx              # Роутинг и инициализация
```

---

## 📝 Как добавить новую статью?

1.  Создайте `.md` файл в папке `public/docs/` (например, `my-guide.md`).
2.  Откройте `public/config.yaml`.
3.  Добавьте пункт в секцию `sidebar`:

```yaml
sidebar:
  - title: "Мой раздел"
    items:
      - label: "Название статьи"
        link: "/docs/my-guide" # Путь без расширения .md
```

## ⚙️ Как обновить API Reference?

API документация генерируется автоматически из Java-кода библиотеки Nyagram.

1.  В проекте `nyagram` (Java) запустите задачу Gradle:
    ```bash
    ./gradlew generateDocs
    ```
2.  Сгенерированный файл `api.yaml` будет автоматически помещен в `nyagram-docs/public/data/`.
3.  Перезагрузите сайт документации.

---

## 🎨 Темы и Настройки

Сайт поддерживает темную и светлую темы, а также сохраняет настройки пользователя в `localStorage`:
*   Выбранная тема (Dark/Light).
*   Тема подсветки кода (Dracula, VS Code, Github).
*   Настройка автоскролла.

---

<div align="center">
    Made with ❤️ for the Nyagram Community
</div>