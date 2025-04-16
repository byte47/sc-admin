declare module "better-sqlite3" {
  interface SqliteOptions {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: Function;
  }

  interface Statement {
    readonly database: Database;
    readonly source: string;
    readonly reader: boolean;
    readonly readonly: boolean;

    run(...params: any[]): {
      changes: number;
      lastInsertRowid: number | bigint;
    };
    get(...params: any[]): any;
    all(...params: any[]): any[];
    iterate(...params: any[]): IterableIterator<any>;
    pluck(toggleState?: boolean): Statement;
    expand(toggleState?: boolean): Statement;
    raw(toggleState?: boolean): Statement;
    columns(): { name: string; column: string | null }[];
    bind(...params: any[]): Statement;
    safeIntegers(toggleState?: boolean): Statement;
  }

  interface Database {
    name: string;
    open: boolean;
    inTransaction: boolean;
    readonly: boolean;

    prepare(sql: string): Statement;
    exec(sql: string): Database;

    transaction<T>(fn: (...args: any[]) => T): (...args: any[]) => T;
    function<T>(fn: (...args: any[]) => T): (...args: any[]) => T;
    aggregate<T>(
      name: string,
      options: {
        start: () => any;
        step: (total: any, next: any) => any;
        result?: (total: any) => T;
      }
    ): void;

    backup(
      destination: string | Database,
      options?: {
        attached?: string;
        progress?: (info: {
          totalPages: number;
          remainingPages: number;
        }) => any;
      }
    ): Promise<void>;

    close(): void;
    defaultSafeIntegers(toggle?: boolean): Database;
    pragma(source: string, options?: { simple?: boolean }): any;
    serialize(options?: { attached?: string }): Buffer;
    loadExtension(path: string): void;
  }

  const Database: {
    new (filename: string, options?: SqliteOptions): Database;
    (filename: string, options?: SqliteOptions): Database;
  };

  export = Database;
}
