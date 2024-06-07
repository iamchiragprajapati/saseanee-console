import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { WhatWeDoDetail, WhatWeDoList, WhatWeDoListQueryParams } from '@models/whatWeDo.model';
import { catchError, tap } from 'rxjs';

import { API } from '@constants/api.constants';
import { environment } from '@environment/environment';
import { APIResponseModel } from '@models/common.model';
import { BaseApiService } from './base-api.service';

export const whatWeDoData = (route: ActivatedRouteSnapshot) => {
  const whatWeDoService = inject(WhatWeDoService);
  const router = inject(Router);
  return whatWeDoService.getById(route.params._id).pipe(
    tap(
      (res) =>
        (res.data.logo = { url: `${environment.authApi}${res.data.logo}` })
    ),
    catchError(() => {
      router.navigate(['/admin/what-we-do/list']);
      return null;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class WhatWeDoService extends BaseApiService<
  WhatWeDoDetail,
  WhatWeDoList,
  WhatWeDoListQueryParams
> {
  getEndpoint(): string {
    return API.WHAT_WE_DO;
  }

  createWhatWeDo(data: FormData) {
    return this.http.post<APIResponseModel<WhatWeDoDetail>>(`${this.getEndpoint()}`, data);
  }

  updateWhatWeDo(_id: string, data: FormData) {
    return this.http.put<APIResponseModel<WhatWeDoDetail>>(
      `${this.getEndpoint()}/${_id}`,
      data
    );
  }
}
