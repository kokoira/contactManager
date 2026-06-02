class Comment < ApplicationRecord
  belongs_to :ticket

  ROLES = %w[user agent].freeze

  validates :body, presence: true
  validates :role, inclusion: { in: ROLES }
end
