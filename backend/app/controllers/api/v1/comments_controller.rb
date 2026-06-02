module Api
  module V1
    class CommentsController < ApplicationController
      def create
        ticket = Ticket.find(params[:ticket_id])
        comment = ticket.comments.new(comment_params)
        if comment.save
          render json: comment, status: :created
        else
          render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def comment_params
        params.require(:comment).permit(:body, :role)
      end
    end
  end
end
