import { ActionToolbar, EntityList, EntityParams, FormControlMap } from "./common.model";

export interface CreateCategory {
  title: string;
  index: number;
  isActive: boolean;
}

export interface CategoryListQueryParams extends EntityParams { }

export interface Category {
  _id: string;
  title: string;
  index: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  action: ActionToolbar[];
}

export type AddCategoryForm = FormControlMap<CreateCategory>;

export interface CategoryList extends EntityList<Category> { }