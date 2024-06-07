import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { API } from '@constants/api.constants';
import { environment } from '@environment/environment';
import { APIResponseModel } from '@models/common.model';
import { Partner, PartnerDetail, PartnerList, PartnerListQueryParams } from '@models/partner.model';
import { catchError, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';

export const PartnerData = (route: ActivatedRouteSnapshot) => {
  const service = inject(PartnerService);
  const router = inject(Router);
  return service.getById(route.params._id).pipe(
    tap(
      (res) => {
        if (Array.isArray(res.data.logo)) {
          for (let i = 0; i < res.data.logo.length; i++) {
            res.data.logo[i] = { url: `${environment.awsUrl}${res.data.logo[i]}` };
          }
        }
      }
    ),
    catchError(() => {
      router.navigate(['/admin/partner/list']);
      return null;
    })
  );
};
@Injectable({
  providedIn: 'root'
})
export class PartnerService extends BaseApiService<
  Partner,
  PartnerList,
  PartnerListQueryParams
> {
  getEndpoint(): string {
    return API.PARTNERS;
  }

  createPartner(data: FormData) {
    return this.http.post<APIResponseModel<PartnerDetail>>(`${this.getEndpoint()}`, data);
  }

  updatePartner(_id: string, data: FormData) {
    return this.http.put<APIResponseModel<PartnerDetail>>(
      `${this.getEndpoint()}/${_id}`,
      data
    );
  }
}
