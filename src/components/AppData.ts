import _ from "lodash";
import {ICardItem, FormErrors, IAppState, IOrder, IValidityOrderForm, IContactsForm} from "../types";
import {Model} from "./base/model"

export class CardItem extends Model<ICardItem> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;
}

export class AppState extends Model<IAppState> {
    catalog: ICardItem[];
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

    setCatalog(items: ICardItem[]) {
        this.catalog = items;
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    setPreview(item: ICardItem) {
        this.emitChanges('preview:changed', item);
    }

    getCountLots(): number {
        return this.order.items.length;
    }

    getBasketLots(): ICardItem[] {
        return this.catalog
            .filter(item => this.order.items.includes(item.id) && !this.basket.includes(item.id));
    }

    getCatalogLots(): ICardItem[] {
        return this.catalog
            .filter(item => !this.order.items.includes(item.id) && !this.basket.includes(item.id));
    }

    toggleOrderedCard(id: string, isIncluded: boolean) {
        if (isIncluded) {
            this.order.items = _.uniq([...this.order.items, id]);
        } else {
            this.order.items = _.without(this.order.items, id);
        }
    }

    clearBasket() {
        this.order.items.forEach(id => {
            this.basket.push(id);
            this.toggleOrderedCard(id, false);
        });
        this.order.payment = '';
        this.order.address = '';
        this.order.email = '';
        this.order.phone = '';
        this.order.total = 0;
    }

    getTotal() {
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setOrderField(field: keyof IValidityOrderForm, value: string) {
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        const addressPattern = /^[а-яА-ЯёЁa-zA-Z0-9\s\/.,-]{20,}$/;

        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        } else if (!addressPattern.test(this.order.address)) {//данная ошибка в консоли выдается не зависимо от проверок регулярными выражениями
            errors.address = 'Адрес должен содержать только буквы, цифры, пробелы, точки, запятые и "/", и быть не менее 20 символов';//добавила запятую
        }
    

        if (!this.order.payment) {
            errors.payment = 'Необходимо указать вид оплаты';
        }

        this.formErrors = errors;
        this.events.emit('orderErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    setContactsField(field: keyof IContactsForm, value: string) {
        this.order[field] = value;

        if (this.validateContacts()) {
            this.events.emit('contacts:ready', this.order);
        }
    }

    validateContacts() {
        const errors: typeof this.formErrors = {};
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phonePattern = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;

        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        } else if (!emailPattern.test(this.order.email)) {
            errors.email = 'Некорректный адрес электронной почты';
        }

        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        } else if (!phonePattern.test(this.order.phone)) {
            errors.phone = 'Телефон должен быть указан в таком формате: +7(XXX)XXX-XX-XX';
        }

        this.formErrors = errors;
        this.events.emit('contactsErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}