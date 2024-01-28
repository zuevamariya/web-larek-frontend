import _ from "lodash";
import {Model} from "./base/Model";
import {ICardItem, FormErrors, IAppState, IOrder, IValidityForm} from "../types";

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
    catalog: ICardItem[];
    basket: string[];
    preview: string | null;
    order: IOrder = {
        payment: 'online',
        email: '',
        phone: '',
        address: '',
        total: 0,
        items: []
    };
    formErrors: FormErrors = {};

    toggleOrderedCard(id: string, isIncluded: boolean) { //добавление/удаление товара из корзины
        if (isIncluded) {
            this.order.items = _.uniq([...this.order.items, id]);
        } else {
            this.order.items = _.without(this.order.items, id);
        }
    }

    clearBasket() {  //очистка корзины
        this.order.items.forEach(id => {
            this.toggleOrderedCard(id, false);
        });
    }

    getTotal() {  //вывод суммы товаров
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setCatalog(items: ICardItem[]) {  //вывод товаров на страницу
        this.catalog = items.map(item => new CardItem(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    getLots(): ICardItem[] {  //возврат каталога карточек
        return this.catalog;
    }

    setPreview(item: ICardItem) {  //предварительный просмотр для указанной карточки
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setOrderField(field: keyof IValidityForm, value: string) {  //устанавка значения в поле ввода
        this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }

    validateOrder() {  //валидация обязательных полей для оплаты и кнопки
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        if (!this.order.payment) {
            errors.address = 'Необходимо указать вид оплаты';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}