class CreateTickets < ActiveRecord::Migration[7.2]
  def change
    create_table :tickets do |t|
      t.string :title, null: false
      t.text :body, null: false
      t.string :status, null: false, default: "open"
      t.string :priority, null: false, default: "medium"

      t.timestamps
    end
  end
end
