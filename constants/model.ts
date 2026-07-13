import { Ionicons } from "@expo/vector-icons";
import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";

export type WalletType = {
  id?: string;
  name?: string;
  amount?: number;
  total?: number;
  totalExpances?: number;
  image?: any;
  uid?: string;
  create?: Date;
};

export type ResposeType = {
  success?: boolean;
  msg?: string;
  data?: any;
};

export type TransactionListType = {
  data?: TransactionType[];
  title?: string;
  loading?: boolean;
  emptyListMsg?: string;
  onViewAll?: () => void;
  titleSize?: number;
  fill?: boolean;
};
export type TransactionType = {
  id?: string;
  type?: string;
  amount?: number;
  cat?: string;
  date?: Date | Timestamp | string;
  des?: string;
  uid?: string;
  image?: any;
  walletId?: string;
};

export type TransactionItemPropes = {
  item: TransactionType;
  index: number;
  handleClick?: () => void;
};

export type IoniconName = React.ComponentProps<
  typeof Ionicons
>["name"];

export type CatType = {
  label: string;
  value: string;
  icon: IoniconName;
  bgColor: string;
};

export type ExpanseCatType = {
  [key: string]: CatType;
};