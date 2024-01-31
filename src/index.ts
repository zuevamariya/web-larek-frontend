import './scss/styles.scss';
import {WebLarekAPI} from "./components/WebLarekAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {AppState, CardItem, Catalog} from "./components/AppData";
import {Page} from "./components/Page";
import {Card, CardBasket} from "./components/Card";
import {cloneTemplate, createElement, ensureElement, formatNumber} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import {Tabs} from "./components/common/Tabs";
import {ICardItem, IContactsForm, IErrorOrderForm} from "./types";
import {Order} from "./components/Order";
import {Success} from "./components/common/Success";
import { Contacts } from './components/Contacts';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success');  //уведомление о покупке
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog'); //на главной странице в галерее
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');  //при нажатии более подробная инфа
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');  //строка товара в корзине
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');  //корзина с товарами
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');  //способ оплаты + адрес доставки
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');  //email + телефон для оплаты

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры(главная страница + модальное окно)
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса(корзина + модальное окно(вид оплаты и адрес) + модальное окно(телефон и email))
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {onClick: () => events.emit('modal:close')});

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

//Получение списка карточек с сервера и отображение их на странице
api.getCardList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });

//Открытие корзины при нажатии на иконку "Корзина" на Главной странице
events.on('basket:open', () => {
    basket.total = appData.getTotal(); //общая сумма товаров в корзине
    basket.selected = appData.order.items;//блокировка кнопки "Оформить", если нет товаров
    modal.render({
        content: basket.render()
    });
    order.isDisable();//блокировка кнопок оплаты, если случайно закрыли окно
});

//Открытие модального окна и блокировка страницы
events.on('modal:open', () => {
    page.locked = true;
});

//При закрытии модального окна - разблокировка страницы
events.on('modal:close', () => {
    page.locked = false;
});

//Вывести лоты на страницу
events.on<Catalog>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const cardCatalogItem = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('preview:changed', item)
        });//карточка каталога, с функцией открыть(нажатие на саму карточку)
        return cardCatalogItem.render({
            title: item.title,
            image: item.image,
            category: item.category,
            price: item.price !== null ? `${formatNumber(item.price)} синапсов` : 'Бесценно',
        });
    });
    page.counter = appData.getCountLots();//счетчик товаров у ярлыка корзины при открытии страницы
});

//Выбрать карточку(нажатие)
events.on('card:select', (item: ICardItem) => {
    appData.setPreview(item);
});

//В отедльном модальном окне выводится полная информация о товаре с возможностью купить
events.on('preview:changed', (item: ICardItem) => {
    if (item.price !== null) {//для карточек, с возможностью купить
        const cardPreview = new Card('card', cloneTemplate(cardPreviewTemplate), {
            onClick: () => events.emit('card:buy', item)
    })
    return modal.render({
        content: cardPreview.render({
            title: item.title,
            image: item.image,
            description: item.description,
            category: item.category,
            price: `${formatNumber(item.price)} синапсов`,
        })
    })
    } else {//для карточек, с которые нельзя купить - сообщение в консоль и закрытие карточки
        const cardPreviewNotBuy = new Card('card', cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                cardPreviewNotBuy.blockedButton();//блокировка, с указанием запрета покупки
                console.log(`"${item.title}" нельзя купить, так как данный товар бесценный`);
                console.log('Вы можете выбрать другие товары, закройте это окно и продолжайте покупки!');
                setTimeout(() => {
                    modal.close()
                }, 15000);
            }
    })
    return modal.render({
        content: cardPreviewNotBuy.render({
            title: item.title,
            image: item.image,
            description: item.description,
            category: item.category,
            price: 'Бесценно',
        })
    });
}});

//Товары корзины и ее состояние
events.on('basket:view', () => {
    basket.items = appData.getBasketLots().map((item, index) => {
        const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('card:delete', item)
        });//карточки в корзине, с функцией удалить(кнопка)
        return card.render({
            title: item.title,
            price: `${formatNumber(item.price)} синапсов`,
            index: index + 1,
        });
    });
    basket.total = appData.getTotal();//сумма товаров корзины
    basket.selected = appData.order.items;//блокировка кнопки "Оформить"
});

//Товары каталога и его состояние
events.on('catalog:view', () => {
    page.catalog = appData.getCatalogLots().map(item => {
        const cardCatalogItem = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });//карточки на страницу, с функцией открыть(сама карточка)
        return cardCatalogItem.render({
            title: item.title,
            image: item.image,
            category: item.category,
            price: item.price !== null ? `${formatNumber(item.price)} синапсов` : 'Бесценно',
        });
    });
});

//Добавление карточки в корзину
events.on('card:buy', (item: CardItem) => {
    appData.toggleOrderedCard(item.id, true); //добавили товар в корзину
    page.counter = appData.getCountLots(); //поменяли счетчик у ярлыка корзины
    modal.close() //закрыли модальное окно карточки
    events.emit('basket:view', item);
    events.emit('catalog:view', item);
})

//Удаление карточки из корзины
events.on('card:delete', (item: CardItem) => {
    appData.toggleOrderedCard(item.id, false); //удалили карточку из корзины
    events.emit('basket:view', item);
    page.counter = appData.getCountLots(); //поменяли счетчик у ярлыка корзины
    events.emit('catalog:view', item);
})

//При нажатии на кнопку "Оформить" - генерация события(открытие модального окна с видом оплаты и адресом)
events.on('order:open', () => {
    appData.order.total = appData.getTotal();
    modal.render({
        content: order.render({
            payment: null,
            address: '',
            valid: false,
            errors: []
        })
    });
});

//При нажатии "Далее" - генерация события(открытие следущего модального окна с телефоном и email)
events.on('order:submit', () => {
    modal.render({
        content: contacts.render({
            phone: '',
            email: '',
            valid: false,
            errors: []
        })
    });
});

//при нажатии "Оплатить" - отправка данных на сервер, если все ок - открытие окна о совершении покупки
events.on('contacts:submit', () => {
    console.log('данные на сервер: ', appData.order);
    api.orderCard(appData.order)
        .then((result) => {
            modal.render({
                content: success.render()
            });
            success.total = result.total;//установлена сумма покупки в окне
            appData.clearBasket();//очистка корзины, заполнен список id купленных товаров
            page.counter = appData.getCountLots(); //поменяли счетчик у ярлыка корзины
            events.emit('basket:view');
            events.emit('catalog:view');
            console.log('сумма заказа, ', success.total, result)
        })
        .catch(err => {
            console.error(err);
        });
});

// Изменилось состояние валидации формы Order
events.on('orderErrors:change', (errors: Partial<IErrorOrderForm>) => {
    const { address, payment } = errors;
    order.valid = !address && !payment;
    order.errors = Object.values({address, payment}).filter(i => !!i).join(', а также ');
});

// Изменилось одно из полей формы Order
events.on(/^order\..*:change/, (data: { field: keyof IErrorOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

// Изменилось состояние валидации формы Contacts
events.on('contactsErrors:change', (errors: Partial<IContactsForm>) => {
    const { email, phone } = errors;
    contacts.valid = !email && !phone;
    contacts.errors = Object.values({phone, email}).filter(i => !!i).join(', а также ');
});

// Изменилось одно из полей формы Contacts
events.on(/^contacts\..*:change/, (data: { field: keyof IContactsForm, value: string }) => {
    appData.setContactsField(data.field, data.value);
});