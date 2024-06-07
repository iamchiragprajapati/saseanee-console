import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { API } from '@constants/api.constants';
import { Category, CategoryList, CategoryListQueryParams } from '@models/category.model';
import { APIResponseModel, OptionDetail } from '@models/common.model';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiService } from './base-api.service';

export const CategoryDetail = (route: ActivatedRouteSnapshot) => {
  const memberService = inject(CategoryService);
  const router = inject(Router);
  return memberService.getById(route.params._id).pipe(
    catchError(() => {
      router.navigate(['/admin/categories/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseApiService<
  Category,
  CategoryList,
  CategoryListQueryParams
> {
  private httpClient = inject(HttpClient);
  getEndpoint(): string {
    return API.CATEGORIES;
  }

  getCategoryList(): Observable<OptionDetail[]> {
    const params = { isDropdown: true };
    return this.httpClient
      .get<APIResponseModel<Category[]>>(`${this.getEndpoint()}`, {
        params
      })
      .pipe(
        map((res) => {
          return res.data.map((element) => {
            return { label: element.title, value: element._id };
          });
        })
      );
  }
}
