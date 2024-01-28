import {Form} from "./common/Form";
import {IContactsForm, Pay} from "../types";
import {IEvents} from "./base/events";
import {ensureElement} from "../utils/utils";

export class Contacts extends Form<IContactsForm> {
    protected _buttonCard: HTMLButtonElement;
    protected _buttonCash: HTMLButtonElement;
    protected _payment: Pay;
    protected _buttonOrder: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._buttonCard = container.querySelector('[name="card"]');
        this._buttonCash = container.querySelector('[name="cash"]');
        this._buttonOrder = container.querySelector('[type="submit"]');

        if (this._buttonCard) {
            this._buttonCard.addEventListener('click', () => {
                this._payment = 'online';
            });
        }
        
        if (this._buttonCard) {
            this._buttonCash.addEventListener('click', () => {
                this._payment = 'offline';
            });
        }
        
        if (this._buttonCard) {
            this._buttonOrder.addEventListener('click', () => {
                events.emit('order:open');
            });
        }
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}