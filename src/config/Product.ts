// src/Product.ts
export interface Product {
    Price: any;
    Id: number; // Note the capitalization to match your DB
    BrandName: String;
    Name: string;
    Description: string;
    Photo: string;
    SKU: string;
    Qty: number;
    Category: string;
}

export interface CartItem {
    Price: any;
    Id: number; // Note the capitalization to match your DB
    Name: string;
    Description: string;
    Photo: string;
    SKU: string;
    Qty: number;
    Category: string;
    qty: number;
}
