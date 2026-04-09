/** Tipo de adapter de armazenamento */
export type StorageAdapterType = 'sqlite' | 'indexeddb' | 'remote';

/** Interface base para qualquer adapter de armazenamento */
export interface StorageAdapter {
  type: StorageAdapterType;

  /** Inicializa o adapter (criar tabelas, etc.) */
  init(): Promise<void>;

  /** Buscar registros com filtros opcionais */
  findAll<T>(table: string, filters?: Record<string, unknown>): Promise<T[]>;

  /** Buscar um registro por ID */
  findById<T>(table: string, id: string): Promise<T | null>;

  /** Inserir um registro */
  insert<T>(table: string, data: Record<string, unknown>): Promise<T>;

  /** Atualizar um registro */
  update<T>(table: string, id: string, data: Record<string, unknown>): Promise<T>;

  /** Deletar um registro */
  delete(table: string, id: string): Promise<void>;

  /** Query customizada (para consultas complexas) */
  query<T>(table: string, options: QueryOptions): Promise<T[]>;
}

/** Opções para queries customizadas */
export interface QueryOptions {
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  select?: string;
}
