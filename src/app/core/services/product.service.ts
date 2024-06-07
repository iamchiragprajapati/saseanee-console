import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { API } from '@constants/api.constants';
import { environment } from '@environment/environment';
import { APIResponseModel } from '@models/common.model';
import { CategoryType, ProductDetail, ProductList, ProductListQueryParams } from '@models/product.model';
import { catchError, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';

export const ProductDetailData = (route: ActivatedRouteSnapshot) => {
  const productService = inject(ProductService);
  const router = inject(Router);
  return productService.getById(route.params._id).pipe(
    tap(
      (res) => {
        res.data.type = (res.data.type as CategoryType)._id;
        res.data.logo = res.data.logo.map((logo) => logo = `${environment.authApi}${logo}`);
      }
    ),
    catchError(() => {
      router.navigate(['/admin/products/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseApiService<
  ProductDetail,
  ProductList,
  ProductListQueryParams
> {
  getEndpoint(): string {
    return API.PRODUCTS;
  }

  createProduct(data: FormData) {
    return this.http.post<APIResponseModel<ProductDetail>>(`${this.getEndpoint()}`, data);
  }

  updateProduct(_id: string, data: FormData) {
    return this.http.put<APIResponseModel<ProductDetail>>(
      `${this.getEndpoint()}/${_id}`, data);
  }
}