const CONCEPTS = {
  // === СУЩНОСТИ (ENTITIES) ===
  "id": [
    "id", "uuid", "key", "identifier", // EN
    "айди", "ид", "идентификатор", "номер", "код", // RU
    "айді", "ідентифікатор", // UK
    "标识符", "身份", "id", // CN
    "आईडी", "पहचान", // HI (Hindi)
    "identificación", "identificador", // ES
    "identificação" // PT
  ],
  "chat": [
    "chat", "group", "channel", "conversation", "dialog", "dm", // EN
    "чат", "группа", "беседа", "канал", "личка", "лс", // RU
    "чат", "група", "бесіда", // UK
    "聊天", "对话", "群组", "频道", // CN
    "चैट", "बातचीत", "समूह", // HI
    "chat", "conversación", "grupo", // ES
    "bate-papo", "conversa" // PT
  ],
  "user": [
    "user", "member", "participant", "admin", "client", "person", // EN
    "юзер", "пользователь", "участник", "человек", "клиент", "админ", // RU
    "користувач", "учасник", // UK
    "用户", "成员", // CN
    "उपयोगकर्ता", "सदस्य", // HI
    "usuario", "miembro", // ES
    "usuário", "membro" // PT
  ],
  "message": [
    "message", "text", "post", "sms", "content", "msg", // EN
    "сообщение", "текст", "письмо", "пост", "смс", // RU
    "повідомлення", "лист", // UK
    "消息", "文本", "帖子", // CN
    "संदेश", "मैसेज", // HI
    "mensaje", "texto", // ES
    "mensagem", "texto" // PT
  ],
  "bot": [
    "bot", "robot", "agent", "app", // EN
    "бот", "робот", // RU/UK
    "机器人", // CN
    "बोट", "रोबोट", // HI
    "robot" // ES/PT
  ],
  "keyboard": [
    "keyboard", "button", "markup", "menu", "reply", "inline", // EN
    "клавиатура", "клава", "кнопка", "кнопки", "меню", // RU
    "клавіатура", "кнопка", // UK
    "键盘", "按钮", "菜单", // CN
    "कीबोर्ड", "बटन", "मेनू", // HI
    "teclado", "botón", "menú", // ES
    "teclado", "botão" // PT
  ],
  "file": [
    "file", "document", "doc", // EN
    "файл", "документ", "док", // RU/UK
    "文件", "文档", // CN
    "फ़ाइल", "दस्तावेज़", // HI
    "archivo", "documento", // ES
    "arquivo" // PT
  ],

  // === ДЕЙСТВИЯ (ACTIONS) ===
  "get": [
    "get", "find", "retrieve", "fetch", "return", "check", // EN
    "получить", "узнать", "взять", "найти", "вернуть", "проверить", // RU
    "отримати", "знайти", // UK
    "获取", "获得", // CN
    "प्राप्त", "लाओ", // HI
    "obtener", "conseguir", // ES
    "obter", "pegar" // PT
  ],
  "send": [
    "send", "write", "post", "dispatch", "reply", // EN
    "отправить", "послать", "выслать", "написать", "ответить", // RU
    "надіслати", "відправити", // UK
    "发送", "寄", // CN
    "भेजें", "send", // HI
    "enviar", "mandar", // ES
    "enviar" // PT
  ],
  "edit": [
    "edit", "change", "update", "modify", "set", // EN
    "изменить", "редактировать", "обновить", "поменять", "сменить", "установить", // RU
    "змінити", "редагувати", // UK
    "编辑", "修改", // CN
    "संपादित", "बदलें", // HI
    "editar", "cambiar", // ES
    "editar", "alterar" // PT
  ],
  "delete": [
    "delete", "remove", "clear", "erase", "ban", "kick", // EN
    "удалить", "убрать", "стереть", "очистить", "снести", "забанить", // RU
    "видалити", "прибрати", // UK
    "删除", "移除", // CN
    "हटाएं", "डिलीट", // HI
    "eliminar", "borrar", // ES
    "excluir", "apagar" // PT
  ],
  "create": [
    "create", "make", "add", "new", "build", "generate", // EN
    "создать", "сделать", "добавить", "новый", "сгенерировать", // RU
    "створити", "додати", // UK
    "创建", "新建", // CN
    "बनाएं", "नया", // HI
    "crear", "hacer", // ES
    "criar", "fazer" // PT
  ]
};

const ENRICHMENT_MAP = {};

Object.entries(CONCEPTS).forEach(([key, synonyms]) => {
    const allWords = [key, ...synonyms].join(' ');
    
    [key, ...synonyms].forEach(word => {
        ENRICHMENT_MAP[word.toLowerCase()] = allWords;
    });
});

export const enrichText = (text) => {
    if (!text) return "";
    
    const tokens = text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase()
        .split(/[\s,._-]+/);

    const enriched = new Set(tokens);

    tokens.forEach(token => {
        const synonyms = ENRICHMENT_MAP[token];
        if (synonyms) {
            synonyms.split(' ').forEach(s => enriched.add(s));
        }
    });

    return Array.from(enriched).join(' ');
};