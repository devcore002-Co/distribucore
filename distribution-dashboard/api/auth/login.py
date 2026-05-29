import httpx
import json

async def handler(request):
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        }

    if request.method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'detail': 'Method not allowed'})
        }

    try:
        body = json.loads(request.body) if isinstance(request.body, str) else request.body

        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://distribucore-api-dev-core-s-projects.vercel.app/auth/login',
                json=body,
                timeout=10.0
            )

            return {
                'statusCode': response.status_code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': response.text
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'detail': str(e)})
        }
