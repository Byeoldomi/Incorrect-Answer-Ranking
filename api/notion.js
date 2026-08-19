export default async function handler(req, res) {
    // POST 요청만 허용
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { notionApiKey, databaseId, start_cursor } = req.body;

    // 필수 파라미터 검증
    if (!notionApiKey || !databaseId) {
        return res.status(400).json({ message: 'Notion API Key와 Database ID가 필요합니다.' });
    }

    try {
        const apiUrl = `https://api.notion.com/v1/databases/${databaseId}/query`;
        
        // 400 Bad Request 에러 방지를 위한 빈 객체 또는 페이지네이션 커서 포함
        const body = {};
        if (start_cursor) {
            body.start_cursor = start_cursor;
        }

        // 실제 노션 API로 요청 전달
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionApiKey}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        // 응답 데이터 파싱
        const data = await response.json();

        // 노션 API에서 에러 응답을 반환한 경우 그대로 프론트에 전달
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // 성공 시 데이터 반환
        return res.status(200).json(data);

    } catch (error) {
        console.error('Notion API 요청 에러:', error);
        return res.status(500).json({ message: '서버 내부 오류가 발생했습니다.', error: error.message });
    }
}
