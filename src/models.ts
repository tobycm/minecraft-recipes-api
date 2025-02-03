type Path = string;

export interface DataPaths {
    pc: {
        [version: string]: {
            [category: string]: Path;
        }
    };
    bedrock: {};
}