//Basket.ts
export interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: string[];
}

//Form.ts
export interface IFormState {
    valid: boolean;
    errors: string[];
}

//Modal.ts
export interface IModalData {
    content: HTMLElement;
}

//Success.ts
export interface ISuccess {
    total: number;
}

export interface ISuccessActions {
    onClick: () => void;
}

//Card.ts(Card)
export interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export interface ICard {
    category: string;
    title: string;
    image: string;
    description: string;
    price: number | string;
    button: HTMLButtonElement;
}

//Card.ts(CardBasket)
export interface ICardBasket {
    title: string;
    price: number | string;
    button: HTMLButtonElement;
    index: number;
}

//Page.ts
export interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

//Order.ts
export type Pay = 'online' | 'offline';

export interface IOrderForm {
    address: string;
    buttonCard: HTMLButtonElement;
    buttonCash: HTMLButtonElement;
    payment: Pay;
}

//Contacts.ts
export interface IContactsForm {
    email: string;
    phone: string;
}

//WebLarekAPI
export interface IWebLarekAPI {
    getCardList: () => Promise<ICardItem[]>;
    getCardItem: (id: string) => Promise<ICardItem>;
    orderCard: (order: IOrder) => Promise<IOrderResult>;
}

export interface ICardItem {//AppData.ts тоже использует
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number;
}

export interface IOrderResult {
    id: string;
    total: string;
}

export interface IOrder {//AppData.ts тоже использует
    payment: string;
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[]
}

//AppData.ts
export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IAppState {
    catalog: ICardItem[];
    basket: string[];
    order: IOrder | null;
    formErrors: FormErrors;
}

export interface IValidityOrderForm {
    address: string;
    payment: Pay;
}

//index.ts
export type Catalog = {
    catalog: ICardItem[]
};