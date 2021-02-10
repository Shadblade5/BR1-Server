export declare enum SelectType {
    NONE = 0,
    SID = 1,
    PORT = 2
}
export interface ActiveEvent {
    event: string;
    id?: string;
}
export interface LoginInfo {
    username: string;
    password: string;
}
export declare type Context = SelectPortContext | SelectSidContext | SelectNoneContext;
export interface SelectNoneContext extends BaseContext {
    selectType: SelectType.NONE;
    selected: 0;
}
export interface SelectPortContext extends BaseContext {
    selectType: SelectType.PORT;
    selected: number;
}
export interface SelectSidContext extends BaseContext {
    selectType: SelectType.SID;
    selected: string;
}
export interface BaseContext {
    selectType: SelectType;
    events: ActiveEvent[];
    clientNickname?: string;
    login?: LoginInfo;
}
