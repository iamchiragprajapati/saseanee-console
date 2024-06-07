import { FormArray, FormControl } from "@angular/forms";
import { Entity, EntityList, EntityParams, FormControlMap, Media } from "./common.model";

export interface WhatWeDo extends Entity {
  title: string;
  subTitle: string;
  logo?: Media;
  isActive: boolean;
  isHighlighted: boolean;
  index: number;
  bulletPoints?: string[];
}

export interface CreateWhatWeDo {
  title: string;
  subTitle: string;
  logo: Media;
  isActive: boolean;
  isHighlighted: boolean;
  index: number;
}

export interface bulletPoints {
  bulletPoints?: FormArray<FormControl<string>>;
}
export type AddWhatWeDoForm = bulletPoints & (FormControlMap<CreateWhatWeDo>);

export interface WhatWeDoDetail extends CreateWhatWeDo {
  _id: string;
}

export interface WhatWeDoList extends EntityList<WhatWeDo> { }

export interface WhatWeDoListQueryParams extends EntityParams { }