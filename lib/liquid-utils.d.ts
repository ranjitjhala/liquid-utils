/// <reference path="../typings/hover.d.ts" />
export declare var debugLiquidUtils: any;
export declare type imap<A> = {
    [x: number]: A;
};
export interface Annot {
    ident: string;
    ann: string;
    row: number;
    col: number;
}
export declare type TypeInfo = imap<imap<Annot>>;
export interface LiquidInfo {
    status: string;
    types: TypeInfo;
    errors: Hover.Error[];
}
export declare class Annotations {
    private fileMap;
    private cmd;
    private args;
    private subDir;
    constructor(cmd: string, args: string[], subDir: string);
    private command(sFile);
    private jsonFile(srcFile);
    private rebuild(sFile, sTime);
    private refresh(sFile);
    getInfo(p: Hover.Position): Q.Promise<Hover.Info>;
    getErrors(f: string): Q.Promise<Hover.Error[]>;
}
