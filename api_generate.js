// この関数がAPIとして呼び出されます
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }


    try {
        // フロントエンドから送られてきたキーワードを取得
        const { keyword } = req.body;
        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }


        // AIへの指示（プロンプト）を作成
        // Hugging Faceのモデルは対話形式のプロンプトを特定の形式で受け取ることが多いです
        const prompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\nあなたはプロのSNSマーケターです。以下のキーワードを使って、X(旧Twitter)で多くの人の心に響き、エンゲージメントが高まるような投稿文を1つだけ、140字以内で作成してください。\n\nキーワード: "${keyword}"<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;


        // Hugging Face APIにリクエストを送信
        const response = await fetch(
            // 使用するAIモデルを指定します。今回はMeta社の高性能モデル「Llama 3」を使います
            "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // 環境変数からHugging FaceのAPIキーを読み込みます
                    "Authorization": `Bearer ${process.env.HF_API_KEY}`
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 150, // 生成する最大文字数
                        return_full_text: false, // プロンプト部分を除いた回答だけを返す
                    }
                })
            }
        );


        if (!response.ok) {
            const errorText = await response.text();
            // モデルが起動中の場合があるため、分かりやすいエラーメッセージを返す
            if (response.status === 503) {
                 throw new Error('AIモデルが起動中です。約30秒後にもう一度お試しください。');
            }
            throw new Error(`Hugging Face API error: ${errorText}`);
        }


        const result = await response.json();
        const generatedPost = result[0].generated_text.trim();


        // 生成された投稿文をフロントエンドに返す
        res.status(200).json({ post: generatedPost });


    } catch (error) {
        console.error('Error generating post:', error);
        res.status(500).json({ error: error.message || 'Failed to generate post' });
    }
}