class CreateComments < ActiveRecord::Migration[7.2]
  def change
    create_table :comments do |t|
      t.references :ticket, null: false, foreign_key: true
      t.text :body, null: false
      t.string :role, null: false

      t.datetime :created_at, null: false
    end
  end
end
