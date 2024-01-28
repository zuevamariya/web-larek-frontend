import {Component} from "./base/Component";
import {ensureElement} from "../utils/utils";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard {
    category?: string;
    title: string;
    image?: string;
    description?: string;
    price: number | string;
    button?: HTMLButtonElement;
    id?: string;
}

export class Card extends Component<ICard> {
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _category: HTMLElement;
    protected _price: HTMLElement;
    protected _description?: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._description = container.querySelector('.card__text');
        this._button = container.querySelector('.card__button');

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', (actions.onClick));
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set category(value: string) {
        this.setText(this._category, value);
    }

    set price(value: number | string) {
        this.setText(this._price, value);
    }

    get price(): string {
        return this._price.textContent + ' синапсов' || '';
    }

    set description(value: string) {
        this.setText(this._description, value);
    }
}

export class CardPreview extends Card {
    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card_full', container, actions);
    }

}

export class CardBasket extends Card {
    constructor(container: HTMLElement, actions?: ICardActions) {
        super('card_compact', container, actions);
    }

}
