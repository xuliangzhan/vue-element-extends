import { ElTable } from './table'
import { ElTableColumn } from './table-column';


export interface EditRules {
    required: boolean,
    min?: number,
    max?: number,
    type?: number | string,
    pattern?: RegExp,
    validator?(): void,
    trigger?: string
}


export interface ElxMethods extends ElTable {

    refresh(): void,
    reload(datas: object[]): void,
    reloadRow(row: object, record?: object[]): void,
    revert(row?: object | object[], prop?: string): void,
    insert(record: object): void,
    insertAt(data: object, record?: object | number | null),
    remove(row?: object | object[]),
    removeSelecteds(): void,
    clear(): void,
    reset(row?: object | object[]): void,
    clearActive(): void,
    hasActiveRow(row: object): boolean,
    getActiveRow(): object,
    setActiveRow(row: object): void,
    setActiveCell(row: object, prop?: string): void,
    setChecked(row: object, prop: string): void,
    hasRowInsert(row: object): boolean,
    hasRowChange(row: object, prop?: string): boolean,
    updateStatus(): void,
    getAllRecords(): object[],
    getRecords(index?: number): object | object[],
    getInsertRecords(): object[],
    getRemoveRecords(): object[],
    getUpdateRecords(): object[],
    checkValid(): boolean,
    validateRow(row: object, callback?: () => {}): void,
    validate(callback?: () => {}): void,
    exportCsv(options: object): void
}

export interface ElxColumn extends ElTableColumn {
    editRender: Object
}

/**
 * Extension component based on ElementUI 2.x.
 */
declare var VueElementExtends: ElxMethods;

export default VueElementExtends;