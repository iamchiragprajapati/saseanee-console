import {
  ActionToolbar,
  EntityList,
  EntityParams,
  FormControlMap,
  Media
} from '@models/common.model';
import { Role } from '@models/role.model';

export interface CreateMember {
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  role: string[];
}

export interface MemberListQueryParams extends EntityParams {
  userId: string;
}

export interface MemberList extends EntityList<Member> {}

export type AddMemberForm = FormControlMap<CreateMember>;

export interface Member {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpiryTime: string;
  roles?: Pick<Role, 'uuid' | '_id' | 'name'>[] | string[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  action: ActionToolbar[];
  role: string[];
  name: string;
}

export interface Configuration {
  headerLogo: Media;
  footerLogo: Media;
  homeVideoWebPoster: Media;
  homeVideoMobilePoster: Media;
  collectionBanner: Media;
  homeAudio: Media;
  infoEmail: string;
  contactEmail?: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  disclaimer?: string;
  title?: string;
  headingTitle?: string;
  galleryTitle?: string;
  categoryTitle?: string;
  headingDescription?: string;
  galleryDescription?: string;
  categoryDescription?: string;
  searchArtefacts?: string;
  galleryPageDescription?: string;
  historyAndEducationPageDescription?: string;
  exhibitionPageDescription?: string;
  feedback?: string;
}

export type ConfigurationForm = FormControlMap<Configuration>;
