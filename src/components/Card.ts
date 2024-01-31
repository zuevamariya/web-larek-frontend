import {Component} from "./base/Component";
import {ensureElement, formatNumber} from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard {
    category: string;
    title: string;
    image: string;
    description?: string;
    price: number | string;
    button?: HTMLButtonElement;
    id: string;
}

export class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;
    protected _description?: HTMLElement;
    protected _button?: HTMLButtonElement;
    protected _id: string;

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

    blockedButton() {
        this.setDisabled(this._button, true);
        this.setText(this._button, 'Запрещено!')
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    categoryColor(value: string): string {
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
    
    set category(value: string) {
        this.setText(this._category, value);
        this.toggleClass(this._category, `card__category_${this.categoryColor(value)}`)
    }

    set price(value: number | null) {
        this.setText(this._price, value);
    }
    
    set description(value: string) {
        this.setText(this._description, value);
    }
}

export interface ICardBasket {
    title: string;
    price: number | string;
    button: HTMLButtonElement;
    id: string;
    index: number;
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
            } else {
                container.addEventListener('click', actions.onClick);
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