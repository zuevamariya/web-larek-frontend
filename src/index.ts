import './scss/styles.scss';

import {WebLarekAPI} from "./components/WebLarekAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {AppState, CardItem, Catalog} from "./components/AppData";
import {Page} from "./components/Page";
import {Card, CardPreview} from "./components/Card";
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import {Tabs} from "./components/common/Tabs";
import {ICardItem, IOrderForm} from "./types";
import {Order} from "./components/Order";
import {Success} from "./components/common/Success";
import { Contacts } from './components/Contacts';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success');  //уведомление о покупке
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog'); //на главной странице в галерее
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');  //при нажатии более подробная инфа
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');  //строка товара в корзине
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');  //корзина с товарами
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');  //способ оплаты + адрес доставки
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');  //email+телефон для оплаты

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events); //экземпляр маодальное окно

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);


// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно


//WebLarekAPI.ts Получение списка карточек с сервера и отображение их на странице
api.getCardList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });

//Page.ts Открытие корзины при нажатии на иконку "Корзина" на Главной странице
events.on('basket:open', () => {
    return modal.render({
        content: cloneTemplate(basketTemplate)
    });
});

//Modal.ts Открытие модального окна и блокировка страницы
events.on('modal:open', () => {
    page.locked = true;
});

//Modal.ts При закрытии модального окна - разблокировка страницы
events.on('modal:close', () => {
    page.locked = false;
});

//AppData.ts Вывести лоты на страницу
events.on<Catalog>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            category: item.category,
            price: item.price !== null ? `${item.price} синапсов` : 'Бесценно'
        });
    });

    page.counter = appData.catalog.length;
});

//intex.ts Открыть лот
events.on('card:select', (item: ICardItem) => {
    appData.setPreview(item);
});

//AppData.ts Изменен открытый выбранный лот
events.on('preview:changed', (item: ICardItem) => {
    const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
        onClick: () => events.emit('card:open', item)
    });
    return modal.render({
        content: card.render({
            title: item.title,
            image: item.image,
            description: item.description,
            category: item.category,
            price: item.price !==null ? `${item.price} синапсов` : 'Бесценно',
        })
    })
});

//Basket.ts(при нажатии на кнопку "Оформить" - генерация события(открытие модального окна с видом оплаты и адресом)
events.on('contacts:open', () => {
    modal.render({
        content: contacts.render({
            payment: 'online',
            address: '',
            valid: false,
            errors: []
        })
    });
});

//Contacts.ts(при нажатии "Далее" - генерация события(открытие следущего модального окна с телефоном и email)
events.on('order:open', () => {
    modal.render({
        content: order.render({
            phone: '',
            email: '',
            valid: false,
            errors: []
        })
    });
});


/*
// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
        const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            description: item.about,
            status: {
                status: item.status,
                label: item.statusLabel
            },
        });
    });

    page.counter = appData.getClosedLots().length;
});

// Отправлена форма заказа
events.on('order:submit', () => {
    api.orderLots(appData.order)
        .then((result) => {
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => {
                    modal.close();
                    appData.clearBasket();
                    events.emit('auction:changed');
                }
            });

            modal.render({
                content: success.render({})
            });
        })
        .catch(err => {
            console.error(err);
        });
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
    const { email, phone } = errors;
    order.valid = !email && !phone;
    order.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});

// Открыть форму заказа
events.on('order:open', () => {
    modal.render({
        content: order.render({
            phone: '',
            email: '',
            valid: false,
            errors: []
        })
    });
});

// Открыть активные лоты
events.on('bids:open', () => {
    modal.render({
        content: createElement<HTMLElement>('div', {}, [
            tabs.render({
                selected: 'active'
            }),
            bids.render()
        ])
    });
});

// Открыть закрытые лоты
events.on('basket:open', () => {
    modal.render({
        content: createElement<HTMLElement>('div', {}, [
            tabs.render({
                selected: 'closed'
            }),
            basket.render()
        ])
    });
});

// Изменения в лоте, но лучше все пересчитать
events.on('auction:changed', () => {
    page.counter = appData.getClosedLots().length;
    bids.items = appData.getActiveLots().map(item => {
        const card = new BidItem(cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('preview:changed', item)
        });
        return card.render({
            title: item.title,
            image: item.image,
            status: {
                amount: item.price,
                status: item.isMyBid
            }
        });
    });
    let total = 0;
    basket.items = appData.getClosedLots().map(item => {
        const card = new BidItem(cloneTemplate(soldTemplate), {
            onClick: (event) => {
                const checkbox = event.target as HTMLInputElement;
                appData.toggleOrderedLot(item.id, checkbox.checked);
                basket.total = appData.getTotal();
                basket.selected = appData.order.items;
            }
        });
        return card.render({
            title: item.title,
            image: item.image,
            status: {
                amount: item.price,
                status: item.isMyBid
            }
        });
    });
    basket.selected = appData.order.items;
    basket.total = total;
})

// Открыть лот
events.on('card:select', (item: LotItem) => {
    appData.setPreview(item);
});

// Изменен открытый выбранный лот
events.on('preview:changed', (item: LotItem) => {
    const showItem = (item: LotItem) => {
        const card = new AuctionItem(cloneTemplate(cardPreviewTemplate));
        const auction = new Auction(cloneTemplate(auctionTemplate), {
            onSubmit: (price) => {
                item.placeBid(price);
                auction.render({
                    status: item.status,
                    time: item.timeStatus,
                    label: item.auctionStatus,
                    nextBid: item.nextBid,
                    history: item.history
                });
            }
        });

        modal.render({
            content: card.render({
                title: item.title,
                image: item.image,
                description: item.description.split("\n"),
                status: auction.render({
                    status: item.status,
                    time: item.timeStatus,
                    label: item.auctionStatus,
                    nextBid: item.nextBid,
                    history: item.history
                })
            })
        });

        if (item.status === 'active') {
            auction.focus();
        }
    };

    if (item) {
        api.getLotItem(item.id)
            .then((result) => {
                item.description = result.description;
                item.history = result.history;
                showItem(item);
            })
            .catch((err) => {
                console.error(err);
            })
    } else {
        modal.close();
    }
});

*/