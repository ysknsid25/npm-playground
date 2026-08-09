import { toJsonSchema } from '@valibot/to-json-schema';
import * as v from 'valibot';
import { writeFileSync } from 'node:fs';

const schema = v.nullable(v.string());

// OpenAPI 3.0 形式で出力
const result = toJsonSchema(schema, { target: 'openapi-3.0' });
// => { type: "string", nullable: true }

// Swagger UI などで読めるように、完全な OpenAPI ドキュメントに埋め込む
const openapiDocument = {
    openapi: '3.0.3',
    info: {
        title: 'valibot to-json-schema sample',
        version: '1.0.0',
    },
    paths: {
        '/sample': {
            get: {
                summary: 'Sample endpoint',
                responses: {
                    '200': {
                        description: 'OK',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Sample' },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            Sample: result,
        },
    },
};

writeFileSync('openapi.json', JSON.stringify(openapiDocument, null, 2));
console.log('openapi.json を生成しました');
