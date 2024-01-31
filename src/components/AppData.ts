import _ from "lodash";
import {ICardItem, FormErrors, IAppState, IOrder, IValidityOrderForm, IValidityContactsForm} from "../types";
import {Model} from "../components/base/Model"

export type Catalog = {
    catalog: ICardItem[]
};

export class CardItem extends Model<ICardItem> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;
}

export class AppState extends Model<IAppState> {
    catalog: CardItem[];
    basket: string[] = [];
    order: IOrder = {
        payment: '',
        email: '',
        phone: '',
        address: '',
        total: 0,
        items: []
    };
    formErrors: FormErrors = {};

    setCatalog(items: ICardItem[]) {  //вывод товаров на страницу
        this.catalog = items.map(item => new CardItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
        console.log('Массив карточек, полученных с сервера: ', items)
    }

    setPreview(item: ICardItem) {  //предварительный просмотр для указанной карточки
        this.emitChanges('preview:changed', item);
    }

    getCountLots(): number {  //возврат количества товаров в корзине
        return this.order.items.length;
    }

    getBasketLots(): CardItem[] { //вывод товаров, добавленных в корзину
        return this.catalog
            .filter(item => this.order.items.includes(item.id) && !this.basket.includes(item.id));
    }

    getCatalogLots(): CardItem[] { //вывод товаров галереи
        return this.catalog
            .filter(item => !this.order.items.includes(item.id) && !this.basket.includes(item.id));
    }

    toggleOrderedCard(id: string, isIncluded: boolean) { //добавление/удаление товара из корзины
        if (isIncluded) {
            this.order.items = _.uniq([...this.order.items, id]);
            console.log('добавлена в корзину: ', id)
            console.log('всего в корзине: ', this.order.items.length)
        } else {
            this.order.items = _.without(this.order.items, id);
            console.log('убрана из корзины: ', id)
            console.log('всего в корзине: ', this.order.items.length)
        }
    }

    clearBasket() {  //очистка корзины
        this.order.items.forEach(id => {
            this.basket.push(id);
            this.toggleOrderedCard(id, false);
        });
        console.log('очистка корзины, количество товаров в ней: ', this.order.items.length)
        console.log('купленные товары: ', this.basket)
    }

    getTotal() {  //вывод суммы товаров
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setOrderField(field: keyof IValidityOrderForm, value: string) {//установка значений и генерация события
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {//валидация
        const errors: typeof this.formErrors = {};

        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }

        if (!this.order.payment) {
            errors.payment = 'Необходимо указать вид оплаты';
        }

        this.formErrors = errors;
        this.events.emit('orderErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    setContactsField(field: keyof IValidityContactsForm, value: string) {
        this.order[field] = value;

        if (this.validateContacts()) {
            this.events.emit('contacts:ready', this.order);
        }
    }

    validateContacts() {
        const errors: typeof this.formErrors = {};

        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }

        this.formErrors = errors;
        this.events.emit('contactsErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}