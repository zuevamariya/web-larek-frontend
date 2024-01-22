# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Базовый код:

### 1) Класс Api
- Имеет два поля: 
    readonly - baseUrl(тип string) - базовый URL для запросов к API;
    protected - options(тип RequestInit) - параметры запроса для fetch к API.
- Конструктор принимает два аргумента:
    baseUrl(тип string);
    options(тип RequestInit) = {}, заданы по умолчанию, при передаче - включаются в options.
- Методы:
    **protected handleResponse**(response: Response): Promise<object> - обрабатывает ответы API, если статус ok - парсит и возвращает JSON-ответ, иначе - сообщение об ошибке;
    **get**(uri: string): Promise<object> - выполняет HTTP-запрос к серверу(метод GET), и с помощью метода handleResponse() обрабатывает ответ;
    **post**(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object> - выполняет HTTP-запрос к серверу(метод по умолчанию POST, но можно передать любой из перечисленных в типе ApiPostMethods - POST, PUT, DELETE), и с помощью метода handleResponse() обрабатывает ответ;

### 2) Класс EventEmitter 
реализует интерфейс IEvents, который содержит 3 метода - on(подписка на событие), emit(генерация события), trigger(возврат функции обратного вызова для события)
- Имеет защищенное поле - _events: Map<EventName, Set<Subscriber>>, которое представляет собой коллекцию, где ключом является название события (type EventName = string | RegExp), а значением выступает коллекция уникальных значений - множество функций-подписчиков Set<Subscriber>(type Subscriber = Function).
- Конструктор не принимает аргументов, в нем происходит инициализация _events путем создания пустой коллекции Map, для хранения названий событий и их функций-подписчиков.
- Методы:
    **on**(eventName: EventName, callback: (event: T) => void):void  - проверяет существует ли множество функций-подписчиков для переданного события, если нет - создается новое множество, если существет, то в него добавляется переданная функция-подписчик(callback);
    **off**(eventName: EventName, callback: Subscriber): void - удаляет для переданного события переданную функцию-подписчик(callback), если для события отсутствуют функции-подписчики - событие удаляется;
    **emit**(eventName: string, data?: T): void - вызывает все функции-подписчики с аргументами в виде переданных данных(data), если название события совпадает с переданным;
    **onAll**(callback: (event: EmitterEvent) => void): void - осуществляет добавление переданной функции-подписчика к каждому событию в коллекции;
    **offAll**(): void - очищает коллекцию подписчиков и событий, путем создания новой пустой;
    **trigger**(eventName: string, context?: Partial<T>): void - возвращает функцию, у которой для переданного события будут вызваны функции-подписчики с данными, переданными ей в качестве аргумента.

### 3) Абстрактный класс Component
- Конструктор является защищенным, в качестве аргумента принимает защищенный только для чтения container: HTMLElement;
- Методы:
    **toggleClass**(element: HTMLElement, className: string, force?: boolean): void - переключает переданный класс у переданного элемента;
    **protected setText**(element: HTMLElement, value: unknown): void - устанавливает у переданного элемента текстовое содержимое строкового формата для переданного значения;
    **setDisabled**(element: HTMLElement, state: boolean): void - меняет состояние блокировки у переданного элемента в зависимости от переданного состояния;
    **protected setHidden**(element: HTMLElement): void - скрывает переданный элемент, меняя CSS свойство;
    **protected setVisible**(element: HTMLElement): void - показывает переданный элемент, меняя CSS свойство;
    **protected setImage**(element: HTMLImageElement, src: string, alt?: string): void - устанавливает переданному элементу изображение с описанием;
    **render**(data?: Partial<T>): HTMLElement - возвращает DOM-элемент(отображение элемента);

### 4) Абстрактный класс Model
- Конструктор принимает 2 аргумента, при инициализации происходит копирование данных - data в объект или их перезапись при дублировании:
    data: Partial<T> - данные типа T;
    protected events: IEvents - событие соответствующее интерфесу IEvents;
- Методы:
    **emitChanges**(event: string, payload?: object): void - вызов всех функций-подписчиков для переданного события, с возможностью передачи этим функциям данных.

