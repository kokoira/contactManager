# コントリビューションガイドライン

このドキュメントは contactManager プロジェクトへの開発参加ルールを定めます。

---

## 開発フロー

必ず以下の順序で作業を進めてください。

```
Issue 作成 → ブランチ作成 → 実装 → PR 作成 → レビュー → マージ → ブランチ削除
```

### ステップ 1: Issue の作成

作業を開始する前に、**必ず GitHub Issue を作成**してください。

- バグ修正: 「バグ報告」テンプレートを使用
- 機能追加: 「機能追加」テンプレートを使用
- Issue 番号を必ず控えておく（ブランチ名に使用）

```bash
# CLI での Issue 作成例
gh issue create --title "[Feature] 検索フィルター追加" --label "enhancement"
```

### ステップ 2: ブランチの作成

Issue 作成後、以下の命名規則でブランチを作成してください。

```
feature/#{issue番号}-{英語の短い説明}   # 機能追加
fix/#{issue番号}-{英語の短い説明}       # バグ修正
chore/#{issue番号}-{英語の短い説明}     # 依存関係更新・設定変更
docs/#{issue番号}-{英語の短い説明}      # ドキュメントのみ
refactor/#{issue番号}-{英語の短い説明} # リファクタリング
```

例:
```bash
git checkout -b feature/#5-add-search-filter
git checkout -b fix/#12-fix-contact-delete-error
```

**禁止パターン:**
- `main` で直接作業する
- Issue 番号を含まないブランチ名（例: `temp-fix`, `my-feature`）
- プレフィックスのないブランチ名

### ステップ 3: コミット規則

Conventional Commits 形式に従ってください。

```
feat: お問い合わせ検索フィルター機能を追加
fix: 削除ボタンが二重クリックで誤動作する問題を修正
docs: API 仕様書を更新
chore: pnpm パッケージを更新
refactor: ContactList コンポーネントを分割
```

### ステップ 4: PR の作成

- `main` ブランチへの直接 push は禁止です
- PR テンプレートに従って記述してください
- `Closes #Issue番号` を必ず記載して Issue と紐付けてください

```bash
gh pr create \
  --title "feat: お問い合わせ検索フィルターを追加" \
  --body "Closes #5

## 変更内容
..."
```

### ステップ 5: ブランチの削除

PR がマージされたら、リモートとローカルの両方からブランチを削除してください。
マージ済みブランチを残し続けると一覧が膨大になり管理が困難になります。

```bash
# リモートブランチの削除（PR マージ時に --delete-branch を付けると同時に削除できる）
gh pr merge --merge --delete-branch

# ローカルブランチの削除
git checkout main
git branch -d feature/#5-add-search-filter

# リモートの削除済みブランチをローカルに反映
git fetch --prune
```

---

## 初回セットアップ

### pre-push フックのインストール

クローン後、以下のコマンドを一度実行してください。main への直接 push を防ぐローカルフックが有効になります。

```bash
cp .github/hooks/pre-push .git/hooks/pre-push && chmod +x .git/hooks/pre-push
```

---

## ローカル開発環境

### 起動

```bash
docker compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### コード品質チェック

```bash
# Frontend
docker compose exec frontend pnpm lint

# Backend
docker compose exec backend bundle exec rubocop
```

---

## ブランチ戦略

| ブランチ | 用途 | 直接 push |
|---------|------|----------|
| `main` | 本番相当・常に動作する状態 | **禁止**（PR のみ） |
| `feature/*` | 機能開発 | OK |
| `fix/*` | バグ修正 | OK |
| `chore/*` | 雑務・設定 | OK |
| `docs/*` | ドキュメント | OK |
| `refactor/*` | リファクタリング | OK |
