import {Component} from "./base/component";
import {ensureElement, formatNumber} from "../utils/utils";
import {ICardActions, ICard, ICardBasket} from "../types";

export class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;
    protected _description: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
        this._image = ensureElement<HTMLImageElement>(`.${blockName}__image`, container);
        this._category = ensureElement<HTMLElement>(`.${blockName}__category`, container);
        this._price = ensureElement<HTMLElement>(`.${blockName}__price`, container);
        this._description = container.querySelector(`.${blockName}__text`);
        this._button = container.querySelector(`.${blockName}__button`);

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', (actions.onClick));
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set price(value: number | null) {
        this.setText(this._price, value);
    }
    
    set description(value: string) {
        this.setText(this._description, value);
    }

    set category(value: string) {
        this.setText(this._category, value);
        this.toggleClass(this._category, `card__category_${this.getCategory(value)}`)
    }

    getCategory(value: string): string {
        switch (value) {
            case 'софт-скил':
                return 'soft';
            case 'хард-скил':
                return 'hard';
            case 'кнопка':
                return 'button';
            case 'дополнительное':
                return 'additional';
            default: 'другое'
                return 'other';
        }
    }

    blockedButton() {
        if (this._button) {
            this.setDisabled(this._button, true);
            this.setText(this._button, 'Запрещено!')
            console.log('Данный товар нельзя купить, так как он бесценный. \nВы можете выбрать другие товары. \nЗакройте это окно и продолжайте покупки! \nИли оно закроется само, спустя 10 секунд.');
        }
    }
}

export class CardBasket extends Component<ICardBasket> {
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _index: HTMLElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._button = container.querySelector('.card__button');
        this._index = container.querySelector('.basket__item-index');

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', (actions.onClick));
            }
        }
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number | string) {
        this.setText(this._price, value);
    }

    set index(value: number) {
        this._index.textContent = String(value);
    }
}