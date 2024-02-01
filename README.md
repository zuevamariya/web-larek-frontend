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
- Экземпляр класса имеет свойства: 
    *baseUrl*(тип string) - базовый URL для запросов к API;  
    *options*(тип RequestInit) = {}, параметры запроса для fetch к API, заданы по умолчанию, при передаче - включаются в options.  
- Методы (все возвращают Promise<object>):  
    **protected handleResponse** - обрабатывает ответы API, если статус ok - парсит и возвращает JSON-ответ, иначе - сообщение об ошибке;  
    **get** - выполняет HTTP-запрос к серверу(метод GET), и с помощью метода handleResponse() обрабатывает ответ;  
    **post** - выполняет HTTP-запрос к серверу(метод по умолчанию POST, но можно передать любой из перечисленных в типе ApiPostMethods - POST, PUT, DELETE), и с помощью метода handleResponse() обрабатывает ответ.

### 2) Класс EventEmitter 
- Экземпляр класса имеет свойства:
    *_events*: Map<EventName, Set<Subscriber>>, которое представляет собой коллекцию, где ключом является
    название события (type EventName = string | RegExp), а значением выступает коллекция уникальных значений - множество функций-подписчиков Set<Subscriber>(type Subscriber = Function).
- Методы (ничего не возвращают):  
    **on** - проверяет существует ли множество функций-подписчиков для переданного события, если нет - создается новое множество, если существет, то в него добавляется переданная функция-подписчик;  
    **off** - удаляет для переданного события переданную функцию-подписчик(callback), если для события отсутствуют функции-подписчики - событие удаляется;  
    **emit** - вызывает все функции-подписчики с аргументами в виде переданных данных(data), если название события совпадает с переданным;  
    **onAll** - осуществляет добавление переданной функции-подписчика к каждому событию в коллекции;  
    **offAll** - очищает коллекцию подписчиков и событий, путем создания новой - пустой;  
    **trigger** - возвращает функцию, у которой для переданного события будут вызваны функции-подписчики с данными, переданными ей в качестве аргумента.

### 3) Абстрактный класс Component  
- Экземпляр дочернего класса должен иметь свойство *container*: HTMLElement;
- Методы (ничего не возвращают, кроме render: HTMLElement):  
    **toggleClass** - переключает переданный класс у переданного элемента;  
    **protected setText** - устанавливает у переданного элемента текстовое содержимое переданного значения;  
    **protected setImage** - устанавливает переданному элементу изображение с описанием;  
    **setDisabled** - меняет состояние блокировки у переданного элемента в зависимости от переданного состояния;  
    **protected setHidden** - скрывает переданный элемент, меняя CSS свойство;  
    **protected setVisible** - показывает переданный элемент, меняя CSS свойство;    
    **render** - возвращает DOM-элемент(отображение элемента).

### 4) Абстрактный класс Model
- Экземпляр дочернего класса содержит данные о модели;
- Методы (ничего не возвращают):  
    **emitChanges** - вызов всех функций-подписчиков для переданного события, с возможностью передачи этим функциям данных.

## Общие классы:

### 1) Класс Basket
- Наследуется от класса *Component*, является корзиной с товарами, использует интерфейс *IBasketView*(массив HTML-элементов - товары, общая сумма товаров - число, массив строк - идентификаторов товаров в корзине). При инифиализации в конструкторе найдены DOM-элементы - массив товаров, итоговая стоимость, кнопка оформить заказ. При нажатии на кнопку "Оформить" - генерация события(открытие модального окна с видом оплаты и адресом).В классе есть сеттеры для установки значения каждого свойства:
    **set items** - если массив товаров пуст - надпись "Корзина пуста", иначе заполняется массив товаров;
    **set total** - устанавливается значение общей суммы товаров корзины;
    **set selected** - если товаров нет, будет заблокирована кнопка оформления заказа.

