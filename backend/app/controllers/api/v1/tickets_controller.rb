module Api
  module V1
    class TicketsController < ApplicationController
      def index
        tickets = params[:include_deleted] == 'true' ? Ticket.all.recent : Ticket.active.recent
        render json: tickets.as_json(include: { comments: { only: [:id, :body, :role, :created_at] } })
      end

      def show
        ticket = Ticket.find(params[:id])
        render json: ticket.as_json(include: { comments: { only: [:id, :body, :role, :created_at] } })
      end

      def create
        ticket = Ticket.new(ticket_create_params)
        if ticket.save
          render json: ticket, status: :created
        else
          render json: { errors: ticket.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        ticket = Ticket.find(params[:id])
        if ticket.update(ticket_update_params)
          render json: ticket
        else
          render json: { errors: ticket.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        ticket = Ticket.active.find(params[:id])
        ticket.soft_delete!
        head :no_content
      end

      private

      def ticket_create_params
        params.require(:ticket).permit(:title, :body, :priority)
      end

      def ticket_update_params
        params.require(:ticket).permit(:status, :priority)
      end
    end
  end
end
