class Ticket < ApplicationRecord
  has_many :comments, dependent: :destroy

  STATUSES = %w[open in_progress resolved].freeze
  PRIORITIES = %w[low medium high].freeze

  validates :title, presence: true
  validates :body, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :priority, inclusion: { in: PRIORITIES }

  default_scope { order(created_at: :desc) }

  scope :active, -> { where(deleted_at: nil) }

  def soft_delete!
    update!(deleted_at: Time.current)
  end

  def deleted?
    deleted_at.present?
  end
end
