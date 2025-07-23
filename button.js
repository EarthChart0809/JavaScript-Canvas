function copyToClipboard(id) {
    const codeElement = document.getElementById(id);
    const text = codeElement.textContent.trim(); // 余計な空白を削除
    navigator.clipboard.writeText(text).then(() => {
        alert("解答例をコピーしました！");
    }).catch(err => {
        alert("コピーに失敗しました: " + err);
    });
}