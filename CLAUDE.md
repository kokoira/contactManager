# CLAUDE.md — Claude Code 向け開発ルール

このファイルは Claude Code が contactManager プロジェクトで作業する際に **厳守しなければならない** ルールを定義します。

---

## 絶対ルール（例外なし）

### 1. Issue ファーストの原則

**開発タスクを開始する前に、必ず GitHub Issue を作成する。**

```bash
# 機能追加の場合
gh issue create --title "[Feature] 説明" --label "enhancement"

# バグ修正の場合
gh issue create --title "[Bug] 説明" --label "bug"
```

- Issue 番号を必ず確認・記録する
- Issue なしにブランチを作成してはならない
- バグ修正・機能追加・ドキュメント更新・リファクタリング、いずれも対象

### 2. ブランチ命名規則

Issue 作成後、以下の形式でブランチを作成すること。

```
feature/#{issue番号}-{英語の短い説明}   # 機能追加
fix/#{issue番号}-{英語の短い説明}       # バグ修正
chore/#{issue番号}-{英語の短い説明}     # 設定・依存関係更新
docs/#{issue番号}-{英語の短い説明}      # ドキュメントのみ
refactor/#{issue番号}-{英語の短い説明} # リファクタリング
```

```bash
# ブランチ作成例（Issue #5 の場合）
git checkout -b feature/#5-add-search-filter
```

**禁止パターン（これらは絶対にやってはいけない）:**

```bash
# ❌ main で直接作業する
git checkout main && git add . && git commit ...

# ❌ Issue 番号なし
git checkout -b temp-fix
git checkout -b my-feature

# ❌ プレフィックスなし
git checkout -b search-filter
```

### 3. main への直接 push 禁止

```bash
# ❌ これは禁止
git push origin main

# ✅ 必ず feature/* 等のブランチから PR 経由でマージする
git push origin feature/#5-add-search-filter
gh pr create ...
```

### 4. PR 作成の義務

- main ブランチへのマージは PR 経由のみ
- `.github/pull_request_template.md` のテンプレートに従うこと
- 必ず `Closes #Issue番号` を PR 説明に含めること

```bash
# PR 作成例
gh pr create \
  --title "feat: お問い合わせ検索フィルターを追加" \
  --body "$(cat <<'EOF'
Closes #5

## 変更内容

### 変更の種類
- [x] 機能追加 (feature)

### 変更の概要
検索フィルター機能を実装した。

### 変更の詳細
...
EOF
)"
```

### 5. マージ後のブランチ削除

PR がマージされたら、リモートとローカル両方のブランチを必ず削除すること。

```bash
# PR マージと同時にリモートブランチを削除する（推奨）
gh pr merge --merge --delete-branch

# ローカルブランチを削除して main に戻る
git checkout main
git branch -d feature/#5-add-search-filter

# リモートの削除情報をローカルに反映
git fetch --prune
```

### 6. Conventional Commits

コミットメッセージは以下の形式を使うこと。

```
feat: 新機能の説明
fix: バグ修正の説明
docs: ドキュメント変更
chore: ビルド・ツール・設定変更
refactor: リファクタリング
```

---

## 開発フロー チェックリスト

Claude Code が新しいタスクを受け取ったとき、必ずこの順序で実行すること:

1. [ ] GitHub Issue を作成する (`gh issue create`)
2. [ ] Issue 番号を確認する
3. [ ] 命名規則に従いブランチを作成する (`git checkout -b feature/#N-description`)
4. [ ] 実装を行う
5. [ ] Lint を通す (`pnpm lint` / `rubocop`)
6. [ ] PR を作成する (`gh pr create`) — テンプレートに従う
7. [ ] `Closes #N` が PR 本文に含まれていることを確認する
8. [ ] PR をマージする (`gh pr merge --merge --delete-branch`)
9. [ ] ローカルブランチを削除する (`git checkout main && git branch -d ...`)
10. [ ] リモートの削除情報を反映する (`git fetch --prune`)

---

## プロジェクト構成

| 項目 | 内容 |
|------|------|
| リポジトリ | `kokoira/contactManager` |
| Frontend | Next.js 15 (TypeScript / Tailwind CSS) |
| Backend | Rails 7.2 (API モード) |
| DB | MySQL 8.0 |
| 実行環境 | Docker Compose |
| パッケージマネージャー | pnpm (frontend) / Bundler (backend) |

```
contactManager/
├── frontend/      # Next.js 15 アプリ (port 3000)
├── backend/       # Rails 7.2 API (port 3001)
├── docs/          # ドキュメント
├── .github/       # GitHub テンプレート・ガイドライン
└── docker-compose.yml
```

---

## ローカル開発コマンド

```bash
# 環境起動
docker compose up

# フロントエンド Lint
docker compose exec frontend pnpm lint

# バックエンド Lint
docker compose exec backend bundle exec rubocop

# DB マイグレーション
docker compose exec backend bundle exec rails db:migrate

# Rails コンソール
docker compose exec backend bundle exec rails console
```
