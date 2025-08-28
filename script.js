// HTMLの要素を取得
const keywordInput = document.getElementById('keyword');
const generateBtn = document.getElementById('generate-btn');
const postResultDiv = document.getElementById('post-result');
const charCounterSpan = document.getElementById('char-counter');
const copyBtn = document.getElementById('copy-btn');


// 「投稿を生成する」ボタンがクリックされたときの処理
generateBtn.addEventListener('click', async () => {
    const keyword = keywordInput.value;


    if (!keyword.trim()) {
        alert('キーワードを入力してください。');
        return;
    }


    // ローディング表示とボタンの無効化
    postResultDiv.textContent = 'AIが投稿を生成中です... (初回は30秒ほどかかる場合があります)';
    charCounterSpan.textContent = `文字数: 0`;
    generateBtn.disabled = true;


    try {
        // 私たちのサーバー関数(/api/generate)にリクエストを送信
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keyword: keyword }),
        });


        const data = await response.json();


        if (!response.ok) {
            // サーバーから返されたエラーメッセージを表示
            throw new Error(data.error || 'サーバーからの応答がありませんでした。');
        }
        
        const generatedPost = data.post;
        
        // 結果を表示
        postResultDiv.textContent = generatedPost;
        charCounterSpan.textContent = `文字数: ${generatedPost.length}`;


    } catch (error) {
        console.error('Error:', error);
        postResultDiv.textContent = `エラーが発生しました。\n${error.message}`;
        alert(error.message);
    } finally {
        // ボタンを再度有効化
        generateBtn.disabled = false;
    }
});


// 「コピー」ボタンがクリックされたときの処理
copyBtn.addEventListener('click', () => {
    const textToCopy = postResultDiv.textContent;


    if (textToCopy === 'ここに結果が表示されます...' || !textToCopy) {
        alert('先に投稿を生成してください。');
        return;
    }


    // クリップボードにコピー
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('投稿文をコピーしました！');
    }).catch(err => {
        console.error('コピーに失敗しました', err);
        alert('コピーに失敗しました。');
    });
});