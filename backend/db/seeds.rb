conn = ActiveRecord::Base.connection
conn.execute("SET FOREIGN_KEY_CHECKS=0")
conn.execute("TRUNCATE TABLE comments")
conn.execute("TRUNCATE TABLE tickets")
conn.execute("SET FOREIGN_KEY_CHECKS=1")

# 現在時刻基準でサンプルデータを作成
# 高緊急度は優先対応されるため、古いものほど解決済みに近い
# 低緊急度は後回しにされるため、古くても未対応・対応中のままになりやすい

# created_at 昇順（古い順）で挿入することで ID と日付順を一致させる
tickets = [
  {
    title: "ログインできない",
    body: "昨日まで問題なくログインできていたのですが、急にログインできなくなりました。パスワードは正しいはずです。業務に支障が出ているため、早急に対応をお願いします。",
    status: "resolved",
    priority: "high",
    created_at_offset: -6.days,
    comments: [
      { body: "ご連絡ありがとうございます。至急確認いたします。アカウントのメールアドレスを教えていただけますか？", role: "agent", offset: -6.days + 30.minutes },
      { body: "example@company.com です。よろしくお願いします。", role: "user", offset: -6.days + 1.hour },
      { body: "確認いたしました。パスワードのリセットリンクをメールで送付しましたのでご確認ください。", role: "agent", offset: -6.days + 2.hours },
      { body: "ログインできるようになりました。迅速な対応ありがとうございました！", role: "user", offset: -6.days + 3.hours }
    ]
  },
  {
    title: "メール通知が届かない",
    body: "ステータス変更時のメール通知が1週間ほど届いていません。設定画面では通知が有効になっています。急ぎではありませんが、確認していただけると助かります。",
    status: "open",
    priority: "low",
    created_at_offset: -5.days,
    comments: []
  },
  {
    title: "画面が固まって操作できない",
    body: "商品一覧ページを開くと数秒後に画面が白くなり、何も操作できなくなります。ブラウザを再起動しても同じ状況です。業務が止まっています。",
    status: "resolved",
    priority: "high",
    created_at_offset: -4.days,
    comments: [
      { body: "ご不便をおかけして申し訳ございません。使用されているブラウザとOSのバージョンを教えていただけますか？", role: "agent", offset: -4.days + 20.minutes },
      { body: "Chrome 124、Windows 11 です。", role: "user", offset: -4.days + 1.hour },
      { body: "ご報告ありがとうございます。原因を特定しました。キャッシュのクリアをお試しください。手順はこちら：設定 → プライバシー → キャッシュを削除。", role: "agent", offset: -4.days + 2.hours },
      { body: "解決しました！ありがとうございます。", role: "user", offset: -4.days + 3.hours }
    ]
  },
  {
    title: "パスワードを忘れてしまいました",
    body: "登録時のパスワードを忘れてしまいました。リセット用のメールを送ってほしいのですが、登録メールアドレスも変更した可能性があります。",
    status: "in_progress",
    priority: "medium",
    created_at_offset: -3.days,
    comments: [
      { body: "ご登録のお名前と会社名を教えていただければ、アカウントを特定いたします。", role: "agent", offset: -3.days + 1.hour },
      { body: "山田太郎、株式会社サンプルです。", role: "user", offset: -3.days + 2.hours },
      { body: "確認いたしました。新しいメールアドレスをこちらで更新しますので、ご希望のアドレスを教えていただけますか？", role: "agent", offset: -3.days + 4.hours }
    ]
  },
  {
    title: "請求書の内容を確認したい",
    body: "先月分の請求書に身に覚えのない項目が含まれています。「オプションプラン B」という項目は申し込んだ覚えがありません。",
    status: "in_progress",
    priority: "medium",
    created_at_offset: -2.days,
    comments: [
      { body: "ご連絡ありがとうございます。該当の請求書番号を教えていただけますか？", role: "agent", offset: -2.days + 2.hours },
      { body: "請求書番号は INV-2026-0512 です。", role: "user", offset: -2.days + 4.hours }
    ]
  },
  {
    title: "使い方について教えてください",
    body: "レポートのエクスポート機能はどこから操作できますか？マニュアルを見ても見つけられませんでした。お時間のあるときに教えていただければ幸いです。",
    status: "open",
    priority: "low",
    created_at_offset: -1.day,
    comments: []
  }
]

now = Time.current

tickets.each do |data|
  created = now + data[:created_at_offset]
  ticket = Ticket.create!(
    title: data[:title],
    body: data[:body],
    status: data[:status],
    priority: data[:priority],
    created_at: created,
    updated_at: created
  )

  data[:comments].each do |c|
    ticket.comments.create!(
      body: c[:body],
      role: c[:role],
      created_at: now + c[:offset]
    )
  end

  puts "Created: [#{data[:priority].upcase}/#{data[:status]}] #{ticket.title}"
end

puts "\nDone! #{Ticket.count} tickets, #{Comment.count} comments."
