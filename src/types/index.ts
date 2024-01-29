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

//WebLarek.ts
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

//AppData.ts
export type FormErrors = Partial<Record<keyof IOrder, string>>;

export type CardStatus = 'active' | 'closed';

export interface IAppState {
    catalog: ICardItem[];
    basket: string[];
    preview: ICardItem | null;
    order: IOrder | null;
    formErrors: FormErrors;
}

export interface IValidityForm {
    email: string;
    phone: string;
    address: string;
    payment: Pay;
}