### 2) Класс Form
- Наследуется от класса *Component*, является формой заполнения данных для оформления заказа, использует интерфейс *IFormState*(состояние валидации - булево значение, массив строк - ошибки). При инифиализации в конструкторе найдены DOM-элементы - кнопка отправки формы, span с текстом ошибки, в случае ее возникновения и инициализирован сам контейнер - форма.
- Методы:
    **protected onInputChange** - генерирует событие изменения полей формы, с передачей актуальных данных;
    **set valid** - сеттер для блокировки кнопки, если в поле нет данных;
    **set errors** - сеттер для установки текстового значения ошибки;
    **render** - обновляет валидацию для формы.
Также в конструкторе два слушаетля у контейнера, один при изменении в поле ввода генерирует событие изменения полей формы, второй при нажатии на кнопку отправки формы генерирует событие отправки формы.

### 3) Класс Modal
- Наследуется от класса *Component*, является модальным окном, использует интерфейс *IModalData*(контент - HTML-элемент). При инифиализации в конструкторе найдены DOM-элементы - кнопка закрытия модального окна, его контент и инициализирован сам контейнер - модальное окно. Навешаны слушатели на кнопку закрытия - при клике закрывает модальное окно(метод класса - close()), при клике вне контейнера аналогично с кнопкой закрытия, на контент модального окна, для того, чтобы при клике в нем, предотвратить закрытие модального окна.
- Методы:
    **set content** - сеттер для установки передаваемого значения содержимому модального окна;
    **open** - добавляет класс 'modal_active' и генерирует событие открытия модального окна;
    **close** - удаляет класс 'modal_active', содержимое модального окна удаляет, генерирует событие закрытия модального окна;
    **render** - обновляет содержимое модального окна и открывает его.

### 4) Класс Success
- Наследуется от класса *Component*, является модальным окном содержащим информацию об оформленном заказе, использует интерфейс *ISuccess*(стоимость оформленного заказа - число). При инифиализации в конструкторе найдены DOM-элементы - кнопка "За новыми покупками!" и абзац с информацией об оформленном заказе(на какую сумму он был совершен) и инициализирован сам контейнер - модальное окно. На кнопке слушатель, при клике на нее, сработает функция(интерфейс - ISuccessActions), переданная при создании экземпляра данного класса. Также в классе есть сеттер **set total** для установки значения стоимости соверщенной покупки.

## Классы предметной области

### 1) Класс Card(карточки каталога)
- Наследуется от класса *Component*, использует интерфейс *ICard*(название, изображение, категория, стоимость(и числовое), описание - строковые и кнопка - HTMLButtonElement). При инифиализации в конструкторе найдены DOM-элементы - название, изображение, категория, стоимость, описание, кнопка и инициализирован сам контейнер - карточка. Добавляется обработчик клика к кнопке, при ее наличие, иначе к контейнеру - сработает функция(интерфейс - *ICardActions*). Также для названия, изображения, стоимости, описания и категории в классе есть сеттеры. Для категорий в карточках установлены разлтичные цвета, в зависимости от наименования, поэтому создан специальный метод **getCategory**, с помощью которого можно вернуть нужное название класса и в сеттере установить для эелемента. Еще один метод **blockedButton** - который при наличии кнопки в карте блокирует ее и меняет название, это сделано для карточек, которые имеют нулевую стоимость, чтобы пользователь не мог их купить, добавив в корзину и сообщить ему об этом.

### 2) Класс CardBasket(карточки корзины)
- Наследуется от класса *Component*, использует интерфейс *ICardBasket*(название, стоимость(и числовое), индекс - строковые и кнопка - HTMLButtonElement). При инифиализации в конструкторе найдены DOM-элементы - название, стоимость, индекс, кнопка и инициализирован сам контейнер - карточка. Добавляется обработчик клика к кнопке - сработает функция(интерфейс - *ICardActions*). Также для названия, индекса и стоимости в классе есть сеттеры.

