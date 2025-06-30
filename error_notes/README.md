# エラー解決メモ

## 発生したエラー

- 画面が真っ白になり、コンソールに `date.getFullYear is not a function` というエラーが表示される
- TaskListコンポーネントやZustandストアのgetTasksForDate関数で発生

## 原因

- Zustandのpersist機能でDateオブジェクトが文字列として保存され、復元時にDate型でなくなっていた
- そのため、`date.getFullYear()` を呼び出すとエラーになる

## 解決策

1. `getTasksForDate` など日付を扱う関数で、引数やselectedDateがDateオブジェクトでなければ `new Date()` で変換するよう修正
2. Zustandのpersist設定で、保存時はtoISOString()、復元時はnew Date()で型変換するようにpartializeとonRehydrateStorageを追加
3. 各コンポーネント（TaskList, DateSelector, Analytics, Headerなど）でselectedDateを使う際も、Date型であることを保証

## 備考

- ブラウザのキャッシュやローカルストレージのクリアも有効
- ViteやNode.jsのキャッシュクリアも試すと良い

---

このフォルダには今後もエラー解決の知見を追記してください。 