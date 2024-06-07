import { Entity, EntityList, EntityParams, FormControlMap, Media } from "./common.model";

export interface CreateProduct {
  title: string;
  description: string;
  logo: any;
  link: string;
  type: string | CategoryType;
  index: number;
  isHighlighted: boolean;
  isActive: boolean;
  isPaid: boolean;
}

export interface CategoryType {
  _id: string;
  title: string;
}

export interface Product extends Entity {
  title: string;
  index: number;
  logo?: Media[];
  link: string;
  type: string;
  description: string;
  isHighlighted: boolean;
  isActive: boolean;
  isPaid: boolean;
  updatedAt: string;
}

export interface ProductDetail extends CreateProduct {
  _id: string;
}

export type AddProductForm = FormControlMap<CreateProduct>;

export interface ProductListQueryParams extends EntityParams { }

export interface ProductList extends EntityList<Product> { }