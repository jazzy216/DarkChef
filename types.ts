
export type OperationCategory = 
  | 'Encoding' 
  | 'Hashing' 
  | 'Encryption' 
  | 'Data Format' 
  | 'Utils';

export interface Operation {
  id: string;
  name: string;
  description: string;
  category: OperationCategory;
  run: (input: string, params?: any) => string;
  params?: OperationParam[];
}

export interface OperationParam {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  defaultValue: any;
  options?: string[];
}

export interface ActiveOperation {
  instanceId: string;
  operationId: string;
  params: Record<string, any>;
}

export interface DetectionResult {
  format: string;
  confidence: number;
  explanation: string;
  suggestedOperations: string[];
}
