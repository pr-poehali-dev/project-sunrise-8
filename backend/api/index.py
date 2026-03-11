import json
import os
import urllib.request
import urllib.error
import psycopg2
import psycopg2.extras


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema():
    return os.environ.get('MAIN_DB_SCHEMA', 'public')


def resp(status, data):
    return {'statusCode': status, 'headers': CORS_HEADERS, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def serialize_project(row):
    row['created_at'] = row['created_at'].isoformat() if row.get('created_at') else None
    row['updated_at'] = row['updated_at'].isoformat() if row.get('updated_at') else None
    row['id'] = str(row['id'])
    return row


def handle_generate_script(body):
    """Генерация сценария через OpenAI"""
    topic = body.get('topic', '')
    platform = body.get('platform', 'reels')
    style = body.get('style', 'professional')
    avatar_name = body.get('avatar_name', 'Алиса')
    duration = body.get('duration', 60)

    if not topic:
        return resp(400, {'error': 'Укажите тему видео'})

    specs = {
        'reels': {'name': 'Instagram Reels', 'max': 90},
        'tiktok': {'name': 'TikTok', 'max': 180},
        'shorts': {'name': 'YouTube Shorts', 'max': 60},
        'stories': {'name': 'Stories', 'max': 15},
    }
    styles = {
        'professional': 'Профессиональный, деловой тон.',
        'casual': 'Дружелюбный, разговорный стиль.',
        'energetic': 'Энергичный, мотивирующий.',
        'educational': 'Образовательный, пошаговый.',
    }

    s = specs.get(platform, specs['reels'])
    st = styles.get(style, styles['professional'])
    dur = min(int(duration), s['max'])

    prompt = f"""Создай сценарий короткого видео для {s['name']}.
Тема: {topic}
Ведущий: {avatar_name}
Стиль: {st}
Длительность: до {dur} секунд, вертикальное 9:16.

Верни JSON:
{{"title":"заголовок до 60 символов","hook":"крючок первые 3 сек","scenes":[{{"time":"0:00-0:05","text":"речь ведущего","visual":"описание визуала","emotion":"эмоция"}}],"cta":"призыв к действию","hashtags":["тег1","тег2","тег3","тег4","тег5"],"estimated_duration":{dur}}}

Сделай 4-6 сцен на русском. Только JSON."""

    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        return resp(500, {'error': 'OpenAI API key not configured'})

    req_body = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': [
            {'role': 'system', 'content': 'Генератор сценариев. Отвечай только валидным JSON.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.8,
        'max_tokens': 2000,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=req_body,
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'}
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            result = json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return resp(502, {'error': f'AI error: {e.code}'})

    content = result['choices'][0]['message']['content'].strip()
    if content.startswith('```'):
        content = content.split('\n', 1)[1].rsplit('```', 1)[0].strip()

    try:
        script_data = json.loads(content)
    except json.JSONDecodeError:
        script_data = {'title': topic, 'hook': content[:100], 'scenes': [{'time': '0:00-1:00', 'text': content, 'visual': 'Ведущий на камеру', 'emotion': 'нейтральная'}], 'cta': 'Подписывайтесь!', 'hashtags': [], 'estimated_duration': dur}

    return resp(200, script_data)


def handle_projects(method, params, headers_req, body):
    """CRUD для видео-проектов"""
    session_id = headers_req.get('X-Session-Id') or headers_req.get('x-session-id', '')
    if not session_id:
        return resp(400, {'error': 'X-Session-Id required'})

    schema = get_schema()
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        if method == 'GET':
            pid = params.get('id')
            if pid:
                cur.execute(f"SELECT * FROM {schema}.video_projects WHERE id = '{pid}' AND session_id = '{session_id}'")
                row = cur.fetchone()
                if not row:
                    return resp(404, {'error': 'Not found'})
                return resp(200, serialize_project(dict(row)))

            cur.execute(f"SELECT * FROM {schema}.video_projects WHERE session_id = '{session_id}' ORDER BY created_at DESC LIMIT 50")
            rows = [serialize_project(dict(r)) for r in cur.fetchall()]
            return resp(200, rows)

        if method == 'POST':
            t = body.get('title', 'Новый проект').replace("'", "''")
            topic = body.get('topic', '').replace("'", "''")
            script = body.get('script', '').replace("'", "''")
            av_id = body.get('avatar_id', 'alice')
            av_name = body.get('avatar_name', 'Алиса').replace("'", "''")
            plat = body.get('platform', 'reels')
            dur = int(body.get('duration', 60))
            sty = body.get('style', 'professional')
            status = body.get('status', 'draft')
            brand = json.dumps(body.get('branding', {})).replace("'", "''")

            cur.execute(f"""INSERT INTO {schema}.video_projects (session_id,title,topic,script,avatar_id,avatar_name,platform,duration_sec,style,status,branding)
                VALUES ('{session_id}','{t}','{topic}','{script}','{av_id}','{av_name}','{plat}',{dur},'{sty}','{status}','{brand}') RETURNING *""")
            conn.commit()
            row = cur.fetchone()
            return resp(201, serialize_project(dict(row)))

        if method == 'PUT':
            pid = body.get('id') or params.get('id')
            if not pid:
                return resp(400, {'error': 'ID required'})

            updates = []
            for f in ['title','topic','script','avatar_id','avatar_name','platform','style','status','result_url','thumbnail_url']:
                if f in body:
                    v = str(body[f]).replace("'", "''")
                    updates.append(f"{f} = '{v}'")
            if 'duration' in body:
                updates.append(f"duration_sec = {int(body['duration'])}")
            if 'branding' in body:
                b = json.dumps(body['branding']).replace("'", "''")
                updates.append(f"branding = '{b}'")
            updates.append("updated_at = NOW()")

            cur.execute(f"UPDATE {schema}.video_projects SET {', '.join(updates)} WHERE id = '{pid}' AND session_id = '{session_id}' RETURNING *")
            conn.commit()
            row = cur.fetchone()
            if not row:
                return resp(404, {'error': 'Not found'})
            return resp(200, serialize_project(dict(row)))

        if method == 'DELETE':
            pid = params.get('id')
            if not pid:
                return resp(400, {'error': 'ID required'})
            cur.execute(f"DELETE FROM {schema}.video_projects WHERE id = '{pid}' AND session_id = '{session_id}'")
            conn.commit()
            if cur.rowcount == 0:
                return resp(404, {'error': 'Not found'})
            return resp(200, {'deleted': True})

    finally:
        cur.close()
        conn.close()

    return resp(405, {'error': 'Method not allowed'})


def handler(event, context):
    """Единый API: маршрутизация по action параметру"""
    if event.get('httpMethod') == 'OPTIONS':
        return resp(200, '')

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    headers_req = event.get('headers', {})
    body = {}
    if event.get('body'):
        try:
            parsed = json.loads(event['body'])
            if isinstance(parsed, dict):
                body = parsed
        except (json.JSONDecodeError, TypeError):
            body = {}

    action = params.get('action', '') or body.get('action', 'projects')

    if action == 'generate':
        return handle_generate_script(body)

    return handle_projects(method, params, headers_req, body)