### 3) Класс Page(главная страница)
- Наследуется от класса *Component*, использует интерфейс *IPage*(количество товаров - число, каталог - массив карточек HTML-элементов, состояние блокировки - булево значение). При инифиализации в конструкторе найдены DOM-элементы - количество товаров, галерея товаров, страница, корзина и инициализирован сам контейнер - страница. Обработчик клика у символа корзины, при нажатии - генерируется событие открытия модального окна корзины. Также сеттеры для изменения количества товаров у ярлыка, содержимого каталога и состояние блокировки страницы.

### 4) Класс Order(модальное окно с видом оплаты и адресом)
- Наследуется от класса *Form*, использует интерфейс *IOrderForm*(адрес - строковое значение, две кнопки вида оплаты - HTMLButtonElement и вид оплаты - тип *Pay*, содержащий два варианта(строковые значения - 'online' и 'offline')). Инициализирован контейнер и событие. Найдены DOM-элементы - кнопки, на каждую навешен обработчик клика и при указании вида оплаты, генерируется событие изменения данных для валидации, для нажатой кнопки класс "выбранной кнопки" добавляется, а у другой удаляется и устанавливается значения вида оплаты через сеттер. Также есть сеттеры для изменения значения поля ввода адреса и значения кнопки. Метод **isDisable** - для удаления класса "выбранной кнопки" и удаления значения вида оплаты.


### 5) Класс Contacts(модальное окно с контактными данными(телефон и email))
- Наследуется от класса *Form*, использует интерфейс *IContactsForm*(телефон, email - строковые значения). Инициализирован контейнер - форма и событие. Сеттеры для изменения значения полей ввода телефон и email.

### 6) Класс WebLarekAPI(запросы к серверу)
- Наследуется от класса *Api*, использует интерфейс *IWebLarekAPI*(методы - возврат массива товаров, возврат информации о конкретном товаре, оформление заказа товара). Инициализированы - URL для запросов и парметры.
- Методы(все возвращают Promise):
    **getCardList** - GET-запрос, для получения списка товаров;
    **getCardItem** - GET-запрос, для получения информации о конкретном товаре;
    **orderCard** - POST-запрос, для оформления заказа товара.

### 7) Класс CardItem(данные о товаре)
- - Наследуется от класса *Model*, использует интерфейс *ICardItem*(id, описание, изображение, название, категория - строковые и стоимость - числовое). Инициализированы - все атрибуты интерфейса, методов в классе нет.

### 8) Класс AppState(модель приложения - данные)
- Наследуется от класса *Model*, использует интерфейс *IAppState*(каталог - массив экземпляров класса CardItem, корзина - массив строковых идентификаторов(id товаров, которые были куплены), информация о заказе типа *IOrder* - объект с контактными данными, общей суммой заказа и массивом идентификаторов товаров(id) и объект типа *FormErrors*, содержащий ошибки валидации).
- Методы:
    **setCatalog** - генерирует событие вывода товаров на страницу;
    **setPreview** - генерирует событие показа полной информации товара в отдельном окне;
    **getCountLots** - возвращает количество товаров, добавленных в корзину;
    **getBasketLots** - возвращает товары, находящиеся в корзине;
    **getCatalogLots** - возвращает товары, находящиеся в галерее на странице, т.е. не добалвенные в корзину и не купленные ранее;
    **toggleOrderedCard** - добавляет/удаляет товары из корзины;
    **clearBasket** - очищает содержимое корзины, добавляет id купленных товаров в массив basket, очищает всю информацию о предыдущем сделанном заказе;
    **getTota** - выводит общую сумму товаров;
    **setOrderField** - установка значений данных о виде оплаты и адреса, запрос валидации этих значений и генерация события завершения;
    **validateOrder** - валидация значений данных о виде оплаты и адреса;
    **setContactsField** - установка значений данных телефона и email, запрос валидации этих значений и генерация события завершения;
    **validateContacts** - валидация значений данных телефона и email;