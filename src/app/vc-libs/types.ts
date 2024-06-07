export enum SearchFieldType {
  Text = 'text',
  List = 'list',
  Date = 'date',
  DateRange = 'dateRange'
}

interface BaseSearchField {
  key: string;
  label: string;
  type: SearchFieldType;
}

export interface TextSearchField extends BaseSearchField {
  type: SearchFieldType.Text;
}

export interface DateSearchField extends BaseSearchField {
  type: SearchFieldType.Date;
}

export interface DateRangeSearchField extends BaseSearchField {
  type: SearchFieldType.DateRange;
}

export interface ListSearchField extends BaseSearchField {
  type: SearchFieldType.List;
  list: Array<{
    label: string;
    value: string | number | boolean;
  }>;
}

export type SearchField =
  | TextSearchField
  | DateSearchField
  | ListSearchField
  | DateRangeSearchField;
