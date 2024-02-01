import {Form} from "./common/Form";
import {IOrderForm, Pay} from "../types/index";
import {IEvents} from "./base/events";

export class Order extends Form<IOrderForm> {
    protected _buttonCard: HTMLButtonElement;
    protected _buttonCash: HTMLButtonElement;
    protected _payment: Pay;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._buttonCard = container.querySelector('[name="card"]');
        this._buttonCash = container.querySelector('[name="cash"]');

        if (this._buttonCard) {
            this._buttonCard.addEventListener('click', () => {
                const field = 'payment';
                const value = 'online';
                this.events.emit(`${this.container.name}.${'card'}:change`, {
                    field,
                    value
                });
                this.payment = value;
                this._buttonCard.classList.add('button_alt-active');
                this._buttonCash.classList.remove('button_alt-active');
            });
        }
        
        if (this._buttonCash) {
            this._buttonCash.addEventListener('click', () => {
                const field = 'payment';
                const value = 'offline';
                this.events.emit(`${this.container.name}.${'cash'}:change`, {
                    field,
                    value
                });
                this.payment = value;
                this._buttonCash.classList.add('button_alt-active');
                this._buttonCard.classList.remove('button_alt-active');
            });
        }
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    set payment(value: Pay) {
        this._payment = value;
    }

    isDisable() {
        this._buttonCard.classList.remove('button_alt-active');
        this._buttonCash.classList.remove('button_alt-active');
        const field = 'payment';
                const value = '';
                this.events.emit(`${this.container.name}.${'cash'}:change`, {
                    field,
                    value
                });
    }
}