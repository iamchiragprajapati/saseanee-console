import { Entity, EntityList, EntityParams, FormControlMap, Media } from "./common.model";

export interface Partner extends Omit<Entity, 'name'> {
  organization: string;
  contactPerson: string;
  email: string;
  contactNumber: string;
  website: string;
  country: string;
  remark: string;
  description?: string;
  logo?: Media;
  video: Media;
  url: string;
  index: number;
}

export interface CreatePartner {
  organization: string;
  contactPerson: string;
  email: string;
  website: string;
  description: string;
  logo: Media;
  contactNumber: string;
  country: string;
  remark: string;
  videoLink: string;
  mode: string;
  isActive: boolean;
  isHighlighted: boolean;
  index: number;
}

export interface PartnerList extends EntityList<Partner> { }

export interface PartnerListQueryParams extends EntityParams { }

export type AddPartnerForm = FormControlMap<CreatePartner>;

export interface PartnerDetail extends CreatePartner {
  _id: string;
}