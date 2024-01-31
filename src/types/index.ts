export type Pay = 'online' | 'offline';

export interface IOrderForm {
    address: string;
    buttonCard: HTMLButtonElement;
    buttonCash: HTMLButtonElement;
    payment: Pay;
}

export interface IContactsForm {
    email: string;
    phone: string;
}

export interface IErrorOrderForm {
    address: string;
    payment: Pay;
}

export interface ICardItem {
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

export interface IOrder {
    payment: string;
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[]
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IAppState {
    catalog: ICardItem[];
    basket: string[];
    preview: ICardItem | null;
    order: IOrder | null;
    formErrors: FormErrors;
}

export interface IValidityOrderForm {
    address: string;
    payment: Pay;
}

export interface IValidityContactsForm {
    email: string;
    phone: string;
}
