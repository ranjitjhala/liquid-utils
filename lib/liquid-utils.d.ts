/// <reference path="../typings/hover.d.ts" />
export declare type imap = {
    [x: number]: A;
};
export interface Annot {
    ident: string;
    ann: string;
    row: number;
    col: number;
}
export declare var infoProvider: Hover.IProvider;
export declare var errorProvider: Hover.IProvider;
