import { Doc } from 'fyo/model/doc';
import { FiltersMap, ListViewSettings } from 'fyo/model/types';
import { CollectionRulesItems } from '../CollectionRulesItems.ts/CollectionRulesItems';
import { AccountRootTypeEnum } from '../Account/types';

export class LoyaltyProgram extends Doc {
  collectionRules?: CollectionRulesItems[];
  expiryDuration?: number;

  static filters: FiltersMap = {
    expenseAccount: () => ({
      rootType: AccountRootTypeEnum.Liability,
    }),
  };

  static getListViewSettings(): ListViewSettings {
    return {
      columns: ['name', 'fromDate', 'toDate', 'expiryDuration'],
    };
  }
}