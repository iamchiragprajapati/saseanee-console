import { Routes } from '@angular/router';

import { BreadcrumbResolverFn } from '@services/breadcrumb.service';
import { CategoryDetail } from '@services/category.service';
import { MemberDetail } from '@services/member.service';
import { PartnerData } from '@services/partner.service';
import { ProductDetailData } from '@services/product.service';
import { whatWeDoData } from '@services/what-we-do.service';

export const adminRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: () => { return 'dashboard'; },
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        title: 'pageTitle.dashboard',
        loadComponent: () =>
          import('@pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        data: {
          role: 'admin',
          breadcrumb: 'dashboard'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      }
    ]
  },
  {
    path: 'member',
    data: {
      breadcrumb: 'memberList'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        title: 'pageTitle.members',
        loadComponent: () =>
          import('@pages/members/members.component').then(
            (m) => m.MembersComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: 'add',
        title: 'member.add',
        loadComponent: () =>
          import('@pages/members/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'add'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: ':_id',
        title: 'member.edit',
        loadComponent: () =>
          import('@pages/members/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'edit'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn,
          memberDetail: MemberDetail
        }
      }
    ]
  },
  {
    path: 'categories',
    data: {
      breadcrumb: 'categoryList'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        title: 'pageTitle.categories',
        loadComponent: () =>
          import('@pages/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: 'add',
        title: 'category.add',
        loadComponent: () =>
          import('@pages/categories/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'add'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: ':_id',
        title: 'category.edit',
        loadComponent: () =>
          import('@pages/categories/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'edit'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn,
          categoryDetail: CategoryDetail
        }
      }
    ]
  },
  {
    path: 'partner',
    data: {
      breadcrumb: 'partners'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        title: 'pageTitle.partners',
        loadComponent: () =>
          import('@pages/partner/partner.component').then(
            (m) => m.PartnerComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: 'add',
        title: 'partner.add',
        loadComponent: () =>
          import('@pages/partner/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'add'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: ':_id',
        title: 'partner.edit',
        loadComponent: () =>
          import('@pages/partner/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'edit'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn,
          partnerDetail: PartnerData
        }
      }
    ]
  },
  {
    path: 'products',
    data: {
      breadcrumb: 'productList'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        title: 'pageTitle.products',
        loadComponent: () =>
          import('@pages/products/products.component').then(
            (m) => m.ProductsComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: 'add',
        title: 'product.add',
        loadComponent: () =>
          import('@pages/products/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'add'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: ':_id',
        title: 'product.edit',
        loadComponent: () =>
          import('@pages/products/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'edit'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn,
          productDetail: ProductDetailData
        }
      }
    ]
  },
  {
    path: 'profile',
    data: {
      breadcrumb: 'profile'
    },
    children: [
      {
        path: '',
        title: 'pageTitle.profile',
        loadComponent: () =>
          import('@pages/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      }
    ]
  },
  {
    path: 'change-password',
    data: {
      breadcrumb: 'changePassword'
    },
    children: [
      {
        path: '',
        title: 'pageTitle.changePassword',
        loadComponent: () =>
          import('@auth/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      }
    ]
  },
  {
    path: 'what-we-do',
    data: {
      breadcrumb: 'whatWeDo'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        title: 'pageTitle.whatWeDo',
        loadComponent: () =>
          import('@pages/what-we-do/what-we-do.component').then(
            (m) => m.WhatWeDoComponent
          ),
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: 'add',
        title: 'whatWeDo.add',
        loadComponent: () =>
          import('@pages/what-we-do/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'add'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn
        }
      },
      {
        path: ':_id',
        title: 'whatWeDo.edit',
        loadComponent: () =>
          import('@pages/what-we-do/add/add.component').then(
            (m) => m.AddComponent
          ),
        data: {
          breadcrumb: 'edit'
        },
        resolve: {
          breadcrumbs: BreadcrumbResolverFn,
          whatWeDoDetail: whatWeDoData
        }
      }
    ]
  },
];
