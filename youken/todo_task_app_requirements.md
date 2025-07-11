# アプリ開発 要件定義書（Windowsネイティブ版）

## 1. アプリの目的  
日々のタスクと作業時間を簡単に記録・管理し、個人の生産性向上と振り返りをサポートするWindowsデスクトップアプリを提供する。

## 2. 想定ユーザー  
- 自分の作業を見える化したい個人ユーザー  
- Windows環境で完結する作業を求める在宅ワーカー・クリエイター・開発者など

## 3. 主要機能

### 主要な操作機能  
- タスク追加（タスク名、ジャンル、開始／終了予定日時）  
- タスク操作：`開始` / `中断` / `終了` ボタン  
- 作業時間の自動記録と状態管理  
- タスクの色分け表示（終了＝グレーアウト）  
- タスクの繰越処理（未完了のみ）  
- 日別／週別の振り返り表示（ジャンル別合計時間など）

### 補助的な機能（Nice to have）  
- ジャンルの自動補完（プルダウン）  
- メモ欄  
- CSVエクスポート  
- ダークモード

## 4. 画面構成とUI概要  

### メイン画面（1日単位）
- 日付ナビゲーション（前日／今日／翌日）  
- タスク一覧（カード表示 or テーブル形式）  
- 「＋タスク追加」ボタン  
- 各タスクに操作ボタンと時間表示  

### 振り返り画面
- 一週間のジャンル別作業時間グラフ  
- 過去の任意の日付のタスク履歴表示  

## 5. 技術スタックの提案

### 開発環境  
- Electron + React + TypeScript  

### 使用予定ライブラリ  
- 状態管理：Zustand or Redux Toolkit  
- UI：Tailwind CSS  
- 日付操作：Day.js or date-fns  
- グラフ描画：Recharts or Chart.js  
- ローカルDB：SQLite  
- ファイル操作：fs-extra または Electron API

## 6. 入出力  

### 入力  
- ユーザーによる手動入力（タスク名・ジャンル・予定日時）  
- ボタン操作によるタスクステータス変更

### 出力  
- タスクのステータス（開始／終了）  
- 作業時間の記録  
- 日・週ごとの統計情報

## 7. データ保存と動作環境  

- ローカルDB（SQLite）に保存  
- 完全オフライン動作対応  
- Windows専用インストーラ（.exe）を用意  

## 8. 制約・条件  

- 個人利用を想定し、ログインやクラウド連携なし  
- セキュリティよりもローカル完結の快適さ重視  
- 軽量でサクサク動作するUI／UXを優先  

## 9. 完成イメージとUIフロー  

朝起きたらタスクを追加し、作業ごとに“開始”をクリック。作業終了時に“終了”を押すだけで記録が残る。1日の終わりや週末に“振り返り画面”を開けば、ジャンル別にどれだけ頑張ったかが一目でわかる。

## 10. 開発の優先順位・スケジュール  

### ✅ MVP（最小限の実装）  
- タスク登録、ステータス変更、作業時間記録  
- 一日単位での表示／色分け  
- タスク繰越処理  
- SQLite保存＋オフライン対応

### あとで追加する機能  
- 週ごとの振り返り（ジャンル別時間集計）  
- グラフ表示  
- メモ、CSVエクスポート  
- デザインテーマ切替（ライト／ダーク）
