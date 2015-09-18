/// <reference path="../typings/hover.d.ts" />

export declare type imap<A> = {
    [x: number]: A;
};

export interface Annot {
    ident: string;
    ann: string;
    row: number;
    col: number;
}
export declare class Annotations {
    private info;
    private lang;
    private dir;
    constructor(lang: string, dir: string);
    getInfo(p: Hover.Position): Q.Promise<Hover.Info>;
    getErrors(f: string): Q.Promise<Hover.Error[]>;
}
